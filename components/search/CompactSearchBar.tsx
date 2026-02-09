"use client";

import * as React from "react";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatShortDateRu, pluralRu } from "./format";
import type { SearchQueryState } from "./SearchFormState";

type Props = {
  state: SearchQueryState;
  onEditClick: () => void;
  className?: string;
};

function toDate(value: string | null): Date | undefined {
  if (!value) return undefined;
  const [y, m, d] = value.split("-").map(Number);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return undefined;
  const date = new Date(y, m - 1, d);
  return Number.isFinite(date.getTime()) ? date : undefined;
}

export function CompactSearchBar({ state, onEditClick, className }: Props) {
  const [departureName, setDepartureName] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (state.departureId == null) {
      setDepartureName(null);
      return;
    }
    let mounted = true;
    fetch("/api/departures?departureCountryId=3")
      .then((r) => r.json())
      .then((data: { departures?: { id: number; name: string }[] }) => {
        if (!mounted) return;
        const d = data.departures?.find((x) => x.id === state.departureId);
        setDepartureName(d?.name ?? null);
      })
      .catch(() => {
        if (mounted) setDepartureName(null);
      });
    return () => {
      mounted = false;
    };
  }, [state.departureId]);

  const title =
    state.country && departureName
      ? `${departureName} — ${state.country}`
      : state.country
        ? state.country
        : "Поиск туров";

  const from = toDate(state.dateFrom);
  const to = toDate(state.dateTo);
  const nights =
    from && to && to > from
      ? Math.round((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000))
      : null;
  const dateRange =
    from && to
      ? `${formatShortDateRu(state.dateFrom!)} — ${formatShortDateRu(state.dateTo!)}`
      : "";
  const guests =
    state.children > 0
      ? `${state.adults} ${pluralRu(state.adults, "взрослый", "взрослых", "взрослых")}, ${state.children} ${pluralRu(state.children, "ребенок", "ребенка", "детей")}`
      : `${state.adults} ${pluralRu(state.adults, "взрослый", "взрослых", "взрослых")}`;

  const parts: string[] = [];
  if (nights != null && nights > 0) parts.push(`${nights} ${pluralRu(nights, "ночь", "ночи", "ночей")}`);
  if (dateRange) parts.push(dateRange);
  parts.push(guests);
  const subtitle = parts.join(" · ");

  return (
    <div
      className={cn(
        "sticky top-0 z-[40] pt-[env(safe-area-inset-top)] px-4 md:hidden",
        className
      )}
    >
      <div
        className={cn(
          "ds-container flex items-center justify-between gap-3 min-h-[56px]",
          "rounded-2xl border border-[var(--border)] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]",
          "px-4"
        )}
      >
        <div className="min-w-0 flex-1 py-3">
          <div className="text-sm font-semibold text-[#0F172A] truncate">{title}</div>
          <div className="text-xs text-[#64748B] truncate">{subtitle}</div>
        </div>
        <button
          type="button"
          onClick={onEditClick}
          className="shrink-0 flex items-center justify-center h-10 w-10 rounded-xl border border-[var(--border)] bg-[#F9FAFB] text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-colors"
          aria-label="Изменить поиск"
        >
          <Pencil className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
