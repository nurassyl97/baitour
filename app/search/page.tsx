"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { TourCard } from "@/components/tour-card";
import { searchTours, getPriceRange, type SearchParams, type Tour } from "@/lib/data";
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

function SearchResults() {
  const searchParams = useSearchParams();
  const [tours, setTours] = useState<Tour[]>([]);
  const [sortBy, setSortBy] = useState<string>("rating");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  
  const { min: minPrice, max: maxPrice } = getPriceRange();

  useEffect(() => {
    const country = searchParams.get("country") || undefined;
    const city = searchParams.get("city") || undefined;

    const params: SearchParams = {
      country,
      city,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      sortBy: sortBy as any,
    };

    const results = searchTours(params);
    setTours(results);
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
              ? `Tours in ${city}, ${country}`
              : country
              ? `Tours in ${country}`
              : city
              ? `Tours in ${city}`
              : "All Tours"}
          </h1>
          <p className="text-muted-foreground">
            Found {tours.length} tour{tours.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4 space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Sort By</h3>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label>Price Range</Label>
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
                />
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSortBy("rating");
                  setPriceRange([minPrice, maxPrice]);
                }}
              >
                Reset Filters
              </Button>
            </div>
          </aside>

          {/* Results Grid */}
          <div className="lg:col-span-3">
            {tours.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <h3 className="text-2xl font-semibold mb-2">No tours found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your filters or search for a different destination
                </p>
                <Button onClick={() => window.location.href = "/"}>
                  Back to Home
                </Button>
              </div>
            ) : (
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
