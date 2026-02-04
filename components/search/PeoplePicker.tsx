"use client"

import * as React from "react"
import { ChevronDown, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { pluralRu } from "./format"

type Props = {
  adults: number
  childrenCount: number
  childrenAges: number[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onChange: (patch: { adults: number; children: number; childrenAges: number[] }) => void
}

function clampInt(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.trunc(value)))
}

export function PeoplePicker({
  adults,
  childrenCount,
  childrenAges,
  open,
  onOpenChange,
  onChange,
}: Props) {
  const a = clampInt(adults || 2, 1, 8)
  const c = clampInt(childrenCount || 0, 0, 4)

  const label = React.useMemo(() => {
    const adultLabel = `${a} ${pluralRu(a, "взрослый", "взрослых", "взрослых")}`
    if (c <= 0) return adultLabel
    const kidsLabel = `${c} ${pluralRu(c, "ребенок", "ребенка", "детей")}`
    return `${adultLabel}, ${kidsLabel}`
  }, [a, c])

  const ages = React.useMemo(() => {
    const next = childrenAges.slice(0, c)
    while (next.length < c) next.push(7)
    return next
  }, [childrenAges, c])

  function setAdults(next: number) {
    onChange({ adults: clampInt(next, 1, 8), children: c, childrenAges: ages })
  }

  function setChildren(next: number) {
    const nextChildren = clampInt(next, 0, 4)
    const nextAges = ages.slice(0, nextChildren)
    while (nextAges.length < nextChildren) nextAges.push(7)
    onChange({ adults: a, children: nextChildren, childrenAges: nextAges })
  }

  function setAge(idx: number, value: number) {
    const next = ages.slice()
    next[idx] = value
    onChange({ adults: a, children: c, childrenAges: next })
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="search-bar-trigger h-full w-full px-4 text-left outline-none"
        >
          <div className="flex h-full flex-col justify-center gap-0.5">
            <div className="text-xs font-normal text-gray-500">Сколько человек</div>
            <div className="flex items-center justify-between gap-3">
              <span className="min-w-0 truncate text-base font-medium leading-tight text-gray-900 whitespace-nowrap">
                {label}
              </span>
              <ChevronDown className="size-4 shrink-0 text-gray-400" aria-hidden />
            </div>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[420px] max-w-[calc(100vw-2rem)] p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold">Взрослые</div>
              <div className="text-xs text-gray-500">старше 17 лет</div>
            </div>
            <div className="flex items-center rounded-xl bg-gray-50 p-1">
              <button
                type="button"
                onClick={() => setAdults(a - 1)}
                className="h-10 w-10 rounded-lg text-xl text-gray-700 hover:bg-white"
              >
                –
              </button>
              <div className="w-10 text-center font-semibold">{a}</div>
              <button
                type="button"
                onClick={() => setAdults(a + 1)}
                className="h-10 w-10 rounded-lg text-xl text-gray-700 hover:bg-white"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold">Дети</div>
              <div className="text-xs text-gray-500">до 17 лет</div>
            </div>
            <div className="flex items-center rounded-xl bg-gray-50 p-1">
              <button
                type="button"
                onClick={() => setChildren(c - 1)}
                className="h-10 w-10 rounded-lg text-xl text-gray-700 hover:bg-white"
              >
                –
              </button>
              <div className="w-10 text-center font-semibold">{c}</div>
              <button
                type="button"
                onClick={() => setChildren(c + 1)}
                className="h-10 w-10 rounded-lg text-xl text-gray-700 hover:bg-white"
              >
                +
              </button>
            </div>
          </div>

          {c > 0 && (
            <div className="rounded-2xl border border-gray-100 p-3">
              <div className="text-sm font-semibold mb-2">Возраст детей</div>
              <div className="space-y-2">
                {ages.map((age, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3">
                    <div className="text-sm text-gray-700">Ребенок {idx + 1}</div>
                    <Select
                      value={String(age)}
                      onValueChange={(v) => setAge(idx, Number.parseInt(v, 10))}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 18 }).map((_, n) => (
                          <SelectItem key={n} value={String(n)}>
                            {n} лет
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setChildren(c + 1)}
            className="flex w-full items-center gap-3 rounded-xl border border-gray-200 px-3 py-3 text-sm font-semibold hover:bg-gray-50"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
              <Plus className="size-4" />
            </span>
            добавить ребенка
          </button>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Готово
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

