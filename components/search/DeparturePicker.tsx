"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { useMobile } from "@/lib/use-mobile"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type Departure = { id: number; name: string }

type Props = {
  value: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onChange: (departureId: number | null) => void
}

export function DeparturePicker({ value, open, onOpenChange, onChange }: Props) {
  const isMobile = useMobile()
  const [departures, setDepartures] = React.useState<Departure[]>([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const res = await fetch("/api/departures?departureCountryId=3")
        if (!res.ok) return
        const data = (await res.json()) as { departures?: Departure[] }
        if (!mounted) return
        setDepartures(data.departures ?? [])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const current = departures.find((d) => d.id === value) ?? null
  const isPlaceholder = !current

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="search-bar-trigger h-full w-full px-4 text-left outline-none"
        >
          <div className="flex h-full flex-col justify-center gap-0.5">
            <div className="text-xs font-normal text-gray-500">Откуда вылет</div>
            <div className="flex items-center justify-between gap-3">
              <span
                className={cn(
                  "min-w-0 truncate text-base leading-tight whitespace-nowrap",
                  isPlaceholder ? "font-normal text-gray-500" : "font-medium text-gray-900"
                )}
              >
                {loading ? "Загрузка..." : current?.name || "Выберите город"}
              </span>
              <ChevronDown className="size-4 shrink-0 text-gray-400 hidden md:block" aria-hidden />
            </div>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[360px] p-2">
        <div className="max-h-80 overflow-auto p-1">
          {departures.map((d) => {
            const isActive = d.id === value
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  onChange(d.id)
                  if (isMobile) onOpenChange(false)
                }}
                className={cn(
                  "w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-gray-50",
                  isActive ? "bg-blue-50 font-semibold" : ""
                )}
              >
                {d.name}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

