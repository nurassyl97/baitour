"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useEffect, useRef, useState, Suspense } from "react";
import { ResultCard } from "@/components/search/ResultCard";
import { type SearchParams, type Tour } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/loading-spinner";
import { SearchBarSticky } from "@/components/search/SearchBarSticky";
import { SearchLanding } from "@/components/search/SearchLanding";
import { useSearchQuery } from "@/components/search/useSearchQuery";
import {
  DEFAULT_DEPARTURE_ID,
  toServerSearchParams,
} from "@/components/search/SearchFormState";
import { applyClientFilters } from "@/components/search/filtering";
import { addDays } from "date-fns";
import { FiltersSidebar } from "@/components/search/FiltersSidebar";
import { FiltersDrawer } from "@/components/search/FiltersDrawer";
import { FiltersRow } from "@/components/search/FiltersRow";

type PageMode = "landing" | "search";

function SearchResults() {
  const searchParams = useSearchParams();
  const { state, patchState } = useSearchQuery();

  const [toursRaw, setToursRaw] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // On first load: did user arrive with search intent (params from homepage or refresh)?
  const initialHasSearchParamsRef = useRef<boolean | null>(null);
  if (initialHasSearchParamsRef.current === null) {
    initialHasSearchParamsRef.current = Boolean(searchParams.get("country"));
  }
  const initialHasSearchParams = initialHasSearchParamsRef.current;

  // Explicit UI state: landing (idle) vs search (results)
  const pageMode: PageMode =
    state.submit !== 0 || initialHasSearchParams ? "search" : "landing";

  // Ensure departureId default (UX-friendly)
  useEffect(() => {
    if (state.departureId !== null) return;
    patchState({ departureId: DEFAULT_DEPARTURE_ID }, { replace: true, scroll: false });
  }, [patchState, state.departureId]);

  // If user landed with search params (from Home or refresh), stamp submit so search runs once.
  useEffect(() => {
    if (!initialHasSearchParams) return;
    if (state.submit !== 0) return;
    if (!state.country) return;
    patchState({ submit: Date.now() }, { replace: true, scroll: false });
  }, [initialHasSearchParams, patchState, state.country, state.submit]);

  const visibleTours = useMemo(() => {
    return applyClientFilters(toursRaw, {
      resorts: state.resorts,
      budgetMin: state.budgetMin,
      budgetMax: state.budgetMax,
      stars: state.stars,
      family: state.family,
      sortBy: state.sortBy,
    });
  }, [
    state.budgetMax,
    state.budgetMin,
    state.family,
    state.resorts,
    state.sortBy,
    state.stars,
    toursRaw,
  ]);

  const title = useMemo(() => {
    const country = state.country;
    if (!country) return "Поиск туров";
    if (state.resorts.length === 1) return `Туры в ${state.resorts[0]}, ${country}`;
    return `Туры в ${country}`;
  }, [state.country, state.resorts]);

  const hasSearched = state.submit !== 0;
  const hasQuery = Boolean(state.country);

  useEffect(() => {
    async function performSearch() {
      const snapshot = stateRef.current;

      // Only run API when in search mode and user has submitted (submit token).
      if (!snapshot.country || !snapshot.submit) {
        if (pageMode === "search") {
          setToursRaw([]);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setError(null);

      // Ensure default dates if user hasn't selected them yet
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const fallbackFrom = addDays(today, 1);
      const finalDateFrom = snapshot.dateFrom ?? fallbackFrom.toISOString().split("T")[0];
      const finalDateTo =
        snapshot.dateTo ??
        addDays(new Date(finalDateFrom), 7).toISOString().split("T")[0];

      const nextServerState = {
        ...snapshot,
        dateFrom: finalDateFrom,
        dateTo: finalDateTo,
      };

      const params = toServerSearchParams(nextServerState) satisfies SearchParams;

      try {
        console.log('Calling search API with params:', params);
        console.log('Date range:', { dateFrom: params.dateFrom, dateTo: params.dateTo });
        
        // Call our API route instead of searchTours directly
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Search failed');
        }

        const data = await response.json();
        setToursRaw(data.tours || []);
        
        // Save search results to localStorage for detail pages
        try {
          if (data.tours && data.tours.length > 0) {
            localStorage.setItem('tourSearchResults', JSON.stringify(data.tours));
          }
        } catch (storageError) {
          console.warn('Failed to save search results:', storageError);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        // In dev Next can show an overlay for console.error; this is a user-facing error state already.
        console.warn('Search error:', message);
        
        // Handle rate limiting with a user-friendly message
        if (message.includes('429') || message.includes('Too Many Requests')) {
          const waitTime = 60; // Wait 60 seconds for trial API
          setError(`Слишком много запросов к API (пробная версия). Пожалуйста, подождите ${waitTime} секунд и попробуйте снова.`);
          setRetryAfter(waitTime);
          
          // Countdown timer
          let remaining = waitTime;
          const countdown = setInterval(() => {
            remaining--;
            if (remaining > 0) {
              setRetryAfter(remaining);
            } else {
              clearInterval(countdown);
              setRetryAfter(null);
              setError(null);
            }
          }, 1000);
        } else if (message.includes('Не удалось найти страну') || message.includes('No valid country')) {
          setError(message || 'Не удалось найти выбранную страну. Попробуйте позже.');
        } else {
          setError(message || 'Не удалось выполнить поиск. Попробуйте позже.');
        }
      } finally {
        setIsLoading(false);
      }
    }

    performSearch();
  }, [state.submit, pageMode]);

  const handleSearchSubmit = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fallbackFrom = addDays(today, 1);
    const finalDateFrom = state.dateFrom ?? fallbackFrom.toISOString().split("T")[0];
    const finalDateTo =
      state.dateTo ??
      addDays(new Date(finalDateFrom), 7).toISOString().split("T")[0];

    patchState(
      {
        dateFrom: finalDateFrom,
        dateTo: finalDateTo,
        submit: Date.now(),
      },
      { replace: false, scroll: true }
    );
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <SearchBarSticky
        state={state}
        onPatch={(patch) => patchState(patch, { replace: true, scroll: false })}
        onSubmit={handleSearchSubmit}
      />

      {pageMode === "landing" ? (
        <SearchLanding />
      ) : (
        <>
          <div className="ds-container">
            <div className="mx-auto max-w-[var(--container-max)]">
              <FiltersRow state={state} />
            </div>
          </div>

          <div className="ds-container pb-10" style={{ paddingTop: "var(--section-spacing)" }}>
            <div className="pt-6 pb-6">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{title}</h1>
              <p className="text-muted-foreground">
                Найдено {visibleTours.length}{" "}
                {visibleTours.length === 1 ? "тур" : visibleTours.length < 5 ? "тура" : "туров"}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-[var(--section-spacing)]">
              <aside className="lg:col-span-1">
                <div className="sticky top-24 hidden lg:block">
                  <FiltersSidebar
                    state={state}
                    disabled={isLoading}
                    onPatch={(patch) => patchState(patch, { replace: true, scroll: false })}
                  />
                </div>
              </aside>

              <div className="lg:col-span-3">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <FiltersDrawer
                    state={state}
                    disabled={isLoading}
                    onPatch={(patch) => patchState(patch, { replace: true, scroll: false })}
                  />

                  <div className="flex items-center gap-2">
                    <Label className="hidden sm:block">Сортировка</Label>
                    <Select
                      value={state.sortBy}
                      onValueChange={(value) =>
                        patchState(
                          { sortBy: value as NonNullable<SearchParams["sortBy"]> },
                          { replace: true, scroll: false }
                        )
                      }
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-[220px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rating">По популярности</SelectItem>
                        <SelectItem value="price-asc">Цена: по возрастанию</SelectItem>
                        <SelectItem value="price-desc">Цена: по убыванию</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {isLoading && (
                  <div className="text-center py-12">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-lg font-medium">Ищем туры у операторов...</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Это может занять 10-30 секунд
                    </p>
                  </div>
                )}

                {error && !isLoading && (
                  <div className="bg-[#FFFFFF] rounded-lg shadow p-12 text-center">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <p className="text-red-800 font-medium mb-2">Ошибка поиска</p>
                      <p className="text-red-600 text-sm mb-3">{error}</p>
                      {retryAfter !== null && retryAfter > 0 && (
                        <div className="mt-4">
                          <div className="inline-flex items-center gap-2 bg-[#FFFFFF] rounded-full px-4 py-2 border border-red-300">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-red-700 font-semibold">
                              Повтор через: {retryAfter} сек
                            </span>
                          </div>
                          <p className="text-xs text-red-500 mt-2">
                            Пробная версия API имеет ограничения по количеству запросов
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {!isLoading && !error && visibleTours.length === 0 && hasSearched && hasQuery && (
                  <div className="bg-[#FFFFFF] rounded-lg shadow p-12 text-center">
                    <h3 className="text-2xl font-semibold mb-2">Туры не найдены</h3>
                    <p className="text-muted-foreground mb-6">
                      Попробуйте изменить фильтры или поищите другое направление
                    </p>
                    <Button onClick={() => window.location.href = "/"}>
                      Вернуться на главную
                    </Button>
                  </div>
                )}

                {!isLoading && !error && visibleTours.length > 0 && (
                  <div className="grid grid-cols-1 gap-4">
                    {visibleTours.map((tour) => (
                      <ResultCard key={tour.id} tour={tour} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F9FAFB] py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded w-1/3"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
