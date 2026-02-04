"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { ru } from "date-fns/locale"
import { addDays, differenceInDays, subDays } from "date-fns"
import type { DateRange } from "react-day-picker"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { pluralRu } from "@/components/search/format"

/* DESIGN STANDARDS (LOCKED) - Travel Date Range Calendar */

const TRAVEL_CALENDAR = {
  primary: "#22a7f0",
  background: "#FFFFFF",
  border: "#E5E7EB",
  textMain: "#0F172A",
  textSecondary: "#64748B",
  hoverBg: "#F1F5F9",
  rangeBg: "#DCFCE7",
  inactive: "#CBD5E1",
} as const

export type TravelDateCalendarProps = {
  selected?: DateRange
  onSelect?: (range: DateRange | undefined) => void
  onClear?: () => void
  onDone?: () => void
  fromDate?: Date
  defaultMonth?: Date
  /** Optional: controlled open state for "Готово" to close parent */
  className?: string
}

export function TravelDateCalendar({
  selected,
  onSelect,
  onClear,
  onDone,
  fromDate,
  defaultMonth,
  className,
}: TravelDateCalendarProps) {
  const [hoveredDate, setHoveredDate] = React.useState<Date | null>(null)

  const nights = React.useMemo(() => {
    const from = selected?.from
    const to = selected?.to
    if (!from || !to) return null
    const diff = differenceInDays(to, from)
    return Number.isFinite(diff) && diff > 0 ? diff : null
  }, [selected?.from, selected?.to])

  const minDate = fromDate ?? (() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })()

  const showHoverPreview = Boolean(
    selected?.from && !selected?.to && hoveredDate && hoveredDate.getTime() >= (selected.from?.getTime() ?? 0)
  )
  const hoverFrom = selected?.from ?? null
  const hoverTo = showHoverPreview ? hoveredDate : null

  return (
    <div
      className={cn(
        "bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] shadow-[0_10px_30px_rgba(0,0,0,0.08)]",
        "w-full max-w-[720px] p-6",
        "max-md:p-4 max-md:rounded-t-2xl max-md:rounded-b-none",
        className
      )}
    >
      {/* Header: 48px, flex space-between, icon + title left, nights right, mb-16px */}
      <div className="flex h-12 items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 text-[#64748B]" aria-hidden />
          <span className="text-[16px] font-semibold leading-6 text-[#0F172A]">
            Выберите даты
          </span>
        </div>
        <span className="text-[14px] font-medium text-[#64748B]">
          {nights != null && nights > 0
            ? `${nights} ${pluralRu(nights, "ночь", "ночи", "ночей")}`
            : ""}
        </span>
      </div>

      {/* DayPicker with spec classNames */}
      <DayPicker
        mode="range"
        locale={ru}
        numberOfMonths={2}
        selected={showHoverPreview && hoverFrom && hoverTo ? { from: hoverFrom, to: hoverTo } : selected}
        onSelect={onSelect}
        fromDate={minDate}
        onDayMouseEnter={(date) => {
          if (selected?.from && !selected?.to) setHoveredDate(date)
        }}
        onDayMouseLeave={() => setHoveredDate(null)}
        defaultMonth={defaultMonth ?? addDays(minDate, 7)}
        showOutsideDays
        className="p-0"
        classNames={{
          root: "w-full",
          months: "flex flex-col md:flex-row gap-8",
          month: "w-full md:w-[320px]",
          month_caption: "flex justify-center items-center relative mb-3",
          caption_label: "text-[16px] font-semibold leading-6 text-[#0F172A]",
          nav: "flex items-center justify-between gap-1",
          button_previous:
            "absolute left-0 h-8 w-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] text-[#0F172A]",
          button_next:
            "absolute right-0 h-8 w-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] text-[#0F172A]",
          month_grid: "w-full",
          weekdays: "grid grid-cols-7",
          weekday:
            "h-8 flex items-center justify-center text-[12px] font-medium text-[#64748B] tracking-[0.04em]",
          weeks: "flex flex-col gap-2",
          week: "grid grid-cols-7 gap-2",
          day: "relative flex items-center justify-center",
          day_button:
            "h-11 w-11 flex items-center justify-center text-[14px] font-medium leading-5 rounded-lg cursor-pointer text-[#0F172A] hover:bg-[#F1F5F9] focus:outline-none",
          range_start:
            "!bg-[#22a7f0] !text-white rounded-full hover:!bg-[#22a7f0] hover:!text-white",
          range_end:
            "!bg-[#22a7f0] !text-white rounded-full hover:!bg-[#22a7f0] hover:!text-white",
          range_middle:
            "!bg-[#22a7f0]/50 !text-[#0F172A] rounded-none hover:!bg-[#22a7f0]/50 hover:!text-[#0F172A]",
          selected:
            "!bg-[#22a7f0] !text-white rounded-full hover:!bg-[#22a7f0] hover:!text-white",
          outside:
            "!text-[#CBD5E1] opacity-50 pointer-events-none aria-selected:!bg-[#22a7f0]/50 aria-selected:!text-[#0F172A]",
          disabled:
            "!text-[#CBD5E1] opacity-50 pointer-events-none",
          today: "bg-transparent text-[#0F172A] font-medium",
          hidden: "invisible",
        }}
        modifiers={{
          range_start: selected?.from ? [selected.from] : [],
          range_end: selected?.to ? [selected.to] : [],
          range_middle:
            selected?.from && selected?.to
              ? (date: Date) => {
                  const from = selected.from!
                  const to = selected.to!
                  const time = date.getTime()
                  return time > from.getTime() && time < to.getTime()
                }
              : [],
          range_middle_left_edge:
            selected?.from && selected?.to && nights != null && nights >= 2
              ? [addDays(selected.from, 1)]
              : [],
          range_middle_right_edge:
            selected?.from && selected?.to && nights != null && nights >= 2
              ? [subDays(selected.to, 1)]
              : [],
        }}
        modifiersClassNames={{
          range_start: "!rounded-full",
          range_end: "!rounded-full",
          range_middle: "rounded-none",
          range_middle_left_edge: "!rounded-l-[22px]",
          range_middle_right_edge: "!rounded-r-[22px]",
        }}
        components={{
          Chevron: ({ orientation, ...p }) =>
            orientation === "left" ? (
              <ChevronLeft className="size-4" {...p} />
            ) : (
              <ChevronRight className="size-4" {...p} />
            ),
        }}
      />

      {/* Footer: 56px, mt-16, pt-16, border-top, flex space-between */}
      <div className="mt-4 pt-4 border-t border-[#E5E7EB] flex items-center justify-between min-h-[56px]">
        <button
          type="button"
          onClick={onClear}
          className="h-10 px-4 text-[14px] font-medium text-[#64748B] hover:text-[#0F172A] transition-colors"
        >
          Очистить
        </button>
        <button
          type="button"
          onClick={onDone}
          className="h-10 px-5 text-[14px] font-semibold bg-[#22a7f0] text-white rounded-[10px] hover:opacity-95 transition-opacity"
        >
          Готово
        </button>
      </div>
    </div>
  )
}
