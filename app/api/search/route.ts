import { NextResponse } from 'next/server';
import { searchTours } from '@/lib/api';
import { SearchParams } from '@/lib/data';

// Allow long-running search (Tourvisor polling can take 30–60s); avoid serverless timeout on mobile
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      country, 
      city, 
      departureId,
      dateFrom, 
      dateTo, 
      nightsFrom, 
      nightsTo, 
      adults, 
      children, 
      hotelCategory,
      hotelRating,
      meal,
      minPrice, 
      maxPrice, 
      sortBy 
    } = body;

    const params: SearchParams = {
      country,
      city,
      departureId,
      dateFrom,
      dateTo,
      nightsFrom,
      nightsTo,
      adults,
      children,
      hotelCategory,
      hotelRating,
      meal,
      minPrice,
      maxPrice,
      sortBy,
    };

    console.log('API route received search params:', params);

    // Call the server-side searchTours function
    const tours = await searchTours(params);

    return NextResponse.json({ tours });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Search API error:', message);
    
    // Handle rate limiting with appropriate status code
    if (message.includes('429') || message.includes('Too Many Requests')) {
      return NextResponse.json(
        { error: message || 'Too many requests to API. Please wait and try again.' },
        { status: 429 }
      );
    }
    
    // Handle other errors
    return NextResponse.json(
      { error: message || 'Failed to search tours' },
      { status: 500 }
    );
  }
}
