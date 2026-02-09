import toursData from "@/data/tours.json";

export interface TourVariant {
  id: string;
  operator: string;
  operatorId: number;
  date: string;
  nights: number;
  adults?: number;
  children?: number;
  meal?: string;
  placement?: string;
  roomType?: string;
  price: number;
  currency: string;
}

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
  variants?: TourVariant[]; // Tour variants for detail page
}

export interface SearchParams {
  country?: string;
  city?: string;
  departureId?: number;
  nightsFrom?: number;
  nightsTo?: number;
  dateFrom?: string;
  dateTo?: string;
  adults?: number;
  children?: number;
  childrenAges?: number[];
  hotelCategory?: number;
  hotelRating?: number; // 0, 2, 3, 4, 5 (0=any, 2=3.0+, 3=3.5+, 4=4.0+, 5=4.5+)
  meal?: number; // Meal type ID
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price-asc' | 'price-desc' | 'rating' | 'duration';
}

export function getAllTours(): Tour[] {
  return toursData.tours as Tour[];
}

export function getTourById(id: string): Tour | undefined {
  return getAllTours().find((tour) => tour.id === id);
}

export function getTourBySlug(slug: string): Tour | undefined {
  return getAllTours().find((tour) => tour.slug === slug);
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
