"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star } from "lucide-react";

export function SearchForm() {
  const router = useRouter();
  const [searchType, setSearchType] = useState("tours");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [nightsFrom, setNightsFrom] = useState("6");
  const [nightsTo, setNightsTo] = useState("14");
  const [travelers, setTravelers] = useState("2");
  const [countries, setCountries] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [hotelStars, setHotelStars] = useState<number>(0);

  // Load countries on mount
  useEffect(() => {
    async function loadCountries() {
      setIsLoadingCountries(true);
      try {
        const response = await fetch('/api/countries');
        if (!response.ok) throw new Error('Failed to load countries');
        const data = await response.json();
        setCountries(data.countries || []);
      } catch (error) {
        console.error('Failed to load countries:', error);
      } finally {
        setIsLoadingCountries(false);
      }
    }
    loadCountries();
  }, []);

  // Load cities when country changes
  useEffect(() => {
    async function loadCities() {
      if (!country) {
        setCities([]);
        return;
      }

      setIsLoadingCities(true);
      setCity("");
      try {
        const response = await fetch(`/api/cities?country=${encodeURIComponent(country)}`);
        if (!response.ok) throw new Error('Failed to load cities');
        const data = await response.json();
        setCities(data.cities || []);
      } catch (error) {
        console.error('Failed to load cities:', error);
        setCities([]);
      } finally {
        setIsLoadingCities(false);
      }
    }
    loadCities();
  }, [country]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    params.append("searchType", searchType);
    if (country) params.append("country", country);
    if (city) params.append("city", city);
    if (dateFrom) params.append("dateFrom", dateFrom);
    if (dateTo) params.append("dateTo", dateTo);
    params.append("nightsFrom", nightsFrom);
    params.append("nightsTo", nightsTo);
    params.append("adults", travelers);
    params.append("children", "0");
    if (hotelStars > 0) params.append("hotelStars", hotelStars.toString());

    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Search Type Radio Buttons */}
      <div className="flex gap-6 text-white">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="searchType"
            value="tours"
            checked={searchType === "tours"}
            onChange={(e) => setSearchType(e.target.value)}
            className="w-5 h-5 accent-white"
          />
          <span className="text-lg font-medium">Туры с перелетом</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="searchType"
            value="hotels"
            checked={searchType === "hotels"}
            onChange={(e) => setSearchType(e.target.value)}
            className="w-5 h-5 accent-white"
          />
          <span className="text-lg font-medium">Отели</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="searchType"
            value="hot"
            checked={searchType === "hot"}
            onChange={(e) => setSearchType(e.target.value)}
            className="w-5 h-5 accent-white"
          />
          <span className="text-lg font-medium">Горящие</span>
        </label>
      </div>

      {/* Main Search Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Primary Search Fields */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          {/* Departure City - Will show Astana by default */}
          <div className="space-y-1">
            <Label htmlFor="departure" className="text-xs text-gray-200">
              Город вылета
            </Label>
            <Input
              id="departure"
              value="Астана"
              disabled
              className="bg-white text-gray-900 font-semibold h-12"
            />
          </div>

          {/* Country */}
          <div className="space-y-1">
            <Label htmlFor="country" className="text-xs text-gray-200">
              Страна
            </Label>
            <Select value={country} onValueChange={setCountry} disabled={isLoadingCountries}>
              <SelectTrigger id="country" className="bg-white h-12 font-semibold">
                <SelectValue placeholder={isLoadingCountries ? "Загрузка..." : "Выберите"} />
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range - Two separate fields like Tourvisor */}
          <div className="space-y-1 md:col-span-2">
            <Label className="text-xs text-gray-200">
              Даты вылета
            </Label>
            <div className="flex gap-2">
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                placeholder="От"
                className="bg-white text-gray-900 h-12 flex-1"
              />
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                min={dateFrom || new Date().toISOString().split("T")[0]}
                placeholder="До"
                className="bg-white text-gray-900 h-12 flex-1"
              />
            </div>
          </div>

          {/* Nights Range */}
          <div className="space-y-1">
            <Label htmlFor="nights" className="text-xs text-gray-200">
              Ночей
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={nightsFrom}
                onChange={(e) => setNightsFrom(e.target.value)}
                min="1"
                max="30"
                className="bg-white text-gray-900 h-12 w-20 font-semibold"
              />
              <span className="text-white">-</span>
              <Input
                type="number"
                value={nightsTo}
                onChange={(e) => setNightsTo(e.target.value)}
                min="1"
                max="30"
                className="bg-white text-gray-900 h-12 w-20 font-semibold"
              />
            </div>
          </div>

          {/* Tourists */}
          <div className="space-y-1">
            <Label htmlFor="travelers" className="text-xs text-gray-200">
              Туристы
            </Label>
            <Select value={travelers} onValueChange={setTravelers}>
              <SelectTrigger id="travelers" className="bg-white h-12 font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? "взрослый" : num < 5 ? "взрослых" : "взрослых"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <Button
              type="submit"
              size="lg"
              className="w-full h-12 bg-[#FF6B47] hover:bg-[#FF5533] text-white font-bold text-lg"
            >
              🔍 Найти туры
            </Button>
          </div>
        </div>

        {/* Additional Filters Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* Hotel Class */}
          <div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-white/30 transition-colors">
              <span className="text-white text-sm font-medium">Класс отеля</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= hotelStars
                        ? "fill-[#FF6B47] text-[#FF6B47]"
                        : "text-white/50"
                    } cursor-pointer`}
                    onClick={(e) => {
                      e.preventDefault();
                      setHotelStars(star === hotelStars ? 0 : star);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Resort/Hotel */}
          <div>
            <Select value={city} onValueChange={setCity} disabled={!country || isLoadingCities}>
              <SelectTrigger className="bg-white/20 backdrop-blur-sm text-white border-none h-10 hover:bg-white/30 transition-colors">
                <SelectValue placeholder={isLoadingCities ? "Загрузка..." : "Курорт / отель"} />
              </SelectTrigger>
              <SelectContent>
                {cities.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Meal Type */}
          <div>
            <Select>
              <SelectTrigger className="bg-white/20 backdrop-blur-sm text-white border-none h-10 hover:bg-white/30 transition-colors">
                <SelectValue placeholder="Питание" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Любое</SelectItem>
                <SelectItem value="bb">BB (завтрак)</SelectItem>
                <SelectItem value="hb">HB (полупансион)</SelectItem>
                <SelectItem value="fb">FB (полный пансион)</SelectItem>
                <SelectItem value="ai">AI (все включено)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rating */}
          <div>
            <Select>
              <SelectTrigger className="bg-white/20 backdrop-blur-sm text-white border-none h-10 hover:bg-white/30 transition-colors">
                <SelectValue placeholder="Рейтинг" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Любой</SelectItem>
                <SelectItem value="9">9+ Превосходно</SelectItem>
                <SelectItem value="8">8+ Очень хорошо</SelectItem>
                <SelectItem value="7">7+ Хорошо</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Advanced Filters */}
          <div>
            <Select>
              <SelectTrigger className="bg-white/20 backdrop-blur-sm text-white border-none h-10 hover:bg-white/30 transition-colors">
                <SelectValue placeholder="Расширенные фильтры..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beach">У пляжа</SelectItem>
                <SelectItem value="pool">Бассейн</SelectItem>
                <SelectItem value="spa">СПА</SelectItem>
                <SelectItem value="kids">Для детей</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </form>
    </div>
  );
}
