"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMobile } from "@/lib/use-mobile"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { pluralRu } from "./format"

const NIGHTS_MIN = 1
const NIGHTS_MAX = 28
const DEFAULT_FROM = 6
const DEFAULT_TO = 14

type Props = {
  nightsFrom: number | null
  nightsTo: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onChange: (patch: { nightsFrom: number | null; nightsTo: number | null }) => void
}

export function NightsPicker({
  nightsFrom,
  nightsTo,
  open,
  onOpenChange,
  onChange,
}: Props) {
  const isMobile = useMobile()
  const from = nightsFrom ?? DEFAULT_FROM
  const to = nightsTo ?? DEFAULT_TO
  const effectiveFrom = Math.min(from, to)
  const effectiveTo = Math.max(from, to)

  const hasRange = nightsFrom != null && nightsTo != null
  const label = hasRange
    ? `${effectiveFrom} — ${effectiveTo}`
    : `${DEFAULT_FROM} — ${DEFAULT_TO}`

  const summary = hasRange
    ? `${label} ${pluralRu(effectiveTo, "ночь", "ночи", "ночей")}`
    : label

  const nights = React.useMemo(
    () => Array.from({ length: NIGHTS_MAX - NIGHTS_MIN + 1 }, (_, i) => NIGHTS_MIN + i),
    []
  )

  const handleSelect = (value: number) => {
    if (nightsFrom == null || nightsTo != null) {
      onChange({ nightsFrom: value, nightsTo: null })
      return
    }
    const newFrom = Math.min(nightsFrom, value)
    const newTo = Math.max(nightsFrom, value)
    onChange({ nightsFrom: newFrom, nightsTo: newTo })
    if (isMobile) onOpenChange(false)
  }

  const handleClear = () => {
    onChange({ nightsFrom: null, nightsTo: null })
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="search-bar-trigger h-full w-full px-4 text-left outline-none"
        >
          <div className="flex h-full flex-col justify-center gap-0.5">
            <div className="text-xs font-normal text-gray-500">Ночей</div>
            <div className="flex items-center justify-between gap-3">
              <span
                className={cn(
                  "min-w-0 truncate text-base leading-tight whitespace-nowrap",
                  nightsFrom == null && nightsTo == null
                    ? "font-normal text-gray-500"
                    : "font-medium text-gray-900"
                )}
              >
                {summary}
              </span>
              <ChevronDown className="size-4 shrink-0 text-gray-400 hidden md:block" aria-hidden />
            </div>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[320px] max-w-[calc(100vw-2rem)] p-4"
      >
        <div className="mb-3 text-sm font-semibold text-gray-700">
          Количество ночей
        </div>
        <p className="mb-3 text-xs text-gray-500">
          Выберите диапазон: сначала «от», затем «до»
        </p>
        <div className="grid grid-cols-7 gap-1.5">
          {nights.map((n) => {
            const isFrom = effectiveFrom === n
            const isTo = effectiveTo === n
            const inRange =
              nightsFrom != null &&
              nightsTo != null &&
              n >= effectiveFrom &&
              n <= effectiveTo
            return (
              <button
                key={n}
                type="button"
                onClick={() => handleSelect(n)}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors",
                  isFrom || isTo
                    ? "bg-[#22a7f0] text-white"
                    : inRange
                      ? "bg-[#22a7f0]/20 text-[#22a7f0]"
                      : "hover:bg-gray-100 text-gray-700"
                )}
              >
                {n}
              </button>
            )
          })}
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
            Очистить
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Готово
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
