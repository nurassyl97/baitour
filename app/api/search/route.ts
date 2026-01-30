import { NextResponse } from 'next/server';
import { searchTours } from '@/lib/api';
import { SearchParams } from '@/lib/data';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { country, city, nights, minPrice, maxPrice, sortBy, travelers } = body;

    const params: SearchParams = {
      country,
      city,
      nights,
      minPrice,
      maxPrice,
      sortBy,
    };

    console.log('API route received search params:', params);

    // Call the server-side searchTours function
    const tours = await searchTours(params);

    return NextResponse.json({ tours });
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search tours' },
      { status: 500 }
    );
  }
}
