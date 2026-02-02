"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { TourCard } from "@/components/tour-card";
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
import { Slider } from "@/components/ui/slider";
import { LoadingSpinner } from "@/components/loading-spinner";

function SearchResults() {
  const searchParams = useSearchParams();
  const [tours, setTours] = useState<Tour[]>([]);
  const [sortBy, setSortBy] = useState<NonNullable<SearchParams["sortBy"]>>("rating");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 3000000]); // KZT range (max 3 mln)
  const [isLoading, setIsLoading] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  useEffect(() => {
    async function performSearch() {
      setIsLoading(true);
      setError(null);
      setSearchProgress(0);

      const country = searchParams.get("country") || undefined;
      const city = searchParams.get("city") || undefined;
      const departureIdParam = searchParams.get("departureId");
      let dateFrom = searchParams.get("dateFrom") || undefined;
      let dateTo = searchParams.get("dateTo") || undefined;
      const nightsFromParam = searchParams.get("nightsFrom");
      const nightsToParam = searchParams.get("nightsTo");
      const adultsParam = searchParams.get("adults");
      const childrenParam = searchParams.get("children");
      const hotelStarsParam = searchParams.get("hotelStars");
      const mealParam = searchParams.get("meal");
      const hotelRatingParam = searchParams.get("hotelRating");

      // Ensure dateTo is always set - default to dateFrom + 7 days if not provided
      if (!dateTo && dateFrom) {
        const dateFromObj = new Date(dateFrom);
        dateFromObj.setDate(dateFromObj.getDate() + 7);
        dateTo = dateFromObj.toISOString().split('T')[0];
        console.log(`dateTo was missing, auto-set to: ${dateTo} (dateFrom + 7 days)`);
      } else if (!dateTo && !dateFrom) {
        // If both are missing, set default range
        const today = new Date();
        const sevenDaysLater = new Date();
        sevenDaysLater.setDate(today.getDate() + 7);
        const fourteenDaysLater = new Date();
        fourteenDaysLater.setDate(today.getDate() + 14);
        dateFrom = sevenDaysLater.toISOString().split('T')[0];
        dateTo = fourteenDaysLater.toISOString().split('T')[0];
        console.log(`Both dates missing, auto-set dateFrom: ${dateFrom}, dateTo: ${dateTo}`);
      }

      // Ensure dateTo is definitely set (safety check)
      if (!dateTo) {
        console.warn('dateTo is still undefined after checks, setting default');
        if (dateFrom) {
          const dateFromObj = new Date(dateFrom);
          dateFromObj.setDate(dateFromObj.getDate() + 7);
          dateTo = dateFromObj.toISOString().split('T')[0];
        } else {
          const fourteenDaysLater = new Date();
          fourteenDaysLater.setDate(new Date().getDate() + 14);
          dateTo = fourteenDaysLater.toISOString().split('T')[0];
        }
      }

      const params = {
        country,
        city,
        departureId: departureIdParam ? parseInt(departureIdParam) : undefined,
        dateFrom,
        dateTo, // This should always be set now
        nightsFrom: nightsFromParam ? parseInt(nightsFromParam) : undefined,
        nightsTo: nightsToParam ? parseInt(nightsToParam) : undefined,
        adults: adultsParam ? parseInt(adultsParam) : undefined,
        children: childrenParam ? parseInt(childrenParam) : undefined,
        hotelCategory: hotelStarsParam ? parseInt(hotelStarsParam) : undefined,
        hotelRating: hotelRatingParam && hotelRatingParam !== "any" ? parseInt(hotelRatingParam) : undefined,
        meal: mealParam && mealParam !== "any" ? parseInt(mealParam) : undefined,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        sortBy,
      } satisfies SearchParams;

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
        setTours(data.tours || []);
        
        // Save search results to localStorage for detail pages
        try {
          if (data.tours && data.tours.length > 0) {
            localStorage.setItem('tourSearchResults', JSON.stringify(data.tours));
          }
        } catch (storageError) {
          console.warn('Failed to save search results:', storageError);
        }
        
        setSearchProgress(100);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('Search error:', message);
        
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
  }, [searchParams, sortBy, priceRange]);

  const country = searchParams.get("country");
  const city = searchParams.get("city");

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            {city && country
              ? `Туры в ${city}, ${country}`
              : country
              ? `Туры в ${country}`
              : city
              ? `Туры в ${city}`
              : "Все туры"}
          </h1>
          <p className="text-muted-foreground">
            Найдено {tours.length} {tours.length === 1 ? 'тур' : tours.length < 5 ? 'тура' : 'туров'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4 space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Сортировка</h3>
                <Select
                  value={sortBy}
                  onValueChange={(value) =>
                    setSortBy(value as NonNullable<SearchParams["sortBy"]>)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">По рейтингу</SelectItem>
                    <SelectItem value="price-asc">Цена: по возрастанию</SelectItem>
                    <SelectItem value="price-desc">Цена: по убыванию</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label>Диапазон цен</Label>
                  <span className="text-sm text-muted-foreground">
                    {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()} ₸
                  </span>
                </div>
                <Slider
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  min={0}
                  max={3000000}
                  step={10000}
                  className="mb-2"
                  disabled={isLoading}
                />
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSortBy("rating");
                  setPriceRange([0, 3000000]);
                }}
                disabled={isLoading}
              >
                Сбросить фильтры
              </Button>
            </div>
          </aside>

          {/* Results Grid */}
          <div className="lg:col-span-3">
            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-lg font-medium">Ищем туры у операторов...</p>
                <p className="text-sm text-gray-500 mt-2">
                  Это может занять 10-30 секунд
                </p>
                {searchProgress > 0 && (
                  <div className="mt-4 max-w-md mx-auto">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-primary h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${searchProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{searchProgress}% завершено</p>
                  </div>
                )}
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <p className="text-red-800 font-medium mb-2">Ошибка поиска</p>
                  <p className="text-red-600 text-sm mb-3">{error}</p>
                  {retryAfter !== null && retryAfter > 0 && (
                    <div className="mt-4">
                      <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-red-300">
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

            {/* Empty State */}
            {!isLoading && !error && tours.length === 0 && (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <h3 className="text-2xl font-semibold mb-2">Туры не найдены</h3>
                <p className="text-muted-foreground mb-6">
                  Попробуйте изменить фильтры или поищите другое направление
                </p>
                <Button onClick={() => window.location.href = "/"}>
                  Вернуться на главную
                </Button>
              </div>
            )}

            {/* Results */}
            {!isLoading && !error && tours.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {tours.map((tour) => (
                  <TourCard key={tour.id} tour={tour} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-8">
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
