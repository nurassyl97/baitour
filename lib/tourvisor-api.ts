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
  TourvisorTour,
  TourvisorHotelDescription,
  TourvisorHotTour,
  TourvisorSearchHotel,
} from './tourvisor-types';
import { tourvisorCache } from './tourvisor-cache';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.tourvisor.ru/search/api/v1';
const API_KEY = process.env.API_KEY || ''; // Server-side only, not exposed to client
const DEFAULT_DEPARTURE_ID = parseInt(process.env.NEXT_PUBLIC_DEFAULT_DEPARTURE_ID || '27'); // Almaty

// Sleep helper
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

/**
 * Generic API fetch with Tourvisor authentication
 */
async function tourvisorFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log(`[Tourvisor API] Calling: ${options.method || 'GET'} ${url}`);
  if (options.body) {
    console.log(`[Tourvisor API] Body:`, options.body);
  }
  
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  // Add JWT token
  if (API_KEY) {
    headers.set('Authorization', `Bearer ${API_KEY}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Tourvisor API] Error ${response.status}: ${errorText}`);
    console.error(`[Tourvisor API] Full URL was: ${url}`);
    throw new Error(`Tourvisor API Error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const responseData = await response.json();
  const isArray = Array.isArray(responseData);
  const preview = (() => {
    if (!isArray) return JSON.stringify(responseData).substring(0, 300);

    const arr = responseData as unknown[];
    const first = arr[0];
    if (!first || typeof first !== 'object') return `Array[${arr.length}]`;

    const rec = first as Record<string, unknown>;
    const keys = Object.keys(rec).slice(0, 15).join(',');
    const sampleId = typeof rec.id === 'number' || typeof rec.id === 'string' ? String(rec.id) : 'n/a';
    const sampleName = typeof rec.name === 'string' ? rec.name : 'n/a';
    return `Array[${arr.length}] keys=[${keys}] sampleId=${sampleId} sampleName=${JSON.stringify(sampleName)}`;
  })();
  console.log(`[Tourvisor API] Success ${response.status}: ${preview}`);
  
  return responseData;
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
    } catch (error: unknown) {
      const err = toError(error);
      const message = err.message;
      // Rate limit hit (429)
      if (message.includes('429') || message.includes('Too Many Requests')) {
        if (attempt < maxRetries - 1) {
          // For trial API: wait longer (60 seconds) to avoid hitting limits
          const waitTime = 60;
          console.warn(`Rate limit hit (trial API), waiting ${waitTime} seconds... (attempt ${attempt + 1}/${maxRetries})`);
          await sleep(waitTime * 1000);
          continue;
        } else {
          // Last attempt failed - throw error so user knows
          throw new Error('Tourvisor API Error: 429 Too Many Requests - Пожалуйста, подождите минуту перед следующим поиском');
        }
      }

      // Server error (5xx) - retry with exponential backoff
      if (message.includes('50')) {
        const delay = 1000 * Math.pow(2, attempt);
        console.warn(`Server error, retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`);
        await sleep(delay);
        continue;
      }

      // Last attempt or non-retryable error
      if (attempt === maxRetries - 1) {
        throw err;
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
  }, 10080); // Cache for 7 days (trial API optimization - minimize requests)
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
  }, 10080); // Cache for 7 days (trial API optimization - minimize requests)
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
  // For trial API: add small delay to avoid hitting rate limits
  await sleep(1000); // Wait 1 second before search request
  
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
  // Nights range
  const nightsFrom = params.nights.from;
  const nightsTo = Math.max(params.nights.to, nightsFrom);
  queryParams.append('nightsFrom', nightsFrom.toString());
  queryParams.append('nightsTo', nightsTo.toString());
  console.log('Nights range being sent:', { nightsFrom, nightsTo });
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
  // if (params.arrivalCityIds && params.arrivalCityIds.length > 0) {
  //   queryParams.append('arrivalId', params.arrivalCityIds[0].toString());
  // }
  if (params.priceFrom !== undefined) {
    queryParams.append('priceFrom', params.priceFrom.toString());
  }
  if (params.priceTo !== undefined) {
    queryParams.append('priceTo', params.priceTo.toString());
  }
  // if (params.regionIds && params.regionIds.length > 0) {
  //   params.regionIds.forEach(id => queryParams.append('regionIds', id.toString()));
  // }
  // if (params.meal) {
  //   queryParams.append('meal', params.meal.toString());
  // }
  // if (params.hotelCategory) {
  //   queryParams.append('hotelCategory', params.hotelCategory.toString());
  // }
  // if (params.hotelRating !== undefined && params.hotelRating > 0) {
  //   queryParams.append('hotelRating', params.hotelRating.toString());
  // }
  
  // Correct endpoint path: /tours/search (not /search)
  const fullUrl = `/tours/search?${queryParams.toString()}`;
  console.log('Calling Tourvisor API with URL:', fullUrl);
  console.log('Full query params:', queryParams.toString());
  console.log('Base URL:', API_BASE_URL);
  
  const response = await tourvisorFetchWithRetry<TourvisorSearchResponse>(fullUrl, {
    method: 'GET',
  });

  return response.searchId;
}

/**
 * Get search results (получение результатов поиска)
 * @param searchId Search ID from startTourSearch
 * @param limit Number of hotels with tours to return (default: 25)
 * Note: API returns array of tours directly, not wrapped in an object
 */
export async function getSearchResults(searchId: string, limit: number = 25): Promise<TourvisorSearchHotel[]> {
  return await tourvisorFetch<TourvisorSearchHotel[]>(`/tours/search/${searchId}?limit=${limit}`);
}

/**
 * Get search status (статус поискового запроса)
 * @param searchId Search ID from startTourSearch
 */
export async function getSearchStatus(searchId: string): Promise<{ isComplete: boolean; progress?: number }> {
  return await tourvisorFetch<{ isComplete: boolean; progress?: number }>(`/tours/search/${searchId}/status`);
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
): Promise<TourvisorSearchHotel[]> {
  let attempts = 0;
  let delay = 2000; // Start with 2 seconds (give search time to initialize)
  const allTours: TourvisorSearchHotel[] = [];

  console.log(`Starting to poll search results for searchId: ${searchId}`);
  
  // Wait 3 seconds before first attempt (let search initialize)
  console.log('Waiting 3 seconds for search to initialize...');
  await sleep(3000);

  while (attempts < maxAttempts) {
    try {
      onProgress?.(Math.min(99, Math.round((attempts / maxAttempts) * 100)));
      const tours = await getSearchResults(searchId);

      // API returns array directly - accumulate tours
      if (tours && tours.length > 0) {
        // Add only new tours (avoid duplicates)
        const existingIds = new Set(allTours.map(t => t.id));
        const newTours = tours.filter(t => !existingIds.has(t.id));
        allTours.push(...newTours);
        
        console.log(`Search complete! Found ${allTours.length} tours`);
        onProgress?.(100);
        return allTours;
      }

      // No tours yet - continue polling
      await sleep(delay);
      delay = Math.min(delay * 1.2, 5000);
      attempts++;

    } catch (error: unknown) {
      const err = toError(error);
      console.error(`Error polling search results (attempt ${attempts + 1}):`, err);
      
      // If 404, search might not be ready yet - wait longer and retry
      if (err.message.includes('404') && attempts < 5) {
        console.log('Search not found (404) - waiting longer for initialization...');
        await sleep(5000); // Wait 5 seconds for 404 errors
        attempts++;
        continue;
      }
      
      // If we have some results, return them
      if (allTours.length > 0) {
        console.warn('Returning partial results due to error');
        return allTours;
      }

      // Otherwise retry
      if (attempts >= maxAttempts - 1) {
        throw err;
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
  await tourvisorFetchWithRetry(`/tours/search/${searchId}/continue`, {
    method: 'GET',
  });
}

/**
 * Get tour details (данные тура)
 * @param tourId Tour ID
 */
export async function getTourDetails(tourId: string, currency: string = 'KZT'): Promise<TourvisorTour> {
  return await tourvisorFetchWithRetry<TourvisorTour>(`/tours/${tourId}?currency=${currency}`);
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
