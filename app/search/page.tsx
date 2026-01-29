"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { TourCard } from "@/components/tour-card";
import { searchTours } from "@/lib/api";
import { getPriceRange, type SearchParams, type Tour } from "@/lib/data";
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
import { LoadingSpinner, LoadingCard } from "@/components/loading-spinner";

function SearchResults() {
  const searchParams = useSearchParams();
  const [tours, setTours] = useState<Tour[]>([]);
  const [sortBy, setSortBy] = useState<string>("rating");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const { min: minPrice, max: maxPrice } = getPriceRange();

  useEffect(() => {
    async function performSearch() {
      setIsLoading(true);
      setError(null);
      setSearchProgress(0);

      const country = searchParams.get("country") || undefined;
      const city = searchParams.get("city") || undefined;
      const nightsParam = searchParams.get("nights");
      const nights = nightsParam ? parseInt(nightsParam) : undefined;

      const params: SearchParams = {
        country,
        city,
        nights,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        sortBy: sortBy as any,
      };

      try {
        // Pass progress callback to track search progress
        const results = await searchTours(params, (progress) => {
          setSearchProgress(progress);
        });
        setTours(results);
        setSearchProgress(100);
      } catch (err: any) {
        console.error('Search error:', err);
        setError(err.message || 'Не удалось выполнить поиск. Попробуйте позже.');
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
                <Select value={sortBy} onValueChange={setSortBy} disabled={isLoading}>
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
                    ${priceRange[0]} - ${priceRange[1]}
                  </span>
                </div>
                <Slider
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  min={minPrice}
                  max={maxPrice}
                  step={50}
                  className="mb-2"
                  disabled={isLoading}
                />
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSortBy("rating");
                  setPriceRange([minPrice, maxPrice]);
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
                  <p className="text-red-600 text-sm">{error}</p>
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
