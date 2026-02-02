import { NextResponse } from "next/server";
import { getDepartureCities } from "@/lib/tourvisor-api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const departureCountryId = searchParams.get("departureCountryId");

  try {
    const depId = departureCountryId ? parseInt(departureCountryId) : undefined;
    const departures = await getDepartureCities(depId);
    return NextResponse.json({ departures });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Failed to fetch departure cities:", message);
    return NextResponse.json(
      { error: "Failed to fetch departure cities", departures: [] },
      { status: 500 }
    );
  }
}
