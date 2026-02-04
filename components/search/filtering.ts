import type { Tour } from "@/lib/data"
import type { FamilyFilters, SearchQueryState } from "./SearchFormState"

function deriveStars(tour: Tour): number | null {
  // Best-effort: use `hotel.rating` as a proxy; clamp to 1..5
  const raw = tour.hotel?.rating ?? tour.rating
  if (!Number.isFinite(raw)) return null
  const rounded = Math.round(raw)
  if (rounded < 1 || rounded > 5) return null
  return rounded
}

function matchFamily(tour: Tour, family: FamilyFilters): boolean {
  const text = `${tour.name}\n${tour.description}\n${tour.highlights.join(" ")}\n${tour.included.join(
    " "
  )}`.toLowerCase()

  const checks: Array<[boolean, string[]]> = [
    [family.animation, ["анимац", "animation"]],
    [family.kidsPool, ["детск", "kids pool", "детский басс"]],
    [family.kidsClub, ["детск", "kids club", "детский клуб"]],
    [family.playground, ["площадк", "playground"]],
  ]

  for (const [enabled, keywords] of checks) {
    if (!enabled) continue
    if (!keywords.some((k) => text.includes(k))) return false
  }
  return true
}

export function applyClientFilters(
  tours: Tour[],
  state: Pick<
    SearchQueryState,
    "resorts" | "budgetMin" | "budgetMax" | "stars" | "family" | "sortBy"
  >
): Tour[] {
  const { resorts, budgetMin, budgetMax, stars, family, sortBy } = state

  let result = tours.slice()

  // Resorts (multi)
  if (resorts.length > 0) {
    const set = new Set(resorts.map((r) => r.toLowerCase()))
    result = result.filter((t) => set.has(t.city.toLowerCase()))
  }

  // Budget
  result = result.filter((t) => t.price >= budgetMin && t.price <= budgetMax)

  // Stars
  if (stars) {
    result = result.filter((t) => deriveStars(t) === stars)
  }

  // Family-friendly (best-effort keyword match for now)
  result = result.filter((t) => matchFamily(t, family))

  // Sort
  switch (sortBy) {
    case "price-asc":
      result.sort((a, b) => a.price - b.price)
      break
    case "price-desc":
      result.sort((a, b) => b.price - a.price)
      break
    case "rating":
      result.sort((a, b) => b.rating - a.rating)
      break
    case "duration":
      // Best-effort: keep stable; duration parsing can be added later
      break
  }

  return result
}

