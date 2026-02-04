"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useMobile } from "@/lib/use-mobile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star } from "lucide-react";

const CITY_ALL = "__all__";

/** Порядок и состав популярных стран в блоке «Страна» */
const POPULAR_COUNTRIES_ORDER = [
  "Турция",
  "Египет",
  "Таиланд",
  "ОАЭ",
  "Китай",
  "Вьетнам",
];

function formatShortDateRu(value: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  // "17 фев." -> "17 фев"
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" })
    .format(d)
    .replace(/\.$/, "");
}

export function SearchForm({ variant = "default" }: { variant?: "default" | "compact" }) {
  const isCompact = variant === "compact";
  const isMobile = useMobile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchType, setSearchType] = useState("tours");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState(CITY_ALL);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [nightsFrom, setNightsFrom] = useState("6");
  const [nightsTo, setNightsTo] = useState("14");
  const [travelers, setTravelers] = useState("2");
  const [countries, setCountries] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [departures, setDepartures] = useState<{ id: number; name: string }[]>(
    []
  );
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingDepartures, setIsLoadingDepartures] = useState(false);
  const [hotelStars, setHotelStars] = useState<number>(0);
  const [mealType, setMealType] = useState<string>("any");
  const [hotelRating, setHotelRating] = useState<string>("any");
  const [children, setChildren] = useState<string>("0");
  const [countriesError, setCountriesError] = useState<string | null>(null);
  const [departureId, setDepartureId] = useState<string>("");

  const [openDeparture, setOpenDeparture] = useState(false);
  const [openDestination, setOpenDestination] = useState(false);
  const [openDates, setOpenDates] = useState(false);
  const [openPeople, setOpenPeople] = useState(false);

  const formContainerRef = useRef<HTMLDivElement | null>(null);
  const departureRef = useRef<HTMLDivElement | null>(null);
  const destinationRef = useRef<HTMLDivElement | null>(null);
  const datesRef = useRef<HTMLDivElement | null>(null);
  const peopleRef = useRef<HTMLDivElement | null>(null);
  const submitRef = useRef<HTMLDivElement | null>(null);

  const loadCountries = useCallback(async () => {
    setIsLoadingCountries(true);
    setCountriesError(null);

    try {
      // Wait for API response - no timeout, no fallback
      const response = await fetch("/api/countries");

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to load countries`);
      }

      const data = await response.json();

      if (data.countries && data.countries.length > 0) {
        setCountries(data.countries);
      } else {
        setCountries([]);
        setCountriesError("Список стран пуст. Попробуйте позже.");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Failed to load countries from API:", message);
      setCountries([]);
      setCountriesError("Не удалось загрузить страны. Попробуйте снова.");
    } finally {
      setIsLoadingCountries(false);
    }
  }, []);

  // Set default dates (tomorrow + 7 days) for better chances with trial API
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekLater = new Date();
    weekLater.setDate(weekLater.getDate() + 8);
    
    setDateFrom(tomorrow.toISOString().split('T')[0]);
    setDateTo(weekLater.toISOString().split('T')[0]);
  }, []);

  // Load countries on mount - wait for API response (no timeout, no fallback)
  useEffect(() => {
    loadCountries();
  }, [loadCountries]);

  // Load departure cities on mount (Kazakhstan by default)
  useEffect(() => {
    async function loadDepartures() {
      setIsLoadingDepartures(true);
      try {
        const response = await fetch(
          "/api/departures?departureCountryId=3"
        );
        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}: Failed to load departure cities`
          );
        }
        const data = await response.json();
        if (data.departures && data.departures.length > 0) {
          setDepartures(data.departures);
          // Set default departure to Almaty (27) if exists
          const defaultDep = data.departures.find(
            (d: { id: number }) => d.id === 27
          );
          if (defaultDep) {
            setDepartureId(String(defaultDep.id));
          }
        } else {
          setDepartures([]);
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(
          "Failed to load departure cities from API:",
          message
        );
        setDepartures([]);
      } finally {
        setIsLoadingDepartures(false);
      }
    }
    loadDepartures();
  }, []);

  // Load cities when country changes
  useEffect(() => {
    async function loadCities() {
      if (!country) {
        setCities([]);
        setCity(CITY_ALL);
        return;
      }

      setIsLoadingCities(true);
      setCity(CITY_ALL);
      try {
        // Wait for API response - no timeout
        const response = await fetch(`/api/cities?country=${encodeURIComponent(country)}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to load cities`);
        }
        
        const data = await response.json();
        setCities(data.cities || []);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('Failed to load cities:', message);
        setCities([]);
      } finally {
        setIsLoadingCities(false);
      }
    }
    loadCities();
  }, [country]);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      const target = e.target as Node | null;
      const refs = [formContainerRef, departureRef, destinationRef, datesRef, peopleRef];
      const clickedInside = refs.some((r) => r.current && target && r.current.contains(target));
      const clickedSubmit = submitRef.current && target && submitRef.current.contains(target);
      if (!clickedInside && !clickedSubmit) {
        setOpenDeparture(false);
        setOpenDestination(false);
        setOpenDates(false);
        setOpenPeople(false);
      }
    }

    if (openDeparture || openDestination || openDates || openPeople) {
      document.addEventListener("mousedown", onPointerDown);
      return () => document.removeEventListener("mousedown", onPointerDown);
    }
  }, [openDeparture, openDestination, openDates, openPeople]);

  const departureLabel = useMemo(() => {
    const found = departures.find((d) => String(d.id) === departureId);
    return found?.name || "Выберите город";
  }, [departures, departureId]);

  const destinationLabel = useMemo(() => {
    if (!country) return "Страна / курорт";
    const resort = city === CITY_ALL ? "Все курорты" : city;
    return `${country}, ${resort}`;
  }, [country, city]);

  const datesLabel = useMemo(() => {
    if (!dateFrom || !dateTo) return "Выберите даты";
    const from = formatShortDateRu(dateFrom);
    const to = formatShortDateRu(dateTo);
    const nf = Number(nightsFrom);
    const nt = Number(nightsTo);
    const nightsText =
      Number.isFinite(nf) && Number.isFinite(nt)
        ? nf === nt
          ? `${nf} ночей`
          : `${nf}–${nt} ночей`
        : "";
    return `${from} — ${to}${nightsText ? `, ${nightsText}` : ""}`;
  }, [dateFrom, dateTo, nightsFrom, nightsTo]);

  const peopleLabel = useMemo(() => {
    const a = Math.max(1, Number(travelers) || 1);
    const c = Math.max(0, Number(children) || 0);
    const adultsText = `${a} ${a === 1 ? "взрослый" : "взрослых"}`;
    if (c <= 0) return adultsText;
    const kidsText = `${c} ${c === 1 ? "ребенок" : "детей"}`;
    return `${adultsText}, ${kidsText}`;
  }, [travelers, children]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Та же логика, что на странице поиска: страна обязательна для перехода
    if (!country?.trim()) {
      setOpenDestination(true);
      return;
    }

    let finalDateTo = dateTo;
    if (!finalDateTo && dateFrom) {
      const dateFromObj = new Date(dateFrom);
      dateFromObj.setDate(dateFromObj.getDate() + 7);
      finalDateTo = dateFromObj.toISOString().split("T")[0];
    } else if (!finalDateTo) {
      const today = new Date();
      const sevenDaysLater = new Date();
      sevenDaysLater.setDate(today.getDate() + 7);
      const fourteenDaysLater = new Date();
      fourteenDaysLater.setDate(today.getDate() + 14);
      if (!dateFrom) {
        setDateFrom(sevenDaysLater.toISOString().split("T")[0]);
      }
      finalDateTo = fourteenDaysLater.toISOString().split("T")[0];
    }

    const params = new URLSearchParams();
    params.append("searchType", searchType);
    if (departureId) params.append("departureId", departureId);
    if (country) params.append("country", country);
    if (city !== CITY_ALL) params.append("city", city);
    if (dateFrom) params.append("dateFrom", dateFrom);
    if (finalDateTo) params.append("dateTo", finalDateTo);
    params.append("nightsFrom", nightsFrom);
    params.append("nightsTo", nightsTo);
    params.append("adults", travelers);
    params.append("children", children);
    if (hotelStars > 0) params.append("hotelStars", hotelStars.toString());
    if (mealType !== "any") params.append("meal", mealType);
    if (hotelRating !== "any") params.append("hotelRating", hotelRating);
    // Токен submit — как на странице поиска, чтобы сразу запустить поиск
    params.set("submit", String(Date.now()));

    const url = `/search?${params.toString()}`;
    setIsSubmitting(true);
    // Full page navigation to avoid RSC fetch (fails with "access control checks" / "Load failed")
    window.location.href = url;
  };

  const fieldHeight = "h-[64px] min-h-[64px]";
  const fieldBase =
    "relative flex-1 min-w-0 flex flex-col justify-center px-4 border-[#E5E7EB] select-none";
  const blockClickable =
    "flex items-center justify-between gap-2 text-left w-full cursor-pointer min-h-[44px]";
  const labelClass = "text-[12px] font-normal text-[#64748B]";
  const valueClass = "text-[16px] font-medium text-[#0F172A] truncate min-w-0 whitespace-nowrap";

  const popoverBase =
    "absolute left-0 top-[calc(100%+10px)] z-50 w-[420px] max-w-[calc(100vw-2rem)] rounded-2xl border border-gray-200 bg-white p-4 shadow-xl";

  return (
    <div className="space-y-4">
      {/* Search Type — только в полной версии */}
      {!isCompact && (
        <div className="flex items-center gap-6 text-white">
          <span className="text-sm font-semibold">Туры с перелетом</span>
        </div>
      )}

      {/* Main Search Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ONE white card: single flex row, 64px height, 14px radius, no gaps (internal dividers) */}
        <div
          ref={formContainerRef}
          className="relative z-10 flex flex-row flex-wrap md:flex-nowrap overflow-hidden rounded-[14px] border border-[#E5E7EB] bg-[#FFFFFF] shadow-md"
        >
          {/* Откуда вылет */}
          <div ref={departureRef} className={`${fieldBase} ${fieldHeight} border-b md:border-b-0 md:border-l-0`}>
            <span className={labelClass}>Откуда вылет</span>
              <button
                type="button"
                disabled={isLoadingDepartures}
                onClick={() => {
                  setOpenDeparture((v) => !v);
                  setOpenDestination(false);
                  setOpenDates(false);
                  setOpenPeople(false);
                }}
                className={`${blockClickable} ${openDeparture ? "ring-2 ring-primary/30 rounded-lg" : ""} ${isLoadingDepartures ? "cursor-wait" : ""}`}
              >
                <span className={valueClass}>{isLoadingDepartures ? "Загрузка..." : departureLabel}</span>
                <span className="text-gray-400">▾</span>
              </button>
              {openDeparture && (
                <div className={popoverBase}>
                  <div className="max-h-72 overflow-auto">
                    {departures.map((d) => {
                      const active = String(d.id) === departureId;
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => {
                            setDepartureId(String(d.id));
                            setOpenDeparture(false);
                          }}
                          className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                            active ? "bg-blue-50 font-semibold" : "hover:bg-gray-50"
                          }`}
                        >
                          {d.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Куда поедем */}
            <div ref={destinationRef} className={`${fieldBase} ${fieldHeight} border-b border-l-0 md:border-l`}>
              <span className={labelClass}>Куда поедем</span>
              <button
                type="button"
                onClick={() => {
                  setOpenDestination((v) => !v);
                  setOpenDeparture(false);
                  setOpenDates(false);
                  setOpenPeople(false);
                }}
                className={`${blockClickable} ${openDestination ? "ring-2 ring-primary/30 rounded-lg" : ""}`}
              >
                <span className={valueClass}>
                  {isLoadingCountries ? "Загрузка..." : countriesError ? "Ошибка загрузки" : destinationLabel}
                </span>
                <span className="text-gray-400">▾</span>
              </button>
              {countriesError && (
                <div className="mt-1 flex items-center justify-between text-xs text-red-500">
                  <span className="truncate">{countriesError}</span>
                  <button type="button" onClick={loadCountries} className="underline">
                    Повторить
                  </button>
                </div>
              )}
              {openDestination && (
                <div className={`${popoverBase} w-[680px]`}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-gray-100 p-2">
                      <div className="max-h-72 overflow-auto">
                        {(() => {
                          const popularList = POPULAR_COUNTRIES_ORDER.filter((c) =>
                            countries.includes(c)
                          );
                          const otherCountries = countries.filter(
                            (c) => !POPULAR_COUNTRIES_ORDER.includes(c)
                          );
                          const renderCountry = (c: string) => {
                            const active = c === country;
                            return (
                              <button
                                key={c}
                                type="button"
                                onClick={() => {
                                  setCountry(c);
                                  setCity(CITY_ALL);
                                  if (isMobile) setOpenDestination(false);
                                }}
                                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm ${
                                  active ? "bg-gray-100 font-semibold" : "hover:bg-gray-50"
                                }`}
                              >
                                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-700">
                                  {c.slice(0, 1).toUpperCase()}
                                </span>
                                <span className="truncate">{c}</span>
                              </button>
                            );
                          };
                          return (
                            <>
                              {popularList.length > 0 && (
                                <>
                                  <div className="px-2 pb-2 pt-1 text-xs font-semibold text-gray-500">
                                    Популярные
                                  </div>
                                  <div className="space-y-0.5">
                                    {popularList.map(renderCountry)}
                                  </div>
                                </>
                              )}
                              <div className="mt-3 border-t border-gray-100 px-2 pb-2 pt-3 text-xs font-semibold text-gray-500">
                                Все страны
                              </div>
                              <div className="space-y-0.5">
                                {otherCountries.map(renderCountry)}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-100 p-2">
                      <div className="px-2 pb-2 text-xs font-semibold text-gray-500">
                        Курорты
                      </div>
                      {!country ? (
                        <div className="px-3 py-8 text-sm text-gray-500">Выберите страну слева</div>
                      ) : (
                        <div className="max-h-72 overflow-auto">
                          <button
                            type="button"
                            onClick={() => {
                              setCity(CITY_ALL);
                              if (isMobile) setOpenDestination(false);
                            }}
                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm ${
                              city === CITY_ALL ? "bg-blue-50 font-semibold" : "hover:bg-gray-50"
                            }`}
                          >
                            <span
                              className={`inline-flex h-5 w-5 items-center justify-center rounded-md border ${
                                city === CITY_ALL ? "border-[#22a7f0] bg-[#22a7f0] text-white" : "border-gray-300"
                              }`}
                            >
                              {city === CITY_ALL ? "✓" : ""}
                            </span>
                            <span>Все курорты</span>
                          </button>

                          {isLoadingCities ? (
                            <div className="px-3 py-4 text-sm text-gray-500">Загрузка...</div>
                          ) : (
                            cities.map((c) => {
                              const active = city === c;
                              return (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => {
                                    setCity(c);
                                    if (isMobile) setOpenDestination(false);
                                  }}
                                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm ${
                                    active ? "bg-gray-100 font-semibold" : "hover:bg-gray-50"
                                  }`}
                                >
                                  <span
                                    className={`inline-flex h-5 w-5 items-center justify-center rounded-md border ${
                                      active ? "border-blue-500 bg-blue-500 text-white" : "border-gray-300"
                                    }`}
                                  >
                                    {active ? "✓" : ""}
                                  </span>
                                  <span className="truncate">{c}</span>
                                </button>
                              );
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
                      onClick={() => setOpenDestination(false)}
                    >
                      Готово
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Даты поездки */}
            <div ref={datesRef} className={`${fieldBase} ${fieldHeight} border-b border-l-0 md:border-l`}>
              <span className={labelClass}>Даты поездки</span>
              <button
                type="button"
                onClick={() => {
                  setOpenDates((v) => !v);
                  setOpenDeparture(false);
                  setOpenDestination(false);
                  setOpenPeople(false);
                }}
                className={`${blockClickable} ${openDates ? "ring-2 ring-primary/30 rounded-lg" : ""}`}
              >
                <span className={valueClass}>{datesLabel}</span>
                <span className="text-gray-400">▾</span>
              </button>
              {openDates && (
                <div className={popoverBase}>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="dateFrom" className="text-xs text-muted-foreground">
                        Заезд (от)
                      </Label>
                      <Input
                        id="dateFrom"
                        type="date"
                        value={dateFrom}
                        onChange={(e) => {
                          const selectedDate = e.target.value;
                          setDateFrom(selectedDate);
                          if (dateTo && dateTo < selectedDate) {
                            const dateFromObj = new Date(selectedDate);
                            dateFromObj.setDate(dateFromObj.getDate() + 7);
                            setDateTo(dateFromObj.toISOString().split("T")[0]);
                          } else if (!dateTo && selectedDate) {
                            const dateFromObj = new Date(selectedDate);
                            dateFromObj.setDate(dateFromObj.getDate() + 7);
                            setDateTo(dateFromObj.toISOString().split("T")[0]);
                          }
                        }}
                        min={new Date().toISOString().split("T")[0]}
                        className="h-10 border border-gray-200 font-semibold"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="dateTo" className="text-xs text-muted-foreground">
                        Заезд (до)
                      </Label>
                      <Input
                        id="dateTo"
                        type="date"
                        value={dateTo}
                        onChange={(e) => {
                          const selectedDate = e.target.value;
                          if (dateFrom && selectedDate < dateFrom) {
                            const dateFromObj = new Date(dateFrom);
                            dateFromObj.setDate(dateFromObj.getDate() + 1);
                            setDateTo(dateFromObj.toISOString().split("T")[0]);
                          } else {
                            setDateTo(selectedDate);
                          }
                        }}
                        min={dateFrom || new Date().toISOString().split("T")[0]}
                        className="h-10 border border-gray-200 font-semibold"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="nightsFrom" className="text-xs text-muted-foreground">
                        Ночей (от)
                      </Label>
                      <Input
                        id="nightsFrom"
                        type="number"
                        value={nightsFrom}
                        onChange={(e) => setNightsFrom(e.target.value)}
                        min="1"
                        max="30"
                        className="h-10 border border-gray-200 font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="nightsTo" className="text-xs text-muted-foreground">
                        Ночей (до)
                      </Label>
                      <Input
                        id="nightsTo"
                        type="number"
                        value={nightsTo}
                        onChange={(e) => setNightsTo(e.target.value)}
                        min="1"
                        max="30"
                        className="h-10 border border-gray-200 font-semibold"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setOpenDates(false)}>
                      Готово
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Сколько человек */}
            <div ref={peopleRef} className={`${fieldBase} ${fieldHeight} border-b border-l-0 md:border-l md:border-b-0`}>
              <span className={labelClass}>Сколько человек</span>
              <button
                type="button"
                onClick={() => {
                  setOpenPeople((v) => !v);
                  setOpenDeparture(false);
                  setOpenDestination(false);
                  setOpenDates(false);
                }}
                className={`${blockClickable} ${openPeople ? "ring-2 ring-primary/30 rounded-lg" : ""}`}
              >
                <span className={valueClass}>{peopleLabel}</span>
                <span className="text-[#64748B] shrink-0">▾</span>
              </button>
              {openPeople && (
                <div className={popoverBase}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="font-semibold">Взрослые</div>
                        <div className="text-xs text-gray-500">старше 17 лет</div>
                      </div>
                      <div className="flex items-center rounded-xl bg-gray-50 p-1">
                        <button
                          type="button"
                          onClick={() => {
                            const next = Math.max(1, (Number(travelers) || 1) - 1);
                            setTravelers(String(next));
                          }}
                          className="h-10 w-10 rounded-lg text-xl text-gray-700 hover:bg-white"
                        >
                          –
                        </button>
                        <div className="w-10 text-center font-semibold">{Math.max(1, Number(travelers) || 1)}</div>
                        <button
                          type="button"
                          onClick={() => {
                            const next = Math.min(8, (Number(travelers) || 1) + 1);
                            setTravelers(String(next));
                          }}
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
                          onClick={() => {
                            const next = Math.max(0, (Number(children) || 0) - 1);
                            setChildren(String(next));
                          }}
                          className="h-10 w-10 rounded-lg text-xl text-gray-700 hover:bg-white"
                        >
                          –
                        </button>
                        <div className="w-10 text-center font-semibold">{Math.max(0, Number(children) || 0)}</div>
                        <button
                          type="button"
                          onClick={() => {
                            const next = Math.min(4, (Number(children) || 0) + 1);
                            setChildren(String(next));
                          }}
                          className="h-10 w-10 rounded-lg text-xl text-gray-700 hover:bg-white"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const next = Math.min(4, (Number(children) || 0) + 1);
                        setChildren(String(next));
                      }}
                      className="flex w-full items-center gap-3 rounded-xl border border-gray-200 px-3 py-3 text-sm font-semibold hover:bg-gray-50"
                    >
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-xl">
                        +
                      </span>
                      добавить ребенка
                    </button>

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setOpenPeople(false)}>
                        Готово
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Найти — height 64px, primary blue #22A7F0, centered */}
            <div
              ref={submitRef}
              className="h-[64px] min-h-[64px] flex-shrink-0 flex items-center justify-center border-t md:border-t-0 border-l border-[#E5E7EB] w-full md:w-auto md:min-w-[140px]"
            >
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-full w-full md:min-w-[120px] rounded-none rounded-r-[14px] bg-[#22a7f0] hover:bg-[#1b8fd8] text-white text-[16px] font-semibold disabled:opacity-90"
              >
                {isSubmitting ? "Поиск…" : "Найти"}
              </Button>
            </div>
        </div>

        {/* Filters Row — компактный вариант: только 2 чипа; полный — все фильтры */}
        {isCompact ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#64748B]">
              <Star className="h-4 w-4 text-[#E5E7EB]" />
              Любой класс
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#64748B]">
              Любой бюджет
            </span>
          </div>
        ) : (
        <div className="flex flex-wrap items-center gap-2 mt-4">
          {/* Hotel Class */}
          <div className="rounded-full border border-[#E5E7EB] bg-[#FFFFFF] px-3 py-2 flex items-center gap-2">
            <span className="text-[12px] font-normal text-[#64748B]">Класс отеля</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= hotelStars
                        ? "fill-amber-500 text-amber-500"
                        : "text-[#E5E7EB]"
                    } cursor-pointer`}
                    onClick={(e) => {
                      e.preventDefault();
                      setHotelStars(star === hotelStars ? 0 : star);
                    }}
                  />
                ))}
              </div>
            </div>

          {/* Resort/Hotel */}
          <div className="rounded-full border border-[#E5E7EB] bg-[#FFFFFF]">
            <Select value={city} onValueChange={setCity} disabled={!country || isLoadingCities}>
              <SelectTrigger className="bg-[#FFFFFF] border-0 h-9 text-[12px] font-normal text-[#64748B] hover:bg-[#F1F5F9] rounded-full px-3">
                <SelectValue placeholder={isLoadingCities ? "Загрузка..." : "Курорт / отель"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={CITY_ALL}>Все курорты</SelectItem>
                {cities.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Meal Type */}
          <div className="rounded-full border border-[#E5E7EB] bg-[#FFFFFF]">
            <Select value={mealType} onValueChange={setMealType}>
              <SelectTrigger className="bg-[#FFFFFF] border-0 h-9 text-[12px] font-normal text-[#64748B] hover:bg-[#F1F5F9] rounded-full px-3">
                <SelectValue placeholder="Питание" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Любое</SelectItem>
                <SelectItem value="1">BB (завтрак)</SelectItem>
                <SelectItem value="2">HB (полупансион)</SelectItem>
                <SelectItem value="3">FB (полный пансион)</SelectItem>
                <SelectItem value="4">AI (все включено)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Hotel Rating */}
          <div className="rounded-full border border-[#E5E7EB] bg-[#FFFFFF]">
            <Select value={hotelRating} onValueChange={setHotelRating}>
              <SelectTrigger className="bg-[#FFFFFF] border-0 h-9 text-[12px] font-normal text-[#64748B] hover:bg-[#F1F5F9] rounded-full px-3">
                <SelectValue placeholder="Рейтинг отеля" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Любой</SelectItem>
                <SelectItem value="5">4.5+ Превосходно</SelectItem>
                <SelectItem value="4">4.0+ Очень хорошо</SelectItem>
                <SelectItem value="3">3.5+ Хорошо</SelectItem>
                <SelectItem value="2">3.0+ Удовлетворительно</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Advanced Filters */}
          <div className="rounded-full border border-[#E5E7EB] bg-[#FFFFFF]">
            <Select>
              <SelectTrigger className="bg-[#FFFFFF] border-0 h-9 text-[12px] font-normal text-[#64748B] hover:bg-[#F1F5F9] rounded-full px-3">
                <SelectValue placeholder="Расширенные фильтры..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beach">У пляжа</SelectItem>
                <SelectItem value="pool">Бассейн</SelectItem>
                <SelectItem value="spa">СПА</SelectItem>
                <SelectItem value="kids">Для детей</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        )}
      </form>
    </div>
  );
}
