import type { SearchParams } from "@/lib/data";

export type FamilyFilters = {
  animation: boolean;
  kidsPool: boolean;
  kidsClub: boolean;
  playground: boolean;
};

export type SearchQueryState = {
  // Search mode (existing)
  searchType: string; // "tours" | "hotels" | "hot"

  // Server-search driving params (we keep these compatible with SearchParams keys)
  departureId: number | null;
  country: string | null;
  dateFrom: string | null; // YYYY-MM-DD
  dateTo: string | null; // YYYY-MM-DD
  nightsFrom: number | null;
  nightsTo: number | null;
  adults: number;
  children: number;

  // UX-only (persisted in URL, not sent to backend yet)
  resorts: string[]; // multi-selection of resorts within a country
  childrenAges: number[]; // per-child ages

  // Client-side filters (persisted in URL)
  sortBy: NonNullable<SearchParams["sortBy"]>;
  budgetMin: number;
  budgetMax: number;
  stars: number | null; // 1..5
  family: FamilyFilters;

  // Search trigger token to avoid refetch on filter tweaks
  submit: number; // epoch ms; changing it triggers API search
};

export const DEFAULT_BUDGET_MIN = 0;
export const DEFAULT_BUDGET_MAX = 3_000_000;
export const DEFAULT_ADULTS = 2;
export const DEFAULT_CHILDREN = 0;
export const DEFAULT_SORT: NonNullable<SearchParams["sortBy"]> = "rating";
export const DEFAULT_DEPARTURE_ID = Number(
  process.env.NEXT_PUBLIC_DEFAULT_DEPARTURE_ID || 27
);

export function emptyFamily(): FamilyFilters {
  return { animation: false, kidsPool: false, kidsClub: false, playground: false };
}

function clampInt(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.trunc(value)));
}

function parseIntSafe(value: string | null): number | null {
  if (!value) return null;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

function parseNumberSafe(value: string | null): number | null {
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function parseCsvOrRepeat(sp: URLSearchParams, key: string): string[] {
  const all = sp.getAll(key).filter(Boolean);
  if (all.length > 1) return all;
  const single = sp.get(key);
  if (!single) return all;
  if (!single.includes(",")) return single ? [single] : [];
  return single
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseNumbersCsvOrRepeat(sp: URLSearchParams, key: string): number[] {
  const raw = parseCsvOrRepeat(sp, key);
  return raw
    .map((v) => Number.parseInt(v, 10))
    .filter((n) => Number.isFinite(n));
}

function parseBoolean(value: string | null): boolean {
  if (!value) return false;
  return value === "1" || value === "true" || value === "yes" || value === "on";
}

export function parseSearchQuery(searchParams: URLSearchParams): SearchQueryState {
  const searchType = searchParams.get("searchType") || "tours";

  const departureId = parseIntSafe(searchParams.get("departureId"));
  const country = searchParams.get("country");

  // Back-compat: previous version used `city` for a single resort.
  const city = searchParams.get("city");
  const resorts = parseCsvOrRepeat(searchParams, "resorts");
  const finalResorts = resorts.length > 0 ? resorts : city ? [city] : [];

  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  const nightsFrom = parseIntSafe(searchParams.get("nightsFrom"));
  const nightsTo = parseIntSafe(searchParams.get("nightsTo"));

  const adults = clampInt(parseIntSafe(searchParams.get("adults")) ?? DEFAULT_ADULTS, 1, 8);
  const children = clampInt(parseIntSafe(searchParams.get("children")) ?? DEFAULT_CHILDREN, 0, 4);

  const childrenAges = parseNumbersCsvOrRepeat(searchParams, "childrenAges");

  const sortByRaw = searchParams.get("sortBy") as SearchQueryState["sortBy"] | null;
  const sortBy: SearchQueryState["sortBy"] =
    sortByRaw === "price-asc" || sortByRaw === "price-desc" || sortByRaw === "rating" || sortByRaw === "duration"
      ? sortByRaw
      : DEFAULT_SORT;

  // Accept either budgetMin/budgetMax or existing minPrice/maxPrice
  const budgetMin =
    parseNumberSafe(searchParams.get("budgetMin")) ??
    parseNumberSafe(searchParams.get("minPrice")) ??
    DEFAULT_BUDGET_MIN;
  const budgetMax =
    parseNumberSafe(searchParams.get("budgetMax")) ??
    parseNumberSafe(searchParams.get("maxPrice")) ??
    DEFAULT_BUDGET_MAX;

  const stars =
    parseIntSafe(searchParams.get("stars")) ??
    parseIntSafe(searchParams.get("hotelStars"));

  const family: FamilyFilters = {
    animation: parseBoolean(searchParams.get("ff_animation")),
    kidsPool: parseBoolean(searchParams.get("ff_kidsPool")),
    kidsClub: parseBoolean(searchParams.get("ff_kidsClub")),
    playground: parseBoolean(searchParams.get("ff_playground")),
  };

  const submit = parseNumberSafe(searchParams.get("submit")) ?? 0;

  return {
    searchType,
    departureId: departureId ?? null,
    country: country || null,
    dateFrom: dateFrom || null,
    dateTo: dateTo || null,
    nightsFrom: nightsFrom ?? null,
    nightsTo: nightsTo ?? null,
    adults,
    children,
    resorts: finalResorts,
    childrenAges,
    sortBy,
    budgetMin: Math.max(0, Math.round(budgetMin)),
    budgetMax: Math.max(0, Math.round(budgetMax)),
    stars: stars && stars >= 1 && stars <= 5 ? stars : null,
    family,
    submit: Number.isFinite(submit) ? submit : 0,
  };
}

export function buildSearchParams(state: SearchQueryState): URLSearchParams {
  const sp = new URLSearchParams();

  sp.set("searchType", state.searchType);

  if (state.departureId) sp.set("departureId", String(state.departureId));
  if (state.country) sp.set("country", state.country);

  // Persist multi resorts; keep legacy `city` empty (we no longer write it)
  state.resorts.forEach((r) => sp.append("resorts", r));

  if (state.dateFrom) sp.set("dateFrom", state.dateFrom);
  if (state.dateTo) sp.set("dateTo", state.dateTo);
  if (state.nightsFrom !== null) sp.set("nightsFrom", String(state.nightsFrom));
  if (state.nightsTo !== null) sp.set("nightsTo", String(state.nightsTo));

  sp.set("adults", String(state.adults));
  sp.set("children", String(state.children));
  state.childrenAges.forEach((age) => sp.append("childrenAges", String(age)));

  sp.set("sortBy", state.sortBy);

  // Keep client filters in URL, but they should not force a refetch.
  sp.set("budgetMin", String(state.budgetMin));
  sp.set("budgetMax", String(state.budgetMax));
  if (state.stars) sp.set("stars", String(state.stars));

  if (state.family.animation) sp.set("ff_animation", "1");
  if (state.family.kidsPool) sp.set("ff_kidsPool", "1");
  if (state.family.kidsClub) sp.set("ff_kidsClub", "1");
  if (state.family.playground) sp.set("ff_playground", "1");

  if (state.submit) sp.set("submit", String(state.submit));

  return sp;
}

export function toServerSearchParams(state: SearchQueryState): SearchParams {
  return {
    country: state.country || undefined,
    // NOTE: We intentionally do NOT send multi-resort selection to API yet.
    // It is applied client-side.
    departureId: state.departureId ?? undefined,
    dateFrom: state.dateFrom || undefined,
    dateTo: state.dateTo || undefined,
    nightsFrom: state.nightsFrom ?? undefined,
    nightsTo: state.nightsTo ?? undefined,
    adults: state.adults,
    children: state.children,
    // childrenAges is part of SearchParams, but Tourvisor trial endpoint rejected it earlier.
    // Keep it out of server request for now; the URL still persists it.
    sortBy: undefined,
    minPrice: undefined,
    maxPrice: undefined,
  };
}

