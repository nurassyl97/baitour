"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState, useSyncExternalStore, Suspense } from "react";
import { useRouter } from "next/navigation";
import { getTourById, type Tour } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import { MapPin, Clock, Users, Loader2 } from "lucide-react";

function BookingFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tourId = searchParams.get("tourId");
  const variantId = searchParams.get("variantId");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    travelDate: "",
    adults: "2",
    children: "0",
    specialRequests: "",
    agreeToTerms: false,
  });

  const cachedToursRaw = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("storage", onStoreChange);
      return () => window.removeEventListener("storage", onStoreChange);
    },
    () => localStorage.getItem("tourSearchResults"),
    () => null
  );

  const tour: Tour | null = useMemo(() => {
    if (!tourId) return null;

    if (cachedToursRaw) {
      try {
        const parsed: unknown = JSON.parse(cachedToursRaw);
        if (Array.isArray(parsed)) {
          const found = (parsed as Tour[]).find((t) => t.id === tourId);
          if (found) return found;
        }
      } catch {
        // ignore
      }
    }

    return getTourById(tourId) ?? null;
  }, [tourId, cachedToursRaw]);

  const selectedVariant = useMemo(() => {
    if (!variantId || !tour?.variants?.length) return null;
    return tour.variants.find((v) => v.id === variantId) ?? null;
  }, [tour, variantId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const totalPriceToSend = selectedVariant?.price ?? tour?.price ?? 0;
    const currency = selectedVariant?.currency ?? tour?.currency ?? "KZT";

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          travelDate: formData.travelDate,
          adults: formData.adults,
          children: formData.children,
          specialRequests: formData.specialRequests || undefined,
          tourId: tourId ?? undefined,
          tourName: tour?.name ?? undefined,
          variantId: selectedVariant?.id ?? variantId ?? undefined,
          price: totalPriceToSend ? Math.round(totalPriceToSend) : undefined,
          currency: currency ?? undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));
      const referenceNumber = data.referenceNumber ?? `TR${Date.now()}`;

      if (!res.ok) {
        const message = typeof data.error === "string" ? data.error : "Не удалось отправить заявку. Попробуйте позже или свяжитесь с нами по телефону.";
        alert(message);
        setIsSubmitting(false);
        return;
      }

      localStorage.setItem(
        "bookingData",
        JSON.stringify({
          ...formData,
          tourName: tour?.name,
          tourId,
          variantId: selectedVariant?.id ?? variantId ?? null,
          variant: selectedVariant ?? null,
          referenceNumber,
          submittedAt: new Date().toISOString(),
        })
      );

      router.push(`/confirmation?ref=${referenceNumber}`);
    } catch {
      alert("Не удалось отправить заявку. Попробуйте позже или свяжитесь с нами по телефону.");
      setIsSubmitting(false);
    }
  };

  if (!tour) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] py-8">
        <div className="container mx-auto px-4">
          <Card>
            <CardContent className="p-12 text-center">
              <h2 className="text-2xl font-semibold mb-4">Тур не найден</h2>
              <p className="text-muted-foreground mb-6">
                Пожалуйста, выберите тур из нашего каталога.
              </p>
              <Button onClick={() => router.push("/")}>
                Посмотреть туры
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Цена выбранного варианта — уже итоговая за тур (за тех гостей, с которыми искали). Не умножаем на кол-во.
  const selectedTotalPrice = selectedVariant?.price ?? tour.price;
  const currency = selectedVariant?.currency ?? tour.currency ?? "KZT";
  const currencySymbol = currency === "KZT" ? "₸" : currency;

  const formatMoney = (amount: number) =>
    `${Math.round(amount).toLocaleString("ru-RU")} ${currencySymbol}`;

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Завершите бронирование</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Ваша информация</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">
                        Полное имя <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="fullName"
                        required
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        placeholder="Иван Иванов"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Электронная почта <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="ivan@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        Номер телефона <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="+7 (777) 123-4567"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="travelDate">
                        Дата поездки <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="travelDate"
                        type="date"
                        required
                        value={formData.travelDate}
                        onChange={(e) =>
                          setFormData({ ...formData, travelDate: e.target.value })
                        }
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="adults">
                        Количество взрослых <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="adults"
                        type="number"
                        min={tour.minGuests}
                        max={tour.maxGuests}
                        required
                        value={formData.adults}
                        onChange={(e) =>
                          setFormData({ ...formData, adults: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="children">Количество детей</Label>
                      <Input
                        id="children"
                        type="number"
                        min="0"
                        max="10"
                        value={formData.children}
                        onChange={(e) =>
                          setFormData({ ...formData, children: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialRequests">
                      Особые пожелания (необязательно)
                    </Label>
                    <textarea
                      id="specialRequests"
                      className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                      value={formData.specialRequests}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          specialRequests: e.target.value,
                        })
                      }
                      placeholder="Диетические ограничения, потребности в доступности или особые пожелания..."
                    />
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      required
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          agreeToTerms: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed">
                      Я согласен с условиями и понимаю, что это запрос на бронирование. Агентство свяжется со мной для подтверждения наличия мест и деталей оплаты.{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Отправка...
                      </>
                    ) : (
                      "Отправить запрос на бронирование"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Сводка бронирования</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative h-40 w-full rounded-lg overflow-hidden">
                  <Image
                    src={tour.image}
                    alt={tour.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">{tour.name}</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {tour.city}, {tour.country}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {tour.duration}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      {formData.adults} взрослых
                      {parseInt(formData.children) > 0 &&
                        `, ${formData.children} детей`}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Стоимость тура (выбранный вариант)</span>
                    <span>{formatMoney(selectedTotalPrice)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Итого</span>
                    <span>{formatMoney(selectedTotalPrice)}</span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  <p>* Окончательная цена будет подтверждена нашей командой</p>
                  <p>* Бесплатная отмена за 24 часа до отправления</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F9FAFB] py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    }>
      <BookingFormContent />
    </Suspense>
  );
}
