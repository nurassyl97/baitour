import { SearchForm } from "@/components/search-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MapPin, Shield, Award, HeadphonesIcon } from "lucide-react";

export default function HomePage() {

  return (
    <div className="bg-[#F9FAFB]">
      {/* Блок поиска — компактная форма на белом фоне (как на второй картинке) */}
      <section className="relative z-10 bg-white py-10 md:py-12 border-b border-gray-100">
        <div className="ds-container">
          <div className="max-w-[1238px] mx-auto relative z-10">
            <SearchForm variant="compact" />
          </div>
        </div>
      </section>

      {/* Search Call-to-Action - replacing popular tours */}
      <section className="py-16 bg-[#F9FAFB]">
        <div className="ds-container">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-4">Найдите свой идеальный тур</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Воспользуйтесь формой поиска выше, чтобы найти туры по вашим предпочтениям. 
              Мы предлагаем широкий выбор направлений и отелей на любой вкус и бюджет.
            </p>
            <Link href="/search">
              <Button size="lg" className="bg-[#FFC800] hover:bg-[#FFD700] text-gray-900 font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
                Начать поиск туров
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-[#F9FAFB]">
        <div className="ds-container">
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
      <section id="about" className="py-16 bg-[#F9FAFB]">
        <div className="ds-container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">О компании BaiTour</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Мы - команда увлеченных энтузиастов путешествий, посвятившая себя созданию незабываемых впечатлений для наших клиентов. Имея более 10 лет опыта в индустрии туризма, мы тщательно подбираем каждый тур, чтобы обеспечить высочайшее качество и ценность.
            </p>
            <div id="contact" className="mt-12 p-8 bg-[#FFFFFF] rounded-lg shadow">
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
