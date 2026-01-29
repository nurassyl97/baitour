import { SearchForm } from "@/components/search-form";
import { TourCard } from "@/components/tour-card";
import { getPopularTours } from "@/lib/data";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MapPin, Shield, Award, HeadphonesIcon } from "lucide-react";

export default function HomePage() {
  const popularTours = getPopularTours(6);

  return (
    <div>
      {/* Hero Section */}
      <section
        className="relative h-[600px] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(0, 191, 255, 0.95), rgba(28, 181, 224, 0.90)), url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80')",
        }}
      >
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg">
            Откройте для себя новое <span className="text-[#FFC800]">приключение</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto drop-shadow">
            Исследуйте удивительные туры и впечатления по всему миру с опытными гидами и незабываемыми воспоминаниями
          </p>
          <div className="max-w-4xl mx-auto">
            <SearchForm />
          </div>
        </div>
      </section>

      {/* Popular Tours */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Популярные туры</h2>
            <p className="text-lg text-muted-foreground">
              Отобранные туры, которые полюбили тысячи путешественников
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/search">
              <Button size="lg" className="bg-[#FFC800] hover:bg-[#FFD700] text-gray-900 font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
                Посмотреть все туры
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Почему выбирают нас</h2>
            <p className="text-lg text-muted-foreground">
              Мы воплощаем ваши мечты о путешествиях в реальность
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group hover:scale-105 transition-transform">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 text-white mb-4 shadow-lg group-hover:shadow-xl">
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Направления по всему миру
              </h3>
              <p className="text-muted-foreground">
                Туры в более чем 50 странах на всех континентах
              </p>
            </div>

            <div className="text-center group hover:scale-105 transition-transform">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#FFC800] to-[#FFD700] text-gray-900 mb-4 shadow-lg group-hover:shadow-xl">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Опытные гиды</h3>
              <p className="text-muted-foreground">
                Профессиональные местные гиды с многолетним опытом
              </p>
            </div>

            <div className="text-center group hover:scale-105 transition-transform">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 text-white mb-4 shadow-lg group-hover:shadow-xl">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Гарантия лучшей цены</h3>
              <p className="text-muted-foreground">
                Конкурентные цены и гибкие варианты оплаты
              </p>
            </div>

            <div className="text-center group hover:scale-105 transition-transform">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#FFC800] to-[#FFD700] text-gray-900 mb-4 shadow-lg group-hover:shadow-xl">
                <HeadphonesIcon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Поддержка 24/7</h3>
              <p className="text-muted-foreground">
                Всегда готовы помочь до, во время и после вашей поездки
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About & Contact */}
      <section id="about" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">О компании BaiTour</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Мы - команда увлеченных энтузиастов путешествий, посвятившая себя созданию незабываемых впечатлений для наших клиентов. Имея более 10 лет опыта в индустрии туризма, мы тщательно подбираем каждый тур, чтобы обеспечить высочайшее качество и ценность.
            </p>
            <div id="contact" className="mt-12 p-8 bg-white rounded-lg shadow">
              <h3 className="text-2xl font-semibold mb-4">Свяжитесь с нами</h3>
              <p className="text-muted-foreground mb-4">
                Есть вопросы? Мы будем рады услышать вас.
              </p>
              <div className="space-y-2">
                <p>
                  <strong>Email:</strong> info@baitour.com
                </p>
                <p>
                  <strong>Телефон:</strong> +7 (700) 123-4567
                </p>
                <p>
                  <strong>Часы работы:</strong> Пн-Пт 9:00-18:00
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
