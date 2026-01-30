import { SearchForm } from "@/components/search-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MapPin, Shield, Award, HeadphonesIcon } from "lucide-react";

export default function HomePage() {

  return (
    <div>
      {/* Hero Section */}
      <section
        className="relative bg-gradient-to-br from-[#0B7BC1] to-[#1CB5E0] py-16"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-white mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-3">
                Поможем найти тур дешевле
              </h1>
              <p className="text-lg md:text-xl opacity-90">
                Агрегатор туров для туристов и турагентов
              </p>
            </div>

            {/* Search Form */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
              <SearchForm />
            </div>

            {/* Stats Footer */}
            <div className="text-white/80 text-sm flex flex-wrap items-center gap-x-8 gap-y-2">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                57 020 пользователей сервиса
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                </svg>
                2117 офисов для покупки туров
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                  <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                </svg>
                294 заявки на тур
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                112 подключенных туроператоров
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Search Call-to-Action - replacing popular tours */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
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
