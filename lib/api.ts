// API Service Layer for Tours
// Integrates with Tourvisor API and provides fallback to mock data

import { Tour, SearchParams } from './data';
import * as mockData from './data';
import * as tourvisorApi from './tourvisor-api';
import * as tourvisorAdapter from './tourvisor-adapter';
import { TourvisorSearchRequest } from './tourvisor-types';

// API Configuration
const DATA_SOURCE = process.env.NEXT_PUBLIC_DATA_SOURCE || 'mock';
const DEFAULT_DEPARTURE_ID = parseInt(process.env.NEXT_PUBLIC_DEFAULT_DEPARTURE_ID || '27'); // Almaty

// Check if we should use real API or mock data
const useRealAPI = DATA_SOURCE === 'api' && tourvisorApi.isTourvisorConfigured();

/**
 * Convert our SearchParams to Tourvisor format
 */
function convertSearchParamsToTourvisor(params: SearchParams): TourvisorSearchRequest {
  // Default search parameters
  const tourvisorParams: TourvisorSearchRequest = {
    departureId: DEFAULT_DEPARTURE_ID,
    countryIds: [],
    nights: {
      from: 3,
      to: 14,
    },
    adults: 2,
    currency: 'USD',
  };

  // Map country name to ID (we'll need to get this from API first)
  // For now, use default countries if not specified
  if (params.country) {
    // This is a simplified mapping - in production, fetch country list from API
    const countryMap: { [key: string]: number } = {
      'Турция': 10,
      'ОАЭ': 15,
      'Египет': 20,
      'Мальдивы': 25,
      'Таиланд': 30,
    };
    const countryId = countryMap[params.country];
    if (countryId) {
      tourvisorParams.countryIds = [countryId];
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
 * Get all tours (popular tours from hot deals)
 */
export async function getAllTours(): Promise<Tour[]> {
  if (!useRealAPI) {
    return mockData.getAllTours();
  }

  try {
    // Get hot tours as featured tours
    const hotTours = await tourvisorApi.getHotTours({
      departureId: DEFAULT_DEPARTURE_ID,
      currency: 'USD',
      onlyCharter: false,
      limit: 20,
    });

    return tourvisorAdapter.transformHotTours(hotTours);
  } catch (error) {
    console.error('Failed to fetch tours from Tourvisor, falling back to mock data:', error);
    return mockData.getAllTours();
  }
}

/**
 * Get tour by ID
 */
export async function getTourById(id: string): Promise<Tour | undefined> {
  if (!useRealAPI) {
    return mockData.getTourById(id);
  }

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
    console.error(`Failed to fetch tour ${id} from Tourvisor, falling back to mock data:`, error);
    return mockData.getTourById(id);
  }
}

/**
 * Get tour by slug
 */
export async function getTourBySlug(slug: string): Promise<Tour | undefined> {
  if (!useRealAPI) {
    return mockData.getTourBySlug(slug);
  }

  // Extract tour ID from slug (format: hotel-name-country-nights-ID)
  const parts = slug.split('-');
  const tourId = parts[parts.length - 1];

  if (!tourId) {
    console.error('Invalid slug format:', slug);
    return mockData.getTourBySlug(slug);
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
  if (!useRealAPI) {
    return mockData.searchTours(params);
  }

  try {
    console.log('Starting Tourvisor search with params:', params);

    // Convert our params to Tourvisor format
    const tourvisorParams = convertSearchParamsToTourvisor(params);

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
    console.error('Failed to search tours via Tourvisor, falling back to mock data:', error);
    return mockData.searchTours(params);
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
 * Get unique countries
 */
export async function getCountries(): Promise<string[]> {
  if (!useRealAPI) {
    return mockData.getCountries();
  }

  try {
    const countries = await tourvisorApi.getCountries(DEFAULT_DEPARTURE_ID);
    return countries.map(c => c.name).sort();
  } catch (error) {
    console.error('Failed to fetch countries from Tourvisor:', error);
    return mockData.getCountries();
  }
}

/**
 * Get cities/regions for a specific country
 */
export async function getCitiesByCountry(country: string): Promise<string[]> {
  if (!useRealAPI) {
    return mockData.getCitiesByCountry(country);
  }

  try {
    // First, get the country ID
    const countries = await tourvisorApi.getCountries(DEFAULT_DEPARTURE_ID);
    const countryObj = countries.find(c => c.name === country);

    if (!countryObj) {
      console.warn(`Country "${country}" not found in Tourvisor`);
      return mockData.getCitiesByCountry(country);
    }

    // Get regions for this country
    const regions = await tourvisorApi.getRegions(countryObj.id);
    return regions.map(r => r.name).sort();
  } catch (error) {
    console.error('Failed to fetch cities from Tourvisor:', error);
    return mockData.getCitiesByCountry(country);
  }
}

/**
 * Get popular tours (hot deals)
 */
export async function getPopularTours(limit: number = 6): Promise<Tour[]> {
  if (!useRealAPI) {
    return mockData.getPopularTours(limit);
  }

  try {
    const hotTours = await tourvisorApi.getHotTours({
      departureId: DEFAULT_DEPARTURE_ID,
      currency: 'USD',
      onlyCharter: false,
      limit: limit,
    });

    return tourvisorAdapter.transformHotTours(hotTours);
  } catch (error) {
    console.error('Failed to fetch hot tours:', error);
    return mockData.getPopularTours(limit);
  }
}
