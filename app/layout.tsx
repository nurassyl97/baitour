import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BaiTour - Откройте для себя удивительные туры по всему миру",
  description:
    "Найдите и забронируйте лучшие туры по всему миру. От культурных мероприятий до приключенческих поездок - у нас есть идеальный тур для вас.",
  keywords: ["туры", "путешествия", "отпуск", "отдых", "бронирование"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="border-b bg-white">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary">
              BaiTour
            </Link>
            <div className="flex gap-6">
              <Link href="/" className="hover:text-primary">
                Главная
              </Link>
              <Link href="/search" className="hover:text-primary">
                Туры
              </Link>
              <Link href="/#about" className="hover:text-primary">
                О нас
              </Link>
              <Link href="/#contact" className="hover:text-primary">
                Контакты
              </Link>
            </div>
          </div>
        </nav>

        <main className="min-h-screen">{children}</main>

        <footer className="bg-gray-900 text-white py-12 mt-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">BaiTour</h3>
              <p className="text-gray-400">
                Ваш надежный партнер для незабываемых путешествий по всему миру.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Быстрые ссылки</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/" className="hover:text-white">
                    Главная
                  </Link>
                </li>
                <li>
                  <Link href="/search" className="hover:text-white">
                    Туры
                  </Link>
                </li>
                <li>
                  <Link href="/#about" className="hover:text-white">
                    О нас
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Контакты</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Email: info@baitour.com</li>
                <li>Телефон: +7 (700) 123-4567</li>
                <li>Адрес: г. Алматы, Казахстан</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Правовая информация</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/terms" className="hover:text-white">
                    Условия использования
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Политика конфиденциальности
                  </Link>
                </li>
              </ul>
            </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2026 BaiTour. Все права защищены.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
