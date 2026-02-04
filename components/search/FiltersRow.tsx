"use client"

import * as React from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SearchQueryState } from "./SearchFormState"
import {
  DEFAULT_BUDGET_MIN,
  DEFAULT_BUDGET_MAX,
} from "./SearchFormState"

type Props = {
  state: SearchQueryState
  className?: string
}

/** Pills row below search bar: secondary visual, reduced contrast */
export function FiltersRow({ state, className }: Props) {
  const hasDefaultBudget =
    state.budgetMin === DEFAULT_BUDGET_MIN && state.budgetMax === DEFAULT_BUDGET_MAX
  const budgetLabel = hasDefaultBudget
    ? "Любой бюджет"
    : `${(state.budgetMin / 1_000).toFixed(0)} – ${(state.budgetMax / 1_000).toFixed(0)} тыс. ₸`

  const starsLabel =
    state.stars !== null && state.stars >= 1 && state.stars <= 5
      ? `${state.stars}★`
      : "Любой класс"

  const hasFamily =
    state.family.animation ||
    state.family.kidsPool ||
    state.family.kidsClub ||
    state.family.playground

  return (
    <div
      className={cn(
        "mt-4 md:mt-5 flex flex-wrap items-center gap-2 md:gap-3",
        "opacity-90 text-muted-foreground",
        className
      )}
    >
      <span
        className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white/80 px-3 py-1.5 text-sm font-normal text-gray-600"
        aria-label="Класс отеля"
      >
        <Star className="size-3.5 text-amber-500" aria-hidden />
        {starsLabel}
      </span>
      <span
        className="inline-flex items-center rounded-full border border-gray-200 bg-white/80 px-3 py-1.5 text-sm font-normal text-gray-600"
      >
        {budgetLabel}
      </span>
      {hasFamily && (
        <span className="inline-flex items-center rounded-full border border-gray-200 bg-white/80 px-3 py-1.5 text-sm font-normal text-gray-600">
          Для семей
        </span>
      )}
    </div>
  )
}
