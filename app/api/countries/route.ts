import { NextResponse } from 'next/server';
import { getCountries } from '@/lib/api';

export async function GET() {
  try {
    const countries = await getCountries();
    // Wait for API response - no fallback
    if (!countries || countries.length === 0) {
      console.warn('API returned empty countries list');
      return NextResponse.json({ countries: [] });
    }
    return NextResponse.json({ countries });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Failed to fetch countries:', message);
    // Return error - let client handle it, no fallback
    return NextResponse.json(
      { error: 'Failed to fetch countries from API', countries: [] },
      { status: 500 }
    );
  }
}
