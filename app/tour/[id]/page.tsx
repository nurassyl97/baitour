"use client";

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Star,
  MapPin,
  Clock,
  Check,
  X,
  Hotel,
} from "lucide-react";
import type { Tour } from "@/lib/data";

interface TourPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function TourPage({ params }: TourPageProps) {
  const [tour, setTour] = useState<Tour | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  useEffect(() => {
    async function loadTour() {
      const resolvedParams = await params;
      
      if (!resolvedParams?.id) {
        notFound();
        return;
      }
      
      const cleanId = String(resolvedParams.id).split(/[\s(]/)[0];
      
      // Try localStorage first (with variants)
      try {
        const cached = localStorage.getItem('tourSearchResults');
        if (cached) {
          const tours: Tour[] = JSON.parse(cached);
          const foundTour = tours.find(t => t.id === cleanId);
          if (foundTour) {
            console.log(`Found tour ${cleanId} in cache with ${foundTour.variants?.length || 0} variants`);
            setTour(foundTour);
            setIsLoading(false);
            return;
          }
        }
      } catch (error) {
        console.warn('Failed to load from cache:', error);
      }
      
      // Fallback to API
      try {
        const response = await fetch(`/api/tours/${cleanId}`);
        if (!response.ok) {
          notFound();
          return;
        }
        const data = await response.json();
        setTour(data);
      } catch (error) {
        console.error('Failed to load tour:', error);
        notFound();
      } finally {
        setIsLoading(false);
      }
    }
    
    loadTour();
  }, [params]);

  const selectedVariant = useMemo(() => {
    const variants = tour?.variants;
    if (!variants || variants.length === 0) return null;

    if (selectedVariantId) {
      return variants.find((v) => v.id === selectedVariantId) ?? null;
    }

    return variants.reduce((min, v) => (v.price < min.price ? v : min), variants[0]);
  }, [tour, selectedVariantId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!tour) {
    notFound();
    return null;
  }

  const sidebarPrice = selectedVariant?.price ?? tour.price;
  const sidebarCurrency = selectedVariant?.currency ?? tour.currency;
  const sidebarDuration =
    selectedVariant?.nights !== undefined && selectedVariant?.nights !== null
      ? `${selectedVariant.nights + 1} дней / ${selectedVariant.nights} ночей`
      : tour.duration;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Image Gallery */}
      <div className="relative h-[500px] w-full">
          <Image
            src={tour.image}
            alt={tour.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="container mx-auto">
              <Badge className="mb-4 bg-white text-black">
                {tour.country}
              </Badge>
              <h1 className="text-5xl font-bold mb-4">{tour.name}</h1>
              <div className="flex flex-wrap gap-6 text-lg">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  {tour.city}, {tour.country}
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  {tour.duration}
                </div>
                <div className="flex items-center">
                  <Star className="h-5 w-5 mr-2 fill-yellow-400 text-yellow-400" />
                  {tour.rating} ({tour.reviewCount} reviews)
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>О туре</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg leading-relaxed">{tour.description}</p>
                </CardContent>
              </Card>

              {/* Tour Variants */}
              {tour.variants && tour.variants.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Варианты туров ({tour.variants.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-2">Оператор</th>
                            <th className="text-left py-3 px-2">Дата вылета</th>
                            <th className="text-left py-3 px-2">Ночей</th>
                            <th className="text-left py-3 px-2">Питание</th>
                            <th className="text-right py-3 px-2">Цена</th>
                            <th className="text-right py-3 px-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {tour.variants.map((variant, index) => (
                            <tr
                              key={variant.id || index}
                              className={`border-b hover:bg-gray-50 ${
                                selectedVariant?.id === variant.id ? "bg-blue-50" : ""
                              }`}
                            >
                              <td className="py-3 px-2 text-sm">{variant.operator}</td>
                              <td className="py-3 px-2 text-sm">
                                {variant.date ? new Date(variant.date).toLocaleDateString('ru-RU', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                }) : '—'}
                              </td>
                              <td className="py-3 px-2 text-sm">{variant.nights} ноч.</td>
                              <td className="py-3 px-2 text-sm">{variant.meal || 'AI'}</td>
                              <td className="py-3 px-2 text-right font-bold">
                                {variant.price.toLocaleString()} {variant.currency === 'KZT' ? '₸' : variant.currency}
                              </td>
                              <td className="py-3 px-2 text-right">
                                <Button
                                  size="sm"
                                  variant={selectedVariant?.id === variant.id ? "default" : "outline"}
                                  onClick={() => setSelectedVariantId(variant.id)}
                                >
                                  {selectedVariant?.id === variant.id ? "Выбрано" : "Выбрать"}
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="pt-6">
                    <p className="text-center text-gray-700">
                      ℹ️ Варианты туров с ценами доступны только на <Link href="/search" className="text-blue-600 hover:underline font-semibold">странице поиска</Link>.
                      <br />
                      <span className="text-sm text-gray-600">Пожалуйста, вернитесь к результатам поиска для выбора конкретного варианта.</span>
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Highlights */}
              <Card>
                <CardHeader>
                  <CardTitle>Основные моменты тура</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {(tour.highlights ?? []).map((highlight, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* What's Included/Excluded */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-600">
                      Что включено
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {(tour.included ?? []).map((item, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600">
                      Что не включено
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {(tour.excluded ?? []).map((item, index) => (
                        <li key={index} className="flex items-start">
                          <X className="h-4 w-4 text-red-500 mr-2 mt-1 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Hotel Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Hotel className="h-5 w-5 mr-2" />
                    Размещение
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="text-lg font-semibold mb-2">
                    {tour.hotel.name}
                  </h3>
                  <div className="flex items-center mb-4">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="font-semibold">{tour.hotel.rating}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tour.hotel.amenities.map((amenity, index) => (
                      <Badge key={index} variant="secondary">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-4xl font-bold">
                        {sidebarPrice.toLocaleString()} {sidebarCurrency === 'KZT' ? '₸' : sidebarCurrency || '₸'}
                      </span>
                      <span className="text-muted-foreground">за человека</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      * Цена может меняться в зависимости от сезона и наличия мест
                    </p>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between py-3 border-b">
                      <span className="text-muted-foreground">Продолжительность</span>
                      <span className="font-semibold">{sidebarDuration}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b">
                      <span className="text-muted-foreground">Размер группы</span>
                      <span className="font-semibold">
                        {tour.minGuests}-{tour.maxGuests} человек
                      </span>
                    </div>
                    <div className="flex justify-between py-3 border-b">
                      <span className="text-muted-foreground">Рейтинг</span>
                      <span className="font-semibold flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                        {tour.rating} ({tour.reviewCount})
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/booking?tourId=${tour.id}${
                      selectedVariant?.id ? `&variantId=${encodeURIComponent(selectedVariant.id)}` : ""
                    }`}
                  >
                    <Button size="lg" className="w-full mb-3">
                      Забронировать
                    </Button>
                  </Link>
                  
                  <p className="text-xs text-center text-muted-foreground">
                    Бесплатная отмена за 24 часа до отправления
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
  );
}
