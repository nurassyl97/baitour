"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, Download, Home } from "lucide-react";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const referenceNumber = searchParams.get("ref");
  const [bookingData, setBookingData] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem("bookingData");
    if (data) {
      setBookingData(JSON.parse(data));
    }
  }, []);

  if (!referenceNumber || !bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <h2 className="text-2xl font-semibold mb-4">
                Бронирование не найдено
              </h2>
              <p className="text-muted-foreground mb-6">
                Мы не смогли найти информацию о вашем бронировании.
              </p>
              <Link href="/">
                <Button>Вернуться на главную</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Card className="max-w-3xl mx-auto">
          <CardContent className="p-8 md:p-12">
            <div className="text-center mb-8">
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
              <h1 className="text-4xl font-bold mb-2">Бронирование получено!</h1>
              <p className="text-xl text-muted-foreground">
                Спасибо за ваш запрос на бронирование
              </p>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
              <div className="text-center">
                <p className="text-sm text-blue-600 mb-2">
                  Ваш номер бронирования
                </p>
                <p className="text-3xl font-bold text-blue-900">
                  {referenceNumber}
                </p>
                <p className="text-sm text-blue-600 mt-2">
                  Пожалуйста, сохраните этот номер для своих записей
                </p>
              </div>
            </div>

            <div className="space-y-6 mb-8">
              <div>
                <h3 className="font-semibold text-lg mb-4">Что дальше?</h3>
                <ol className="space-y-3">
                  <li className="flex">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-semibold mr-3 flex-shrink-0">
                      1
                    </span>
                    <div>
                      <p className="font-semibold">Подтверждение по электронной почте</p>
                      <p className="text-sm text-muted-foreground">
                        Вы получите письмо с подтверждением на{" "}
                        <strong>{bookingData.email}</strong> в течение 24 часов
                      </p>
                    </div>
                  </li>
                  <li className="flex">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-semibold mr-3 flex-shrink-0">
                      2
                    </span>
                    <div>
                      <p className="font-semibold">Проверка наличия мест</p>
                      <p className="text-sm text-muted-foreground">
                        Наша команда проверит наличие мест на выбранные даты
                      </p>
                    </div>
                  </li>
                  <li className="flex">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-semibold mr-3 flex-shrink-0">
                      3
                    </span>
                    <div>
                      <p className="font-semibold">Инструкции по оплате</p>
                      <p className="text-sm text-muted-foreground">
                        Мы отправим вам инструкции по безопасной оплате и окончательные детали
                      </p>
                    </div>
                  </li>
                </ol>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold text-lg mb-3">Детали бронирования</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Тур</p>
                    <p className="font-semibold">{bookingData.tourName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Дата поездки</p>
                    <p className="font-semibold">
                      {new Date(bookingData.travelDate).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Путешественники</p>
                    <p className="font-semibold">
                      {bookingData.adults} взрослых
                      {parseInt(bookingData.children) > 0 &&
                        `, ${bookingData.children} детей`}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Контакт</p>
                    <p className="font-semibold">{bookingData.fullName}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  Вернуться на главную
                </Button>
              </Link>
              <Button
                className="flex-1"
                onClick={() => window.print()}
              >
                <Download className="h-4 w-4 mr-2" />
                Распечатать подтверждение
              </Button>
            </div>

            <div className="mt-8 p-4 bg-gray-100 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                Вопросы? Свяжитесь с нами по адресу{" "}
                <a
                  href="mailto:info@baitour.com"
                  className="text-primary hover:underline"
                >
                  info@baitour.com
                </a>{" "}
                или позвоните{" "}
                <a
                  href="tel:+77001234567"
                  className="text-primary hover:underline"
                >
                  +7 (700) 123-4567
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded w-1/3 mx-auto"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
