import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasApiKey: !!process.env.API_KEY,
    apiKeyPrefix: process.env.API_KEY?.substring(0, 10) + '...',
    hasPublicApiKey: !!process.env.NEXT_PUBLIC_API_KEY,
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    departureId: process.env.NEXT_PUBLIC_DEFAULT_DEPARTURE_ID,
  });
}
