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
    return NextResponse.json({ cities });
  } catch (error) {
    console.error(`Failed to fetch cities for country ${country}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch cities' },
      { status: 500 }
    );
  }
}
