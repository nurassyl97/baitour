import { NextResponse } from 'next/server';
import { getCountries } from '@/lib/api';

export async function GET() {
  try {
    const countries = await getCountries();
    return NextResponse.json({ countries });
  } catch (error) {
    console.error('Failed to fetch countries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch countries' },
      { status: 500 }
    );
  }
}
