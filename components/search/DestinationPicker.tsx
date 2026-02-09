"use client"

import * as React from "react"
import { Search, ChevronLeft, ChevronRight, ChevronDown, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { useMobile } from "@/lib/use-mobile"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

type MobileStep = "countries" | "resorts"

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
  const [mobileStep, setMobileStep] = React.useState<MobileStep>("countries")

  // На mobile: при открытии показывать страны или курорты в зависимости от выбранной страны
  React.useEffect(() => {
    if (!open) return
    setMobileStep(country ? "resorts" : "countries")
  }, [open, country])

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

  // Мобильное двухстраничное окно (стиль Freedom Travel)
  const mobileSheet = open && isMobile && (
    <div
      className="fixed inset-0 z-[100] md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Выбор направления"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
        aria-hidden
      />
      <div
        className="absolute left-0 right-0 bottom-0 max-h-[90vh] rounded-t-[20px] bg-white flex flex-col shadow-xl animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ручка сверху */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-300" aria-hidden />
        </div>

        {mobileStep === "countries" ? (
          /* Страница 1: Страны — шрифт и формат как в примере */
          <>
            <div className="flex items-center justify-between px-4 pb-3 shrink-0">
              <div className="w-10" />
              <h2 className="text-[18px] font-semibold text-black">
                Куда поедем?
              </h2>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
                aria-label="Закрыть"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
              {countriesError && (
                <p className="text-xs text-red-600 pb-2">{countriesError}</p>
              )}
              {filteredCountries.map((c, idx) => (
                <React.Fragment key={c}>
                  {idx > 0 && (
                    <div className="border-t border-gray-200 my-0" />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      onChange({ country: c, resorts: [] })
                      setMobileStep("resorts")
                    }}
                    className="flex w-full items-center justify-between gap-3 py-4 text-left"
                  >
                    <span className="text-[16px] font-semibold text-black">
                      {c}
                    </span>
                    <ChevronRight className="size-5 shrink-0 text-gray-400" />
                  </button>
                </React.Fragment>
              ))}
            </div>
          </>
        ) : (
          /* Страница 2: Курорты и города — шрифт и формат как в примере */
          <>
            <div className="flex items-center justify-between px-4 pb-3 shrink-0">
              <button
                type="button"
                onClick={() => setMobileStep("countries")}
                className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full text-black hover:bg-gray-100 transition-colors"
                aria-label="Назад"
              >
                <ChevronLeft className="size-5" />
              </button>
              <h2 className="text-[18px] font-bold text-gray-900">
                {country || "Курорты"}
              </h2>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
                aria-label="Закрыть"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="px-4 pb-3 shrink-0">
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm">
                <Search className="size-4 text-gray-400 shrink-0" />
                <input
                  value={resortQuery}
                  onChange={(e) => setResortQuery(e.target.value)}
                  placeholder="Курорт"
                  className="w-full bg-transparent text-[15px] text-gray-900 placeholder:text-gray-400 outline-none"
                />
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
              {!country ? (
                <p className="text-sm text-gray-500 py-4">Выберите страну</p>
              ) : citiesLoading ? (
                <p className="text-sm text-gray-500 py-4">Загрузка...</p>
              ) : (
                <div className="space-y-0">
                  <label className="flex items-center gap-3 py-3 cursor-pointer">
                    <Checkbox
                      checked={resorts.length === 0}
                      onCheckedChange={(v) => {
                        if (v) onChange({ country, resorts: [] })
                      }}
                      className="rounded border-2 border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <span className="text-[15px] font-normal text-gray-800">
                      Все курорты
                    </span>
                  </label>
                  {filteredCities.map((r) => {
                    const checked = resorts.includes(r)
                    return (
                      <label
                        key={r}
                        className="flex items-center gap-3 py-3 cursor-pointer"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) => toggleResort(r, Boolean(v))}
                          className="rounded border-2 border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <span className="text-[15px] font-normal text-gray-800">
                          {r}
                        </span>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
            <div className="shrink-0 p-4 pt-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <Button
                type="button"
                onClick={() => onOpenChange(false)}
                className="w-full min-h-[52px] rounded-xl bg-primary hover:bg-primary/90 text-white text-[16px] font-medium"
              >
                Выбрать
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )

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
              <ChevronDown className="size-4 shrink-0 text-gray-400 hidden md:block" aria-hidden />
            </div>
          </div>
        </button>
      </PopoverTrigger>

      {isMobile ? mobileSheet : (
        <PopoverContent align="start" className="w-[720px] max-w-[calc(100vw-2rem)] p-4">
          <div className="grid grid-cols-2 gap-4">
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
                {filteredCountries.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      onChange({ country: c, resorts: [] })
                      onOpenChange(false)
                    }}
                    className={cn(
                      "w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-gray-50",
                      c === country && "bg-gray-100 font-semibold"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
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
                            checked && "bg-blue-50"
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
            <Button variant="outline" onClick={() => onChange({ country: null, resorts: [] })}>
              Очистить
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Готово
            </Button>
          </div>
        </PopoverContent>
      )}
    </Popover>
  )
}

