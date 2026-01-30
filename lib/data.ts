import toursData from "@/data/tours.json";

export interface Tour {
  id: string;
  name: string;
  slug: string;
  country: string;
  city: string;
  duration: string;
  price: number;
  currency: string;
  rating: number;
  reviewCount: number;
  image: string;
  images: string[];
  description: string;
  highlights: string[];
  included: string[];
  excluded: string[];
  hotel: {
    name: string;
    rating: number;
    amenities: string[];
  };
  maxGuests: number;
  minGuests: number;
}

export interface SearchParams {
  country?: string;
  city?: string;
  nights?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price-asc' | 'price-desc' | 'rating' | 'duration';
}

export function getAllTours(): Tour[] {
  return toursData.tours as Tour[];
}

export function getTourById(id: string): Tour | undefined {
  return toursData.tours.find((tour) => tour.id === id) as Tour | undefined;
}

export function getTourBySlug(slug: string): Tour | undefined {
  return toursData.tours.find((tour) => tour.slug === slug) as Tour | undefined;
}

export function searchTours(params: SearchParams): Tour[] {
  let results = getAllTours();

  // Filter by country
  if (params.country) {
    results = results.filter(
      (tour) => tour.country.toLowerCase() === params.country!.toLowerCase()
    );
  }

  // Filter by city
  if (params.city) {
    results = results.filter(
      (tour) => tour.city.toLowerCase() === params.city!.toLowerCase()
    );
  }

  // Filter by price range
  if (params.minPrice !== undefined) {
    results = results.filter((tour) => tour.price >= params.minPrice!);
  }
  if (params.maxPrice !== undefined) {
    results = results.filter((tour) => tour.price <= params.maxPrice!);
  }

  // Sort results
  if (params.sortBy) {
    switch (params.sortBy) {
      case 'price-asc':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
    }
  }

  return results;
}

export function getPopularTours(limit: number = 6): Tour[] {
  const tours = getAllTours();
  if (tours.length === 0) return [];
  return tours
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, limit);
}

export function getCountries(): string[] {
  const tours = getAllTours();
  if (tours.length === 0) return [];
  const countries = new Set(tours.map((tour) => tour.country));
  return Array.from(countries).sort();
}

export function getCitiesByCountry(country: string): string[] {
  const tours = getAllTours();
  if (tours.length === 0) return [];
  const cities = new Set(
    tours
      .filter((tour) => tour.country.toLowerCase() === country.toLowerCase())
      .map((tour) => tour.city)
  );
  return Array.from(cities).sort();
}

export function getPriceRange(): { min: number; max: number } {
  const tours = getAllTours();
  if (tours.length === 0) return { min: 0, max: 5000 };
  const prices = tours.map((tour) => tour.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}
