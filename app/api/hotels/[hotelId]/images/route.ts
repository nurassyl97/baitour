import { NextResponse } from 'next/server';
import { fetchHotelImages } from '@/lib/api';

/**
 * GET /api/hotels/[hotelId]/images
 * Returns normalized hotel images from Tourvisor hotel description API.
 * Photos come ONLY from GET /hotels/{id} (описания отелей), not from search API.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ hotelId: string }> }
) {
  try {
    const { hotelId } = await params;
    const id = parseInt(hotelId, 10);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: 'Invalid hotelId' }, { status: 400 });
    }
    const result = await fetchHotelImages(id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Hotel images API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hotel images' },
      { status: 500 }
    );
  }
}
