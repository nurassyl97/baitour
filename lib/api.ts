// API Service Layer for Tours
// Integrates with Tourvisor API

import { Tour, SearchParams } from './data';
import * as tourvisorApi from './tourvisor-api';
import * as tourvisorAdapter from './tourvisor-adapter';
import { TourvisorSearchRequest } from './tourvisor-types';

// API Configuration
const DEFAULT_DEPARTURE_ID = parseInt(process.env.NEXT_PUBLIC_DEFAULT_DEPARTURE_ID || '27'); // Almaty

// Cache for country name to ID mapping
let countryNameToIdCache: Map<string, number> | null = null;

/**
 * Get country ID by name (supports Russian and English)
 * NO FALLBACK - Only real API data
 */
async function getCountryIdByName(countryName: string): Promise<number | null> {
  const normalizedName = countryName.toLowerCase().trim();
  
  try {
    // Build cache from real API
    if (!countryNameToIdCache) {
      console.log('🔄 Building country cache from Tourvisor API...');
      const countries = await tourvisorApi.getCountries(DEFAULT_DEPARTURE_ID);
      
      if (!countries || countries.length === 0) {
        console.error('❌ API returned empty countries list!');
        return null;
      }
      
      countryNameToIdCache = new Map();
      console.log(`📋 Countries from API:`);
      countries.forEach(country => {
        countryNameToIdCache!.set(country.name.toLowerCase(), country.id);
        console.log(`  ✓ ${country.name}: ${country.id}`);
      });
      console.log(`✅ Country cache built with ${countries.length} countries`);
    }

    // Try exact match from API cache
    console.log(`🔍 Looking for country: "${normalizedName}"`);
    const countryId = countryNameToIdCache.get(normalizedName);
    if (countryId) {
      console.log(`✅ Found country ID from API: ${countryId}`);
      return countryId;
    }

    // Try English to Russian mapping (for API cache)
    const englishToRussian: { [key: string]: string } = {
      'turkey': 'турция',
      'uae': 'оаэ',
      'egypt': 'египет',
      'maldives': 'мальдивы',
      'thailand': 'таиланд',
      'greece': 'греция',
      'spain': 'испания',
      'italy': 'италия',
      'france': 'франция',
      'cyprus': 'кипр',
    };

    const russianName = englishToRussian[normalizedName];
    if (russianName) {
      const cachedId = countryNameToIdCache?.get(russianName);
      if (cachedId) {
        console.log(`✅ Found country ID via translation: ${cachedId}`);
        return cachedId;
      }
    }

    console.error(`❌ Country "${countryName}" not found in API cache`);
    return null;
  } catch (error) {
    console.error('❌ Failed to get country ID from API:', error);
    return null;
  }
}

/**
 * Convert our SearchParams to Tourvisor format
 */
async function convertSearchParamsToTourvisor(params: SearchParams): Promise<TourvisorSearchRequest> {
  // Default search parameters
  const tourvisorParams: TourvisorSearchRequest = {
    departureId: params.departureId || DEFAULT_DEPARTURE_ID,
    countryIds: [],
    nights: {
      from: params.nightsFrom ?? 6,
      to: params.nightsTo ?? 14,
    },
    adults: params.adults || 2,
    children: params.children || 0,
    currency: 'KZT', // Kazakhstan Tenge
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  };

  // Map country name to ID
  let countryId: number | null = null;
  if (params.country) {
    countryId = await getCountryIdByName(params.country);
    if (countryId) {
      tourvisorParams.countryIds = [countryId];
    } else {
      console.warn(`Country "${params.country}" not found in Tourvisor`);
    }
  }

  // Map city (курорт) to region ID — только если выбран конкретный курорт, не "Все курорты"
  const cityAllValues = ['', '__all__', 'все курорты', 'любой курорт'];
  const cityNormalized = (params.city || '').trim().toLowerCase();
  if (countryId && params.city && !cityAllValues.includes(cityNormalized)) {
    try {
      const regions = await tourvisorApi.getRegions(countryId);
      const region = regions.find(
        (r) => r.name.toLowerCase().trim() === (params.city || '').toLowerCase().trim()
      );
      if (region) {
        tourvisorParams.regionIds = [region.id];
        console.log(`Region "${params.city}" mapped to ID ${region.id}`);
      } else {
        console.warn(`City/region "${params.city}" not found in Tourvisor for country ID ${countryId}`);
      }
    } catch (err) {
      console.warn('Failed to resolve region for city:', params.city, err);
    }
  }

  // Hotel category (stars)
  if (params.hotelCategory && params.hotelCategory > 0) {
    tourvisorParams.hotelCategory = params.hotelCategory;
  }

  // Hotel rating (0, 2, 3, 4, 5)
  // 0 = any, 2 = 3.0+, 3 = 3.5+, 4 = 4.0+, 5 = 4.5+
  if (params.hotelRating !== undefined && params.hotelRating > 0) {
    tourvisorParams.hotelRating = params.hotelRating;
  }

  // Meal type
  if (params.meal && params.meal > 0) {
    tourvisorParams.meal = params.meal;
  }

  // Children — передаём в API, иначе поиск идёт только по взрослым
  if (params.children && params.children > 0) {
    tourvisorParams.children = params.children;
    if (params.childrenAges && params.childrenAges.length >= params.children) {
      tourvisorParams.childrenAges = params.childrenAges.slice(0, params.children);
    } else {
      tourvisorParams.childrenAges = Array.from({ length: params.children }, () => 5);
    }
  }

  // Price range
  if (params.minPrice) {
    tourvisorParams.priceFrom = params.minPrice;
  }
  if (params.maxPrice) {
    tourvisorParams.priceTo = params.maxPrice;
  }

  return tourvisorParams;
}

/**
 * Get all tours
 * Note: Returns empty array. Use search functionality to get tours from API.
 */
export async function getAllTours(): Promise<Tour[]> {
  // Tours are loaded through search functionality from Tourvisor API
  // This function returns empty array as we don't have a "get all" endpoint
  return [];
}

/**
 * Normalized hotel images from Tourvisor hotel description API.
 * Photos come ONLY from GET /hotels/{hotelId} (описания отелей), not from search API.
 */
export interface HotelImages {
  hotelId: number;
  images: string[];
}

function fixImageUrlForPhotos(url: string): string {
  if (!url) return '';
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('http')) return url;
  return `https:${url}`;
}

/**
 * Fetch all hotel images from Tourvisor hotel description API.
 * API may return "photos" or "images"; we merge both to get maximum pictures.
 */
export async function fetchHotelImages(hotelId: number): Promise<HotelImages> {
  const desc = await tourvisorApi.getHotelDescription(hotelId);
  const photos = desc.photos ?? [];
  const imagesField = desc.images ?? [];
  const merged = [...photos, ...imagesField];
  const seen = new Set<string>();
  const raw = merged.filter((url) => {
    const u = (url || '').trim();
    if (!u || seen.has(u)) return false;
    seen.add(u);
    return true;
  });
  const images = raw.map(fixImageUrlForPhotos).filter(Boolean);
  return { hotelId, images };
}

const HOTEL_PHOTOS_CONCURRENCY = 5;
/** Сколько отелей обогащаем полной галереей в результатах поиска (ограничение из‑за лимитов Tourvisor API). */
const ENRICH_PHOTOS_LIMIT = 20;

/**
 * Enrich tours with hotel photos from hotel description API.
 * Search API only provides one picturelink (preview); full gallery comes from GET /hotels/{id}.
 * Чтобы не ловить 429 Too Many Requests от Tourvisor, обогащаем только первые ENRICH_PHOTOS_LIMIT отелей.
 * Полная галерея для конкретного отеля дополнительно подгружается на странице тура.
 */
async function enrichToursWithHotelPhotos(tours: Tour[]): Promise<Tour[]> {
  const uniqueIds = [...new Set(tours.map((t) => parseInt(t.id, 10)).filter(Number.isFinite))];
  if (uniqueIds.length === 0) return tours;

  const idsToEnrich = uniqueIds.slice(0, ENRICH_PHOTOS_LIMIT);
  const map = new Map<number, string[]>();

  for (let i = 0; i < idsToEnrich.length; i += HOTEL_PHOTOS_CONCURRENCY) {
    const chunk = idsToEnrich.slice(i, i + HOTEL_PHOTOS_CONCURRENCY);
    const results = await Promise.allSettled(chunk.map(fetchHotelImages));
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.images.length > 0) {
        map.set(result.value.hotelId, result.value.images);
      }
    }
  }

  for (const tour of tours) {
    const hid = parseInt(tour.id, 10);
    const images = map.get(hid);
    if (images && images.length > 0) {
      tour.image = images[0];
      tour.images = images;
    }
  }

  return tours;
}

/**
 * Get tour by ID
 */
export async function getTourById(id: string): Promise<Tour | undefined> {
  try {
    // First, try to get from localStorage (search results cache)
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('tourSearchResults');
        if (cached) {
          const tours: Tour[] = JSON.parse(cached);
          const tour = tours.find(t => t.id === id);
          if (tour) {
            console.log(`Found tour ${id} in localStorage cache`);
            return tour;
          }
        }
      } catch (cacheError) {
        console.warn('Failed to read from localStorage:', cacheError);
      }
    }
    
    // Fallback: Get hotel description
    const hotelId = parseInt(id);
    const hotelDescription = await tourvisorApi.getHotelDescription(hotelId);
    
    // Fix image URLs
    const fixImageUrl = (url: string) => {
      if (!url) return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80';
      if (url.startsWith('//')) return `https:${url}`;
      if (url.startsWith('http')) return url;
      return `https:${url}`;
    };
    
    const allUrls = [
      ...(hotelDescription.photos ?? []),
      ...(hotelDescription.images ?? []),
    ];
    const uniqueUrls = [...new Set(allUrls.filter(Boolean))];
    const mainImage =
      uniqueUrls.length > 0
        ? fixImageUrl(uniqueUrls[0])
        : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80';
    const images =
      uniqueUrls.length > 0 ? uniqueUrls.map(fixImageUrl) : [mainImage];
    
    const tour: Tour = {
      id: id,
      name: hotelDescription.name || 'Hotel',
      slug: `hotel-${id}`,
      country: hotelDescription.country?.name || '',
      city: hotelDescription.region?.name || '',
      duration: '7 дней / 6 ночей',
      price: 0,
      currency: 'KZT',
      rating: hotelDescription.rating || 4.0,
      reviewCount: 0,
      image: mainImage,
      images: images,
      description: hotelDescription.description || 'Описание недоступно',
      highlights: [],
      included: ['Проживание в отеле', 'Авиаперелет', 'Трансфер', 'Страховка'],
      excluded: ['Визовые сборы', 'Личные расходы', 'Экскурсии'],
      hotel: {
        name: hotelDescription.name || 'Hotel',
        rating: hotelDescription.rating || 4.0,
        amenities: hotelDescription.amenities || [],
      },
      maxGuests: 10,
      minGuests: 1,
      variants: [],
    };
    
    return tour;
  } catch (error) {
    console.error(`Failed to fetch hotel ${id}:`, error);
    return undefined;
  }
}

/**
 * Get tour by slug
 */
export async function getTourBySlug(slug: string): Promise<Tour | undefined> {
  // Extract tour ID from slug (format: hotel-name-country-nights-ID)
  const parts = slug.split('-');
  const tourId = parts[parts.length - 1];

  if (!tourId) {
    console.error('Invalid slug format:', slug);
    return undefined;
  }

  return getTourById(tourId);
}

/**
 * Search tours with filters using Tourvisor API
 */
export async function searchTours(
  params: SearchParams,
  onProgress?: (progress: number) => void
): Promise<Tour[]> {
  try {
    console.log('Starting Tourvisor search with params:', params);

    // Convert our params to Tourvisor format (now async)
    const tourvisorParams = await convertSearchParamsToTourvisor(params);

    // Check if we have valid country IDs
    if (!tourvisorParams.countryIds || tourvisorParams.countryIds.length === 0) {
      const errorMsg = params.country 
        ? `Не удалось найти страну "${params.country}". Возможно, API временно недоступен. Попробуйте позже.`
        : 'Пожалуйста, выберите страну для поиска.';
      console.warn('No valid country selected for search:', errorMsg);
      throw new Error(errorMsg);
    }

    console.log('Tourvisor search params:', tourvisorParams);

    let searchId: string;
    try {
      searchId = await tourvisorApi.startTourSearch(tourvisorParams);
    } catch (firstError) {
      const msg = firstError instanceof Error ? firstError.message : String(firstError);
      if (params.children && params.children > 0 && msg.includes('400')) {
        console.warn('Search with children returned 400, retrying without children parameter');
        const paramsWithoutChildren = { ...params, children: 0 };
        const tourvisorParamsRetry = await convertSearchParamsToTourvisor(paramsWithoutChildren);
        searchId = await tourvisorApi.startTourSearch(tourvisorParamsRetry);
      } else {
        throw firstError;
      }
    }
    console.log('Search started with ID:', searchId);

    // Poll for results with progress callback
    const tourvisorHotels = await tourvisorApi.pollSearchResults(searchId, 30, onProgress);
    console.log(`Found ${tourvisorHotels.length} hotels from Tourvisor`);

    // Transform to our format (search API gives only one picturelink per hotel)
    let tours = tourvisorAdapter.transformTours(tourvisorHotels, params);

    // При выбранных датах показываем только отели с турами в этом диапазоне
    if (params.dateFrom && params.dateTo) {
      tours = tours.filter((t) => t.variants && t.variants.length > 0);
    }

    // Enrich with full photo gallery from hotel description API (GET /hotels/{id})
    const toursWithPhotos = await enrichToursWithHotelPhotos(tours);

    // Сортировка: по умолчанию по возрастанию цены
    const sortBy = params.sortBy || 'price-asc';
    switch (sortBy) {
      case 'price-asc':
        toursWithPhotos.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        toursWithPhotos.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        toursWithPhotos.sort((a, b) => b.rating - a.rating);
        break;
      default:
        toursWithPhotos.sort((a, b) => a.price - b.price);
    }

    return toursWithPhotos;
  } catch (error) {
    console.error('Failed to search tours via Tourvisor:', error);
    throw error; // Re-throw to let caller handle the error
  }
}

/**
 * Submit booking request
 * API Endpoint: POST /api/bookings (creates lead in Bitrix24)
 */
export interface BookingRequest {
  tourId?: string;
  fullName: string;
  email: string;
  phone: string;
  travelDate: string;
  adults: number;
  children: number;
  specialRequests?: string;
  tourName?: string;
  variantId?: string;
  price?: number;
  currency?: string;
  nights?: number;
  departureDate?: string;
  arrivalDate?: string;
  operatorName?: string;
}

export async function submitBooking(booking: BookingRequest): Promise<{
  success: boolean;
  bookingId?: string;
  referenceNumber?: string;
  message?: string;
  error?: string;
}> {
  const res = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...booking,
      adults: String(booking.adults),
      children: String(booking.children),
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      success: false,
      message: typeof data.error === 'string' ? data.error : 'Не удалось отправить заявку.',
      error: data.error,
    };
  }
  return {
    success: true,
    referenceNumber: data.referenceNumber,
    bookingId: data.referenceNumber,
    message: data.message ?? 'Заявка успешно отправлена',
  };
}

/**
 * Get unique countries from Tourvisor API
 * Waits for API response - no fallback
 */
export async function getCountries(): Promise<string[]> {
  // Wait for API response - no fallback
  const countries = await tourvisorApi.getCountries(DEFAULT_DEPARTURE_ID);
  return countries.map(c => c.name).sort();
}

/**
 * Get cities/regions for a specific country from Tourvisor API
 */
export async function getCitiesByCountry(country: string): Promise<string[]> {
  try {
    // First, get the country ID
    const countries = await tourvisorApi.getCountries(DEFAULT_DEPARTURE_ID);
    const countryObj = countries.find(c => c.name === country);

    if (!countryObj) {
      console.warn(`Country "${country}" not found in Tourvisor`);
      return [];
    }

    // Get regions for this country
    const regions = await tourvisorApi.getRegions(countryObj.id);
    return regions.map(r => r.name).sort();
  } catch (error) {
    console.error('Failed to fetch cities from Tourvisor:', error);
    return [];
  }
}

/**
 * Get popular tours
 * Note: Returns empty array. Use search to get tours.
 */
export async function getPopularTours(): Promise<Tour[]> {
  // No hot tours API available - return empty array
  // Homepage will show search form instead
  return [];
}
