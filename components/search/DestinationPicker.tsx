"use client"

import * as React from "react"
import { ChevronDown, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { useMobile } from "@/lib/use-mobile"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

type Props = {
  country: string | null
  resorts: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onChange: (patch: { country: string | null; resorts: string[] }) => void
}

export function DestinationPicker({
  country,
  resorts,
  open,
  onOpenChange,
  onChange,
}: Props) {
  const isMobile = useMobile()
  const [countries, setCountries] = React.useState<string[]>([])
  const [countriesLoading, setCountriesLoading] = React.useState(false)
  const [countriesError, setCountriesError] = React.useState<string | null>(null)

  const [cities, setCities] = React.useState<string[]>([])
  const [citiesLoading, setCitiesLoading] = React.useState(false)

  const [countryQuery, setCountryQuery] = React.useState("")
  const [resortQuery, setResortQuery] = React.useState("")

  React.useEffect(() => {
    let mounted = true
    async function loadCountries() {
      setCountriesLoading(true)
      setCountriesError(null)
      try {
        const res = await fetch("/api/countries")
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as { countries?: string[] }
        if (!mounted) return
        setCountries(data.countries ?? [])
      } catch {
        if (!mounted) return
        setCountries([])
        setCountriesError("Не удалось загрузить страны")
      } finally {
        if (mounted) setCountriesLoading(false)
      }
    }
    loadCountries()
    return () => {
      mounted = false
    }
  }, [])

  React.useEffect(() => {
    let mounted = true
    async function loadCities() {
      if (!country) {
        setCities([])
        return
      }
      setCitiesLoading(true)
      try {
        const res = await fetch(`/api/cities?country=${encodeURIComponent(country)}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as { cities?: string[] }
        if (!mounted) return
        setCities(data.cities ?? [])
      } catch {
        if (!mounted) return
        setCities([])
      } finally {
        if (mounted) setCitiesLoading(false)
      }
    }
    loadCities()
    return () => {
      mounted = false
    }
  }, [country])

  const summary = React.useMemo(() => {
    if (!country) return "Страна / курорт"
    if (resorts.length === 0) return `${country}, Все курорты`
    if (resorts.length === 1) return `${country}, ${resorts[0]}`
    return `${country}, ${resorts.length} курорта`
  }, [country, resorts])

  const filteredCountries = React.useMemo(() => {
    const q = countryQuery.trim().toLowerCase()
    if (!q) return countries
    return countries.filter((c) => c.toLowerCase().includes(q))
  }, [countries, countryQuery])

  const filteredCities = React.useMemo(() => {
    const q = resortQuery.trim().toLowerCase()
    if (!q) return cities
    return cities.filter((c) => c.toLowerCase().includes(q))
  }, [cities, resortQuery])

  function toggleResort(name: string, checked: boolean) {
    const next = new Set(resorts)
    if (checked) next.add(name)
    else next.delete(name)
    onChange({ country, resorts: Array.from(next) })
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="search-bar-trigger h-full w-full px-4 text-left outline-none"
        >
          <div className="flex h-full flex-col justify-center gap-0.5">
            <div className="text-xs font-normal text-gray-500">Куда поедем</div>
            <div className="flex items-center justify-between gap-3">
              <span
                className={cn(
                  "min-w-0 truncate text-base leading-tight whitespace-nowrap",
                  country ? "font-medium text-gray-900" : "font-normal text-gray-500"
                )}
              >
                {countriesLoading ? "Загрузка..." : summary}
              </span>
              <ChevronDown className="size-4 shrink-0 text-gray-400" aria-hidden />
            </div>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[720px] max-w-[calc(100vw-2rem)] p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Countries */}
          <div className="rounded-xl border border-gray-100 p-2">
            <div className="px-2 pb-2 text-xs font-semibold text-gray-500">Страны</div>
            <div className="px-2 pb-2">
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
                <Search className="size-4 text-gray-400" />
                <input
                  value={countryQuery}
                  onChange={(e) => setCountryQuery(e.target.value)}
                  placeholder="Поиск страны"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </div>
            {countriesError && (
              <div className="px-2 pb-2 text-xs text-red-600">{countriesError}</div>
            )}
            <div className="max-h-80 overflow-auto p-1">
              {filteredCountries.map((c) => {
                const isActive = c === country
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      onChange({ country: c, resorts: [] })
                      if (isMobile) onOpenChange(false)
                    }}
                    className={cn(
                      "w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-gray-50",
                      isActive ? "bg-gray-100 font-semibold" : ""
                    )}
                  >
                    {c}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Resorts */}
          <div className="rounded-xl border border-gray-100 p-2">
            <div className="px-2 pb-2 text-xs font-semibold text-gray-500">Курорты</div>
            <div className="px-2 pb-2">
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
                <Search className="size-4 text-gray-400" />
                <input
                  value={resortQuery}
                  onChange={(e) => setResortQuery(e.target.value)}
                  placeholder={country ? "Поиск курорта" : "Сначала выберите страну"}
                  disabled={!country}
                  className="w-full bg-transparent text-sm outline-none disabled:opacity-50"
                />
              </div>
            </div>
            {!country ? (
              <div className="px-3 py-8 text-sm text-gray-500">Выберите страну слева</div>
            ) : (
              <div className="max-h-80 overflow-auto p-1">
                <label className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-gray-50">
                  <Checkbox
                    checked={resorts.length === 0}
                    onCheckedChange={(v) => {
                      if (v) onChange({ country, resorts: [] })
                    }}
                  />
                  <span className="text-sm font-medium">Все курорты</span>
                </label>
                {citiesLoading ? (
                  <div className="px-3 py-3 text-sm text-gray-500">Загрузка...</div>
                ) : (
                  filteredCities.map((r) => {
                    const checked = resorts.includes(r)
                    return (
                      <label
                        key={r}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-gray-50",
                          checked ? "bg-blue-50" : ""
                        )}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) => toggleResort(r, Boolean(v))}
                        />
                        <span className="text-sm">{r}</span>
                      </label>
                    )
                  })
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onChange({ country: null, resorts: [] })}
          >
            Очистить
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Готово
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

