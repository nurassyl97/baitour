import { NextResponse } from 'next/server';
import { getCitiesByCountry } from '@/lib/api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country');

  if (!country) {
    return NextResponse.json(
      { error: 'Country parameter is required' },
      { status: 400 }
    );
  }

  try {
    const cities = await getCitiesByCountry(country);
    // Return empty array instead of error if API fails
    return NextResponse.json({ cities: cities || [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to fetch cities for country ${country}:`, message);
    // Return empty array instead of error for better UX
    return NextResponse.json({ cities: [] });
  }
}
