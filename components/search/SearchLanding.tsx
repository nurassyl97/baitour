"use client";

import { MapPin, Shield, Award, HeadphonesIcon, Plane, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const POPULAR_DESTINATIONS = [
  { name: "Турция", slug: "turkey" },
  { name: "Египет", slug: "egypt" },
  { name: "ОАЭ", slug: "uae" },
  { name: "Таиланд", slug: "thailand" },
  { name: "Вьетнам", slug: "vietnam" },
];

export function SearchLanding() {
  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="py-12 md:py-16 bg-[#F9FAFB]">
        <div className="ds-container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Найдите тур мечты
            </h1>
            <p className="text-lg text-muted-foreground">
              Выберите направление, даты и количество туристов в форме выше и нажмите «Найти».
            </p>
          </div>
        </div>
      </section>

      {/* Advantages / USP */}
      <section className="py-12 md:py-16 bg-white">
        <div className="ds-container">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            Почему выбирают нас
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#22a7f0]/10 text-[#22a7f0] mb-4">
                <MapPin className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Направления по всему миру</h3>
              <p className="text-sm text-muted-foreground">
                Туры в десятки стран на любой вкус
              </p>
            </div>
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#22a7f0]/10 text-[#22a7f0] mb-4">
                <Shield className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Лучшие цены</h3>
              <p className="text-sm text-muted-foreground">
                Сравниваем предложения туроператоров
              </p>
            </div>
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#22a7f0]/10 text-[#22a7f0] mb-4">
                <Award className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Проверенные отели</h3>
              <p className="text-sm text-muted-foreground">
                Рейтинги и отзывы для выбора
              </p>
            </div>
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#22a7f0]/10 text-[#22a7f0] mb-4">
                <HeadphonesIcon className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Поддержка</h3>
              <p className="text-sm text-muted-foreground">
                Поможем с выбором и бронированием
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular destinations */}
      <section className="py-12 md:py-16 bg-[#F9FAFB]">
        <div className="ds-container">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Популярные направления
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {POPULAR_DESTINATIONS.map((d) => (
              <Link
                key={d.slug}
                href={`/search?country=${encodeURIComponent(d.name)}&submit=${Date.now()}`}
                className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:border-[#22a7f0] hover:bg-[#22a7f0]/5 hover:text-[#22a7f0] transition-colors"
              >
                <Plane className="h-4 w-4" />
                {d.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 md:py-16 bg-white">
        <div className="ds-container">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            Как это работает
          </h2>
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#22a7f0] text-white font-semibold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Укажите параметры</h3>
                <p className="text-sm text-muted-foreground">
                  Страна, даты поездки и количество туристов в форме выше.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#22a7f0] text-white font-semibold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Нажмите «Найти»</h3>
                <p className="text-sm text-muted-foreground">
                  Мы подберём туры у подключённых туроператоров.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#22a7f0] text-white font-semibold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Выберите и забронируйте</h3>
                <p className="text-sm text-muted-foreground">
                  Сравните цены, выберите тур и оформите заявку.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust / partners */}
      <section className="py-12 md:py-16 bg-[#F9FAFB] border-t border-gray-100">
        <div className="ds-container">
          <div className="flex flex-wrap items-center justify-center gap-6 text-muted-foreground text-sm">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#22a7f0]" />
              Интеграция с Tourvisor
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#22a7f0]" />
              Актуальные цены и наличие
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#22a7f0]" />
              Без скрытых комиссий
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
