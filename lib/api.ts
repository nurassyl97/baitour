// API Service Layer for Tours
// Integrates with Tourvisor API

import { Tour, SearchParams } from './data';
import * as tourvisorApi from './tourvisor-api';
import * as tourvisorAdapter from './tourvisor-adapter';
import { TourvisorSearchRequest } from './tourvisor-types';

// API Configuration
const DEFAULT_DEPARTURE_ID = parseInt(process.env.NEXT_PUBLIC_DEFAULT_DEPARTURE_ID || '27'); // Almaty

// Always use Tourvisor API
const useRealAPI = true;

// Cache for country name to ID mapping
let countryNameToIdCache: Map<string, number> | null = null;

/**
 * Get country ID by name (supports Russian and English)
 */
async function getCountryIdByName(countryName: string): Promise<number | null> {
  try {
    // Build cache if not exists
    if (!countryNameToIdCache) {
      const countries = await tourvisorApi.getCountries(DEFAULT_DEPARTURE_ID);
      countryNameToIdCache = new Map();
      countries.forEach(country => {
        countryNameToIdCache!.set(country.name.toLowerCase(), country.id);
      });
      console.log('Country cache built:', Array.from(countryNameToIdCache.keys()));
    }

    // Try exact match first
    const normalizedName = countryName.toLowerCase().trim();
    console.log(`Looking for country: "${normalizedName}"`);
    const countryId = countryNameToIdCache.get(normalizedName);
    if (countryId) {
      console.log(`Found country ID: ${countryId}`);
      return countryId;
    }
    console.warn(`Country "${countryName}" not found in cache`);


    // Try mapping common English names to Russian
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

    const russianName = englishToRussian[countryName.toLowerCase()];
    if (russianName) {
      return countryNameToIdCache.get(russianName) || null;
    }

    return null;
  } catch (error) {
    console.error('Failed to get country ID:', error);
    return null;
  }
}

/**
 * Convert our SearchParams to Tourvisor format
 */
async function convertSearchParamsToTourvisor(params: SearchParams): Promise<TourvisorSearchRequest> {
  // Default search parameters
  const tourvisorParams: TourvisorSearchRequest = {
    departureId: DEFAULT_DEPARTURE_ID,
    countryIds: [],
    nights: {
      from: params.nightsFrom || 6,
      to: params.nightsTo || 6,
    },
    adults: params.adults || 2,
    children: params.children || 0,
    currency: 'KZT', // Kazakhstan Tenge
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  };

  // Map country name to ID
  if (params.country) {
    const countryId = await getCountryIdByName(params.country);
    if (countryId) {
      tourvisorParams.countryIds = [countryId];
    } else {
      console.warn(`Country "${params.country}" not found in Tourvisor`);
    }
  }

  // Hotel category (rating)
  if (params.hotelCategory && params.hotelCategory > 0) {
    tourvisorParams.hotelCategory = params.hotelCategory;
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
 * Get tour by ID
 */
export async function getTourById(id: string): Promise<Tour | undefined> {
  try {
    const tourvisorTour = await tourvisorApi.getTourDetails(id);
    
    // Optionally fetch hotel description for better data
    let hotelDescription;
    try {
      hotelDescription = await tourvisorApi.getHotelDescription(tourvisorTour.hotel.id);
    } catch (error) {
      console.warn('Could not fetch hotel description:', error);
    }

    return tourvisorAdapter.transformTourvisorTour(tourvisorTour, hotelDescription);
  } catch (error) {
    console.error(`Failed to fetch tour ${id} from Tourvisor:`, error);
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
      console.warn('No valid country selected for search');
      return [];
    }

    console.log('Tourvisor search params:', tourvisorParams);

    // Start the search
    const searchId = await tourvisorApi.startTourSearch(tourvisorParams);
    console.log('Search started with ID:', searchId);

    // Poll for results with progress callback
    const tourvisorTours = await tourvisorApi.pollSearchResults(searchId, 30, onProgress);
    console.log(`Found ${tourvisorTours.length} tours from Tourvisor`);

    // Transform to our format
    const tours = tourvisorAdapter.transformTours(tourvisorTours);

    // Apply client-side sorting if specified
    if (params.sortBy) {
      switch (params.sortBy) {
        case 'price-asc':
          tours.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          tours.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          tours.sort((a, b) => b.rating - a.rating);
          break;
      }
    }

    return tours;
  } catch (error) {
    console.error('Failed to search tours via Tourvisor:', error);
    throw error; // Re-throw to let caller handle the error
  }
}

/**
 * Submit booking request
 * API Endpoint: POST /bookings
 */
export interface BookingRequest {
  tourId: string;
  fullName: string;
  email: string;
  phone: string;
  travelDate: string;
  adults: number;
  children: number;
  specialRequests?: string;
}

export async function submitBooking(booking: BookingRequest): Promise<{ success: boolean; bookingId?: string; message?: string }> {
  if (!useRealAPI) {
    // Mock success response
    console.log('Mock booking submitted:', booking);
    return {
      success: true,
      bookingId: `MOCK-${Date.now()}`,
      message: 'Бронирование успешно отправлено (mock mode)',
    };
  }

  try {
    const response = await apiFetch<{ bookingId: string; message: string }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(booking),
    });

    return {
      success: true,
      bookingId: response.bookingId,
      message: response.message,
    };
  } catch (error) {
    console.error('Failed to submit booking:', error);
    return {
      success: false,
      message: 'Не удалось отправить бронирование. Пожалуйста, попробуйте позже.',
    };
  }
}

/**
 * Get unique countries from Tourvisor API
 */
export async function getCountries(): Promise<string[]> {
  try {
    const countries = await tourvisorApi.getCountries(DEFAULT_DEPARTURE_ID);
    return countries.map(c => c.name).sort();
  } catch (error) {
    console.error('Failed to fetch countries from Tourvisor:', error);
    return [];
  }
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
export async function getPopularTours(limit: number = 6): Promise<Tour[]> {
  // No hot tours API available - return empty array
  // Homepage will show search form instead
  return [];
}
