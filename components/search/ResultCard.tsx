"use client"

import Link from "next/link"
import { MapPin, Star } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { HotelImageSlideshow } from "@/components/search/HotelImageSlideshow"
import type { Tour } from "@/lib/data"

function getHotelName(tour: Tour): string {
  if (tour.hotel?.name) return tour.hotel.name
  const parts = tour.name.split(" - ")
  return parts[0] || tour.name
}

function deriveStars(tour: Tour): number {
  const raw = tour.hotel?.rating ?? tour.rating
  const n = Number.isFinite(raw) ? Math.round(raw) : 4
  return Math.max(1, Math.min(5, n))
}

function uniqueImages(images: string[], max = 20): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const url of images) {
    if (url && !seen.has(url)) {
      seen.add(url)
      out.push(url)
      if (out.length >= max) break
    }
  }
  return out
}

export function ResultCard({ tour }: { tour: Tour }) {
  const hotelName = getHotelName(tour)
  const stars = deriveStars(tour)
  const priceSymbol = tour.currency === "KZT" ? "₸" : tour.currency || "₸"
  const images = uniqueImages(tour.images?.length ? tour.images : [tour.image].filter(Boolean))

  return (
    <div className="group rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-0">
        <div className="relative block aspect-[4/3] md:aspect-auto md:h-full overflow-hidden rounded-t-[var(--radius)] md:rounded-l-[var(--radius)] md:rounded-tr-none">
          <HotelImageSlideshow
            images={images}
            alt={hotelName}
            tourId={tour.id}
            className="h-full w-full overflow-hidden rounded-[12px]"
          />
        </div>

        <div className="p-[var(--card-padding)] flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link href={`/tour/${tour.id}`} className="block" target="_blank" rel="noopener noreferrer">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold leading-6 line-clamp-2">
                    {hotelName}
                  </h3>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: stars }).map((_, i) => (
                      <Star key={i} className="size-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </Link>

              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="size-4" />
                <span className="truncate">{tour.city}</span>
              </div>
            </div>

            <div
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-sm font-semibold",
                "bg-blue-50 text-blue-700"
              )}
            >
              {tour.rating.toFixed(1)}
            </div>
          </div>

          <div className="flex items-end justify-between gap-4 mt-auto">
            <div>
              <div className="text-xs text-muted-foreground">Цена</div>
              <div className="text-xl font-extrabold">
                от {Math.round(tour.price).toLocaleString("ru-RU")} {priceSymbol}
              </div>
            </div>

            <Button asChild className="bg-[#22a7f0] hover:bg-[#1b8fd8] font-bold">
              <Link href={`/tour/${tour.id}`} target="_blank" rel="noopener noreferrer">Выбрать</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
