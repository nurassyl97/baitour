// Tourvisor API Client
// Documentation: https://api.tourvisor.ru/search/docs

import {
  Departure,
  Country,
  Region,
  SubRegion,
  Arrival,
  Meal,
  Operator,
  HotelType,
  HotelGroupService,
  Currency,
  CurrencyRate,
  TourvisorSearchRequest,
  TourvisorSearchResponse,
  TourvisorSearchResult,
  TourvisorTour,
  TourvisorHotelDescription,
  TourvisorHotTour,
} from './tourvisor-types';
import { tourvisorCache } from './tourvisor-cache';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.tourvisor.ru/search/api/v1';
const API_KEY = process.env.API_KEY || ''; // Server-side only, not exposed to client
const DEFAULT_DEPARTURE_ID = parseInt(process.env.NEXT_PUBLIC_DEFAULT_DEPARTURE_ID || '27'); // Almaty

// Sleep helper
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generic API fetch with Tourvisor authentication
 */
async function tourvisorFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add JWT token
  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Tourvisor API Error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return await response.json();
}

/**
 * API fetch with retry logic for rate limiting
 */
async function tourvisorFetchWithRetry<T>(
  endpoint: string,
  options?: RequestInit,
  maxRetries: number = 3
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await tourvisorFetch<T>(endpoint, options);
    } catch (error: any) {
      // Rate limit hit (429)
      if (error.message?.includes('429')) {
        console.warn(`Rate limit hit, waiting 60 seconds... (attempt ${attempt + 1}/${maxRetries})`);
        await sleep(60000); // Wait 1 minute
        continue;
      }

      // Server error (5xx) - retry with exponential backoff
      if (error.message?.includes('50')) {
        const delay = 1000 * Math.pow(2, attempt);
        console.warn(`Server error, retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`);
        await sleep(delay);
        continue;
      }

      // Last attempt or non-retryable error
      if (attempt === maxRetries - 1) {
        throw error;
      }

      // Generic retry with delay
      await sleep(1000 * (attempt + 1));
    }
  }

  throw new Error('Max retries exceeded');
}

// ============= Reference Books (Справочники) =============

/**
 * Get departure cities (города вылета)
 * @param departureCountryId Optional country ID (1=Russia, 3=Kazakhstan)
 */
export async function getDepartureCities(departureCountryId?: number): Promise<Departure[]> {
  const cacheKey = `departures-${departureCountryId || 'all'}`;
  
  return tourvisorCache.getOrFetch(cacheKey, async () => {
    const params = departureCountryId ? `?departureCountryId=${departureCountryId}` : '';
    return await tourvisorFetchWithRetry<Departure[]>(`/departures${params}`);
  }, 1440); // Cache for 24 hours
}

/**
 * Get countries (страны)
 * @param departureId Optional departure city ID
 * @param onlyCharter Optional flag for charter flights only
 */
export async function getCountries(departureId?: number, onlyCharter?: boolean): Promise<Country[]> {
  const cacheKey = `countries-${departureId || 'all'}-${onlyCharter || false}`;
  
  return tourvisorCache.getOrFetch(cacheKey, async () => {
    const params = new URLSearchParams();
    if (departureId) params.append('departureId', departureId.toString());
    if (onlyCharter !== undefined) params.append('onlyCharter', onlyCharter.toString());
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await tourvisorFetchWithRetry<Country[]>(`/countries${queryString}`);
  }, 1440);
}

/**
 * Get arrival cities/airports (города прилёта)
 * @param departureId Required departure city ID
 * @param countryId Optional country ID
 */
export async function getArrivalCities(departureId: number, countryId?: number): Promise<Arrival[]> {
  const cacheKey = `arrivals-${departureId}-${countryId || 'all'}`;
  
  return tourvisorCache.getOrFetch(cacheKey, async () => {
    const params = new URLSearchParams();
    params.append('departureId', departureId.toString());
    if (countryId) params.append('countryId', countryId.toString());
    
    return await tourvisorFetchWithRetry<Arrival[]>(`/arrivals?${params.toString()}`);
  }, 1440);
}

/**
 * Get regions/resorts (курорты)
 * @param countryId Optional country ID
 */
export async function getRegions(countryId?: number): Promise<Region[]> {
  const cacheKey = `regions-${countryId || 'all'}`;
  
  return tourvisorCache.getOrFetch(cacheKey, async () => {
    const params = countryId ? `?countryId=${countryId}` : '';
    return await tourvisorFetchWithRetry<Region[]>(`/regions${params}`);
  }, 1440);
}

/**
 * Get subregions (субкурорты)
 * @param regionId Optional region ID
 */
export async function getSubRegions(regionId?: number): Promise<SubRegion[]> {
  const cacheKey = `subregions-${regionId || 'all'}`;
  
  return tourvisorCache.getOrFetch(cacheKey, async () => {
    const params = regionId ? `?regionId=${regionId}` : '';
    return await tourvisorFetchWithRetry<SubRegion[]>(`/subregions${params}`);
  }, 1440);
}

/**
 * Get meal types (типы питания)
 */
export async function getMealTypes(): Promise<Meal[]> {
  return tourvisorCache.getOrFetch('meals', async () => {
    return await tourvisorFetchWithRetry<Meal[]>('/meals');
  }, 1440);
}

/**
 * Get tour operators (операторы)
 */
export async function getOperators(): Promise<Operator[]> {
  return tourvisorCache.getOrFetch('operators', async () => {
    return await tourvisorFetchWithRetry<Operator[]>('/operators');
  }, 1440);
}

/**
 * Get hotel types (типы отелей)
 */
export async function getHotelTypes(): Promise<HotelType[]> {
  return tourvisorCache.getOrFetch('hotel-types', async () => {
    return await tourvisorFetchWithRetry<HotelType[]>('/hotel-types');
  }, 1440);
}

/**
 * Get hotel services grouped (услуги в отелях)
 */
export async function getHotelServices(): Promise<HotelGroupService[]> {
  return tourvisorCache.getOrFetch('hotel-services', async () => {
    return await tourvisorFetchWithRetry<HotelGroupService[]>('/hotel-group-services');
  }, 1440);
}

/**
 * Get available currencies (валюты)
 */
export async function getCurrencies(): Promise<Currency[]> {
  return tourvisorCache.getOrFetch('currencies', async () => {
    return await tourvisorFetchWithRetry<Currency[]>('/currencies');
  }, 1440);
}

/**
 * Get currency rates (курсы валют)
 */
export async function getCurrencyRates(): Promise<CurrencyRate[]> {
  return tourvisorCache.getOrFetch('currency-rates', async () => {
    return await tourvisorFetchWithRetry<CurrencyRate[]>('/currency-rates');
  }, 60); // Cache for 1 hour (rates change)
}

// ============= Tour Search =============

/**
 * Start tour search (запуск поиска туров)
 * Returns searchId for polling results
 */
export async function startTourSearch(params: TourvisorSearchRequest): Promise<string> {
  console.log('Starting tour search with params:', params);
  console.log('Date values - dateFrom:', params.dateFrom, 'dateTo:', params.dateTo);
  
  // Build query string from params - following exact API spec
  const queryParams = new URLSearchParams();
  
  // Required parameters
  queryParams.append('departureId', params.departureId.toString());
  if (params.countryIds && params.countryIds.length > 0) {
    // API expects singular countryId, take first one
    queryParams.append('countryId', params.countryIds[0].toString());
  }
  // Nights range - TESTING: Set both to same value
  const nightsValue = params.nights.from; // Use nightsFrom value for both
  queryParams.append('nightsFrom', nightsValue.toString());
  queryParams.append('nightsTo', nightsValue.toString()); // Same as nightsFrom
  console.log('Nights being sent (same value):', nightsValue);
  queryParams.append('adults', params.adults.toString());
  queryParams.append('currency', params.currency);
  queryParams.append('onlyCharter', (params.onlyCharter || false).toString());
  
  // Date range - BOTH are required
  // Ensure dateFrom
  let finalDateFrom: string;
  if (params.dateFrom) {
    finalDateFrom = params.dateFrom;
  } else {
    // Default to 7 days from now
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    finalDateFrom = sevenDaysLater.toISOString().split('T')[0];
  }
  queryParams.append('dateFrom', finalDateFrom);
  
  // Ensure dateTo - must be AFTER dateFrom
  let finalDateTo: string;
  if (params.dateTo) {
    finalDateTo = params.dateTo;
  } else {
    // Default to dateFrom + 7 days (not 30 days from today)
    const dateFromObj = new Date(finalDateFrom);
    dateFromObj.setDate(dateFromObj.getDate() + 7);
    finalDateTo = dateFromObj.toISOString().split('T')[0];
  }
  queryParams.append('dateTo', finalDateTo);
  
  console.log('Final dates being sent:', { finalDateFrom, finalDateTo });
  
  // Optional parameters
  if (params.arrivalCityIds && params.arrivalCityIds.length > 0) {
    queryParams.append('arrivalId', params.arrivalCityIds[0].toString());
  }
  if (params.priceFrom) {
    queryParams.append('priceFrom', params.priceFrom.toString());
  }
  if (params.priceTo) {
    queryParams.append('priceTo', params.priceTo.toString());
  }
  if (params.regionIds && params.regionIds.length > 0) {
    params.regionIds.forEach(id => queryParams.append('regionIds', id.toString()));
  }
  if (params.meal) {
    queryParams.append('meal', params.meal.toString());
  }
  if (params.hotelCategory) {
    queryParams.append('hotelCategory', params.hotelCategory.toString());
  }
  
  const fullUrl = `/search?${queryParams.toString()}`;
  console.log('Calling Tourvisor API with URL:', fullUrl);
  console.log('Full query params:', queryParams.toString());
  
  const response = await tourvisorFetchWithRetry<TourvisorSearchResponse>(fullUrl, {
    method: 'GET',
  });

  return response.searchId;
}

/**
 * Get search results (получение результатов поиска)
 * @param searchId Search ID from startTourSearch
 */
export async function getSearchResults(searchId: string): Promise<TourvisorSearchResult> {
  return await tourvisorFetch<TourvisorSearchResult>(`/search/result?searchId=${searchId}`);
}

/**
 * Get search status (статус поискового запроса)
 * @param searchId Search ID from startTourSearch
 */
export async function getSearchStatus(searchId: string): Promise<{ isComplete: boolean; progress?: number }> {
  return await tourvisorFetch<{ isComplete: boolean; progress?: number }>(`/search/status?searchId=${searchId}`);
}

/**
 * Poll search results until complete
 * @param searchId Search ID from startTourSearch
 * @param maxAttempts Maximum polling attempts (default: 30)
 * @param onProgress Optional callback for progress updates
 */
export async function pollSearchResults(
  searchId: string,
  maxAttempts: number = 30,
  onProgress?: (progress: number) => void
): Promise<TourvisorTour[]> {
  let attempts = 0;
  let delay = 1000; // Start with 1 second
  let allTours: TourvisorTour[] = [];

  console.log(`Starting to poll search results for searchId: ${searchId}`);

  while (attempts < maxAttempts) {
    try {
      const result = await getSearchResults(searchId);

      // Accumulate tours
      if (result.tours && result.tours.length > 0) {
        // Add only new tours (avoid duplicates)
        const existingIds = new Set(allTours.map(t => t.id));
        const newTours = result.tours.filter(t => !existingIds.has(t.id));
        allTours.push(...newTours);
      }

      // Update progress
      if (result.progress !== undefined && onProgress) {
        onProgress(result.progress);
      }

      // Check if complete
      if (result.isComplete) {
        console.log(`Search complete! Found ${allTours.length} tours`);
        return allTours;
      }

      // Wait before next poll (exponential backoff up to 5 seconds)
      await sleep(delay);
      delay = Math.min(delay * 1.2, 5000);
      attempts++;

    } catch (error) {
      console.error(`Error polling search results (attempt ${attempts + 1}):`, error);
      
      // If we have some results, return them
      if (allTours.length > 0) {
        console.warn('Returning partial results due to error');
        return allTours;
      }

      // Otherwise retry
      if (attempts >= maxAttempts - 1) {
        throw error;
      }
      await sleep(delay);
      delay = Math.min(delay * 1.5, 5000);
      attempts++;
    }
  }

  // Timeout - return what we have
  if (allTours.length > 0) {
    console.warn(`Search timeout after ${maxAttempts} attempts, returning ${allTours.length} partial results`);
    return allTours;
  }

  throw new Error(`Search timeout after ${maxAttempts} attempts with no results`);
}

/**
 * Continue search (продолжение поиска)
 * For extending search to more operators
 */
export async function continueTourSearch(searchId: string): Promise<void> {
  await tourvisorFetchWithRetry(`/search/continue?searchId=${searchId}`, {
    method: 'POST',
  });
}

/**
 * Get tour details (данные тура)
 * @param tourId Tour ID
 */
export async function getTourDetails(tourId: string): Promise<TourvisorTour> {
  return await tourvisorFetchWithRetry<TourvisorTour>(`/tours/${tourId}`);
}

/**
 * Get tour flights and actualized prices (авиарейсы тура)
 * @param tourId Tour ID
 */
export async function getTourFlights(tourId: string): Promise<TourvisorTour> {
  return await tourvisorFetchWithRetry<TourvisorTour>(`/tour-flights?tourId=${tourId}`);
}

// ============= Hotel Description =============

/**
 * Get hotel description (описание отеля)
 * @param hotelId Hotel ID
 */
export async function getHotelDescription(hotelId: number): Promise<TourvisorHotelDescription> {
  const cacheKey = `hotel-${hotelId}`;
  
  return tourvisorCache.getOrFetch(cacheKey, async () => {
    return await tourvisorFetchWithRetry<TourvisorHotelDescription>(`/hotels/${hotelId}`);
  }, 1440); // Cache for 24 hours
}

// ============= Hot Tours =============

/**
 * Get hot tours (горящие туры)
 */
export async function getHotTours(params: {
  departureId: number;
  countryIds?: number[];
  dateFrom?: string;
  dateTo?: string;
  meal?: number;
  hotelCategory?: number;
  noVisa?: boolean;
  regionIds?: number[];
  operatorIds?: number[];
  currency: string;
  onlyCharter?: boolean;
  limit?: number;
}): Promise<TourvisorHotTour[]> {
  const queryParams = new URLSearchParams();
  
  queryParams.append('departureId', params.departureId.toString());
  queryParams.append('currency', params.currency);
  queryParams.append('onlyCharter', (params.onlyCharter || false).toString());
  queryParams.append('limit', (params.limit || 50).toString());
  
  if (params.countryIds && params.countryIds.length > 0) {
    params.countryIds.forEach(id => queryParams.append('countryIds', id.toString()));
  }
  if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
  if (params.dateTo) queryParams.append('dateTo', params.dateTo);
  if (params.meal !== undefined) queryParams.append('meal', params.meal.toString());
  if (params.hotelCategory !== undefined) queryParams.append('hotelCategory', params.hotelCategory.toString());
  if (params.noVisa !== undefined) queryParams.append('noVisa', params.noVisa.toString());
  if (params.regionIds && params.regionIds.length > 0) {
    params.regionIds.forEach(id => queryParams.append('regionIds', id.toString()));
  }
  if (params.operatorIds && params.operatorIds.length > 0) {
    params.operatorIds.forEach(id => queryParams.append('operatorIds', id.toString()));
  }

  return await tourvisorFetchWithRetry<TourvisorHotTour[]>(`/tours/hots?${queryParams.toString()}`);
}

// ============= Helper Functions =============

/**
 * Get default departure city (Almaty)
 */
export function getDefaultDepartureId(): number {
  return DEFAULT_DEPARTURE_ID;
}

/**
 * Check if API is configured
 */
export function isTourvisorConfigured(): boolean {
  return Boolean(API_KEY && API_BASE_URL);
}

/**
 * Clear all cached data
 */
export function clearCache(): void {
  tourvisorCache.clear();
}
