import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-4xl font-semibold mb-4">Страница не найдена</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-md mx-auto">
          К сожалению, мы не смогли найти страницу, которую вы ищете. Тур, который вы ищете, возможно был перемещен или не существует.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button size="lg">
              <Home className="h-4 w-4 mr-2" />
              Вернуться на главную
            </Button>
          </Link>
          <Link href="/search">
            <Button size="lg" variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Посмотреть туры
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
