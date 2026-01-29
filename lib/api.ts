// API Service Layer for Tours
// This file handles all API requests and can switch between mock data and real API

import { Tour, SearchParams } from './data';
import * as mockData from './data';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';
const DATA_SOURCE = process.env.NEXT_PUBLIC_DATA_SOURCE || 'mock';

// Check if we should use real API or mock data
const useRealAPI = DATA_SOURCE === 'api' && API_BASE_URL;

/**
 * Generic API fetch wrapper with error handling
 */
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add API key if available
  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`;
    // or headers['X-API-Key'] = API_KEY; depending on your API
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}

/**
 * Get all tours
 * API Endpoint: GET /tours
 */
export async function getAllTours(): Promise<Tour[]> {
  if (!useRealAPI) {
    // Use mock data
    return mockData.getAllTours();
  }

  try {
    const data = await apiFetch<{ tours: Tour[] }>('/tours');
    return data.tours;
  } catch (error) {
    console.error('Failed to fetch tours, falling back to mock data:', error);
    return mockData.getAllTours();
  }
}

/**
 * Get tour by ID
 * API Endpoint: GET /tours/:id
 */
export async function getTourById(id: string): Promise<Tour | undefined> {
  if (!useRealAPI) {
    return mockData.getTourById(id);
  }

  try {
    const tour = await apiFetch<Tour>(`/tours/${id}`);
    return tour;
  } catch (error) {
    console.error(`Failed to fetch tour ${id}, falling back to mock data:`, error);
    return mockData.getTourById(id);
  }
}

/**
 * Get tour by slug
 * API Endpoint: GET /tours/slug/:slug
 */
export async function getTourBySlug(slug: string): Promise<Tour | undefined> {
  if (!useRealAPI) {
    return mockData.getTourBySlug(slug);
  }

  try {
    const tour = await apiFetch<Tour>(`/tours/slug/${slug}`);
    return tour;
  } catch (error) {
    console.error(`Failed to fetch tour by slug ${slug}, falling back to mock data:`, error);
    return mockData.getTourBySlug(slug);
  }
}

/**
 * Search tours with filters
 * API Endpoint: GET /tours/search?country=...&city=...
 */
export async function searchTours(params: SearchParams): Promise<Tour[]> {
  if (!useRealAPI) {
    return mockData.searchTours(params);
  }

  try {
    // Build query string
    const queryParams = new URLSearchParams();
    if (params.country) queryParams.append('country', params.country);
    if (params.city) queryParams.append('city', params.city);
    if (params.minPrice) queryParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);

    const data = await apiFetch<{ tours: Tour[] }>(`/tours/search?${queryParams.toString()}`);
    return data.tours;
  } catch (error) {
    console.error('Failed to search tours, falling back to mock data:', error);
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
 * Get unique countries from tours
 * API Endpoint: GET /tours/countries (or derived from tours)
 */
export async function getCountries(): Promise<string[]> {
  const tours = await getAllTours();
  const countries = [...new Set(tours.map(tour => tour.country))];
  return countries.sort();
}

/**
 * Get cities for a specific country
 * API Endpoint: GET /tours/cities?country=... (or derived from tours)
 */
export async function getCitiesByCountry(country: string): Promise<string[]> {
  const tours = await getAllTours();
  const cities = [...new Set(
    tours
      .filter(tour => tour.country === country)
      .map(tour => tour.city)
  )];
  return cities.sort();
}
