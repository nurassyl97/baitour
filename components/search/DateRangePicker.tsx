"use client"

import * as React from "react"
import { addDays, differenceInDays, isValid } from "date-fns"
import type { DateRange } from "react-day-picker"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { TravelDateCalendar } from "@/components/ui/travel-date-calendar"
import { formatShortDateRu, pluralRu } from "./format"

type Props = {
  dateFrom: string | null
  dateTo: string | null
  nightsFrom: number | null
  nightsTo: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onChange: (patch: {
    dateFrom: string | null
    dateTo: string | null
    nightsFrom: number | null
    nightsTo: number | null
  }) => void
}

/** Parse "YYYY-MM-DD" as local midnight (no UTC shift). */
function toDate(value: string | null): Date | undefined {
  if (!value) return undefined
  const [y, m, d] = value.split("-").map(Number)
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return undefined
  const date = new Date(y, m - 1, d)
  return isValid(date) ? date : undefined
}

/** Format Date as local calendar date YYYY-MM-DD (never use toISOString — it shifts day in UTC). */
function toISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function DateRangePicker({
  dateFrom,
  dateTo,
  nightsFrom,
  nightsTo,
  open,
  onOpenChange,
  onChange,
}: Props) {
  const from = toDate(dateFrom)
  const to = toDate(dateTo)

  const selected: DateRange | undefined =
    from || to ? { from, to } : undefined

  const nights = React.useMemo(() => {
    if (!from || !to) return null
    const diff = differenceInDays(to, from)
    if (!Number.isFinite(diff) || diff <= 0) return null
    return diff
  }, [from, to])

  const summary = React.useMemo(() => {
    if (!from || !to) return "Выберите даты"
    const df = formatShortDateRu(toISO(from))
    const dt = formatShortDateRu(toISO(to))
    const n = nights ?? nightsFrom ?? nightsTo
    const nText =
      n && n > 0
        ? `${n} ${pluralRu(n, "ночь", "ночи", "ночей")}`
        : ""
    return `${df} — ${dt}${nText ? `, ${nText}` : ""}`
  }, [from, to, nights, nightsFrom, nightsTo])
  const isPlaceholder = !from || !to

  const minDate = React.useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
  }, [])

  function handleSelect(range: DateRange | undefined) {
    const nextFrom = range?.from
    const nextTo = range?.to

    // 1) Only start date chosen → keep calendar open (do not close)
    if (nextFrom && !nextTo) {
      onChange({
        dateFrom: toISO(nextFrom),
        dateTo: null,
        nightsFrom: null,
        nightsTo: null,
      })
      return
    }

    // 2) Both dates chosen and end > start → update and close (range complete)
    if (nextFrom && nextTo) {
      const n = differenceInDays(nextTo, nextFrom)
      const safe = Number.isFinite(n) && n > 0 ? n : null
      onChange({
        dateFrom: toISO(nextFrom),
        dateTo: toISO(nextTo),
        nightsFrom: safe,
        nightsTo: safe,
      })
      // Auto-close only when range is complete (both dates, end after start)
      if (safe != null) onOpenChange(false)
      return
    }

    // 3) Clear selection
    onChange({ dateFrom: null, dateTo: null, nightsFrom: null, nightsTo: null })
  }

  function handleClear() {
    onChange({ dateFrom: null, dateTo: null, nightsFrom: null, nightsTo: null })
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="search-bar-trigger h-full w-full px-4 text-left outline-none"
        >
          <div className="flex h-full flex-col justify-center gap-0.5">
            <div className="text-xs font-normal text-gray-500">Даты поездки</div>
            <div className="flex items-center justify-between gap-3">
              <span
                className={cn(
                  "min-w-0 truncate text-base leading-tight whitespace-nowrap",
                  isPlaceholder ? "font-normal text-gray-500" : "font-medium text-gray-900"
                )}
              >
                {summary}
              </span>
              <ChevronDown className="size-4 shrink-0 text-gray-400" aria-hidden />
            </div>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto max-w-[calc(100vw-2rem)] p-0 border-0 shadow-none">
        <TravelDateCalendar
          selected={selected}
          onSelect={handleSelect}
          onClear={handleClear}
          onDone={() => onOpenChange(false)}
          fromDate={minDate}
          defaultMonth={from ?? addDays(minDate, 7)}
        />
      </PopoverContent>
    </Popover>
  )
}

