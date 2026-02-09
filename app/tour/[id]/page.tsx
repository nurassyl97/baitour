"use client"

import { notFound } from "next/navigation"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Star,
  MapPin,
  Check,
  ChevronRight,
  Calendar,
  Building2,
  BedDouble,
  UtensilsCrossed,
  Plane,
  Briefcase,
  Shield,
  Utensils,
  Copy,
} from "lucide-react"
import { TourHeroGallery } from "@/components/tour/TourHeroGallery"
import type { Tour } from "@/lib/data"

interface TourPageProps {
  params: Promise<{ id: string }>
}

function getHotelName(tour: Tour): string {
  return tour.hotel?.name ?? tour.name.split(" - ")[0] ?? tour.name
}

function starCount(tour: Tour): number {
  const r = tour.hotel?.rating ?? tour.rating
  return Math.max(1, Math.min(5, Math.round(Number(r) || 4)))
}

export default function TourPage({ params }: TourPageProps) {
  const [tour, setTour] = useState<Tour | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"tours" | "about">("tours")
  const [copyDone, setCopyDone] = useState(false)

  useEffect(() => {
    async function loadTour() {
      const resolvedParams = await params
      if (!resolvedParams?.id) {
        notFound()
        return
      }
      const cleanId = String(resolvedParams.id).split(/[\s(]/)[0]
      try {
        const cached = localStorage.getItem("tourSearchResults")
        if (cached) {
          const tours: Tour[] = JSON.parse(cached)
          const foundTour = tours.find((t) => t.id === cleanId)
          if (foundTour) {
            setTour(foundTour)
            setIsLoading(false)
            return
          }
        }
      } catch {
        // ignore
      }
      try {
        const response = await fetch(`/api/tours/${cleanId}`)
        if (!response.ok) {
          notFound()
          return
        }
        const data = await response.json()
        setTour(data)
      } catch {
        notFound()
      } finally {
        setIsLoading(false)
      }
    }
    loadTour()
  }, [params])

  const selectedVariant = useMemo(() => {
    const variants = tour?.variants
    if (!variants?.length) return null
    if (selectedVariantId) {
      return variants.find((v) => v.id === selectedVariantId) ?? null
    }
    return variants.reduce((min, v) => (v.price < min.price ? v : min), variants[0])
  }, [tour, selectedVariantId])

  /** Показываем только самый дешёвый вариант тура */
  const displayVariants = useMemo(() => {
    const variants = tour?.variants
    if (!variants?.length) return []
    const cheapest = variants.reduce((min, v) => (v.price < min.price ? v : min), variants[0])
    return [cheapest]
  }, [tour])

  const copyLink = () => {
    if (typeof window === "undefined") return
    const url = window.location.href
    navigator.clipboard.writeText(url).then(() => {
      setCopyDone(true)
      setTimeout(() => setCopyDone(false), 2000)
    })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-[#22a7f0] border-t-transparent" />
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!tour) {
    notFound()
    return null
  }

  const hotelName = getHotelName(tour)
  const stars = starCount(tour)
  const images = tour.images?.length ? tour.images : [tour.image]
  const sidebarPrice = selectedVariant?.price ?? tour.price
  const sidebarCurrency = selectedVariant?.currency ?? tour.currency
  const reviewLabel =
    tour.reviewCount === 1
      ? "1 отзыв"
      : tour.reviewCount >= 2 && tour.reviewCount <= 4
        ? `${tour.reviewCount} отзыва`
        : `${tour.reviewCount} отзывов`

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <nav className="mb-4 text-sm text-gray-600">
          <Link href="/" className="text-[#22a7f0] hover:underline">
            Главная
          </Link>
          <span className="mx-2">›</span>
          <Link
            href={`/search?country=${encodeURIComponent(tour.country)}`}
            className="text-[#22a7f0] hover:underline"
          >
            {tour.country}
          </Link>
          <span className="mx-2">›</span>
          <span className="text-gray-900">{hotelName}</span>
        </nav>

        {/* Hotel name + meta row + copy link */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {hotelName}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: stars }).map((_, i) => (
                  <Star
                    key={i}
                    className="size-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="size-4 shrink-0" />
                <span>
                  {tour.city}
                  {tour.hotel?.name ? `, ${tour.country}` : `, ${tour.country}`}
                </span>
              </div>
              <div className="inline-flex items-center gap-1 rounded-md bg-[#22a7f0] px-2 py-0.5 text-white">
                <span className="font-semibold">
                  {Number(tour.rating).toFixed(1)}/5
                </span>
                <span className="text-white/90">{reviewLabel}</span>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 border-[#22a7f0] text-[#22a7f0] hover:bg-[#22a7f0]/10"
            onClick={copyLink}
          >
            <Copy className="mr-2 size-4" />
            {copyDone ? "Скопировано" : "Копировать ссылку"}
          </Button>
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left column: gallery + tabs + content */}
          <div className="lg:col-span-2 space-y-6">
            <TourHeroGallery
              images={images}
              alt={hotelName}
            />

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex gap-6">
                <button
                  type="button"
                  onClick={() => setActiveTab("tours")}
                  className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
                    activeTab === "tours"
                      ? "border-[#22a7f0] text-gray-900"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Туры
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("about")}
                  className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
                    activeTab === "about"
                      ? "border-[#22a7f0] text-gray-900"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Об отеле
                </button>
              </div>
            </div>

            {activeTab === "tours" && (
              <div className="space-y-4">
                {displayVariants.length > 0 ? (
                  displayVariants.map((variant, index) => {
                    const dateFrom = variant.date
                      ? new Date(variant.date)
                      : null
                    const dateTo =
                      dateFrom && variant.nights
                        ? new Date(dateFrom)
                        : null
                    if (dateTo && variant.nights)
                      dateTo.setDate(dateTo.getDate() + variant.nights)
                    const dateStr =
                      dateFrom && dateTo
                        ? `${dateFrom.toLocaleDateString("ru-RU", {
                            day: "numeric",
                            month: "short",
                          })} — ${dateTo.toLocaleDateString("ru-RU", {
                            day: "numeric",
                            month: "short",
                          })} (${variant.nights} ночей)`
                        : variant.date
                          ? new Date(variant.date).toLocaleDateString("ru-RU")
                          : "—"
                    const priceSymbol =
                      variant.currency === "KZT" ? "₸" : variant.currency
                    return (
                      <div
                        key={variant.id || index}
                        className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-stretch md:gap-0">
                          {/* Left: dates + occupancy (туроператор скрыт) */}
                          <div className="min-w-0 flex-1 space-y-2">
                            <h3 className="font-semibold text-gray-900">
                              Тур
                            </h3>
                            <div className="flex flex-col gap-1 text-sm text-gray-500">
                              <span className="flex items-center gap-2">
                                <Calendar className="size-4 shrink-0 text-gray-400" />
                                {dateStr}
                              </span>
                              <span className="flex items-center gap-2">
                                <BedDouble className="size-4 shrink-0 text-gray-400" />
                                2 взр
                              </span>
                            </div>
                          </div>
                          {/* Middle: size, meal (туроператор скрыт) */}
                          <div className="flex flex-1 flex-col gap-1 border-gray-200 pl-0 text-sm text-gray-500 md:border-l md:pl-5">
                            <span className="flex items-center gap-2">
                              <Building2 className="size-4 shrink-0 text-gray-400" />
                              Размер: —
                            </span>
                            <span className="flex items-center gap-2">
                              <UtensilsCrossed className="size-4 shrink-0 text-gray-400" />
                              {variant.meal || "Только завтрак"}
                            </span>
                          </div>
                          {/* Right: price + button (без «от других операторов») */}
                          <div className="flex shrink-0 flex-col items-end justify-between gap-3 border-gray-200 pl-0 md:border-l md:pl-5">
                            <div className="text-right">
                              <div className="text-xl font-bold text-gray-900">
                                {variant.price.toLocaleString("ru-RU")}{" "}
                                {priceSymbol}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              className="w-full shrink-0 bg-[#22a7f0] px-4 py-2 font-medium text-white hover:bg-[#1b8fd8] md:w-auto"
                              onClick={() => setSelectedVariantId(variant.id)}
                            >
                              Выбрано
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <Card className="border-amber-200 bg-amber-50/50">
                    <CardContent className="py-6 text-center text-gray-700">
                      Варианты туров с ценами доступны на{" "}
                      <Link
                        href="/search"
                        className="font-semibold text-[#22a7f0] hover:underline"
                      >
                        странице поиска
                      </Link>
                      .
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === "about" && (
              <div className="space-y-6">
                {tour.description && (
                  <Card>
                    <CardHeader>
                      <CardTitle>О туре</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="leading-relaxed text-gray-700">
                        {tour.description}
                      </p>
                    </CardContent>
                  </Card>
                )}
                {(tour.highlights?.length ?? 0) > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Основные моменты</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {tour.highlights!.map((h, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="mt-0.5 size-4 shrink-0 text-[#22a7f0]" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
                <Card>
                  <CardHeader>
                    <CardTitle>Размещение</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold text-gray-900">
                      {tour.hotel.name}
                    </p>
                    <div className="mt-2 flex items-center gap-1">
                      <Star className="size-4 fill-yellow-400 text-yellow-400" />
                      <span>{tour.hotel.rating}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {tour.hotel.amenities.map((a, i) => (
                        <span
                          key={i}
                          className="rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-700"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Тур с перелетом от{" "}
                    {sidebarPrice.toLocaleString("ru-RU")}{" "}
                    {sidebarCurrency === "KZT" ? "₸" : sidebarCurrency}
                  </h2>
                  <Link href="/search" className="mt-3 block">
                    <Button
                      variant="outline"
                      className="w-full border-[#22a7f0] text-[#22a7f0] hover:bg-[#22a7f0]/10"
                    >
                      Посмотреть все туры
                    </Button>
                  </Link>
                </div>

                <div className="mb-6">
                  <h3 className="mb-3 font-semibold text-gray-900">
                    В стоимость тура входит:
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <Plane className="size-4 shrink-0 text-[#22a7f0]" />
                      Перелет
                    </li>
                    <li className="flex items-center gap-2">
                      <Briefcase className="size-4 shrink-0 text-[#22a7f0]" />
                      Трансфер
                    </li>
                    <li className="flex items-center gap-2">
                      <Shield className="size-4 shrink-0 text-[#22a7f0]" />
                      Страховка
                    </li>
                    <li className="flex items-center gap-2">
                      <Utensils className="size-4 shrink-0 text-[#22a7f0]" />
                      Питание
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-3 font-semibold text-gray-900">
                    Услуги и удобства отеля
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {(tour.hotel.amenities ?? [])
                      .slice(0, 5)
                      .map((a, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="size-4 shrink-0 text-[#22a7f0]" />
                          {a}
                        </li>
                      ))}
                  </ul>
                  {tour.hotel.amenities && tour.hotel.amenities.length > 5 && (
                    <Link
                      href="#"
                      className="mt-2 inline-flex items-center gap-1 text-sm text-[#22a7f0] hover:underline"
                    >
                      Все услуги
                      <ChevronRight className="size-4" />
                    </Link>
                  )}
                </div>

                <Link
                  href={`/booking?tourId=${tour.id}${
                    selectedVariant?.id
                      ? `&variantId=${encodeURIComponent(selectedVariant.id)}`
                      : ""
                  }`}
                  className="mt-6 block"
                >
                  <Button size="lg" className="w-full bg-[#22a7f0] hover:bg-[#1b8fd8]">
                    Забронировать
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
