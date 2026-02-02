"use client";

import { useState, useEffect, useCallback } from "react";
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
  const [departures, setDepartures] = useState<{ id: number; name: string }[]>(
    []
  );
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingDepartures, setIsLoadingDepartures] = useState(false);
  const [hotelStars, setHotelStars] = useState<number>(0);
  const [mealType, setMealType] = useState<string>("any");
  const [hotelRating, setHotelRating] = useState<string>("any");
  const [children, setChildren] = useState<string>("0");
  const [countriesError, setCountriesError] = useState<string | null>(null);
  const [departureId, setDepartureId] = useState<string>("");

  const loadCountries = useCallback(async () => {
    setIsLoadingCountries(true);
    setCountriesError(null);

    try {
      // Wait for API response - no timeout, no fallback
      const response = await fetch("/api/countries");

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to load countries`);
      }

      const data = await response.json();

      if (data.countries && data.countries.length > 0) {
        setCountries(data.countries);
      } else {
        setCountries([]);
        setCountriesError("Список стран пуст. Попробуйте позже.");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Failed to load countries from API:", message);
      setCountries([]);
      setCountriesError("Не удалось загрузить страны. Попробуйте снова.");
    } finally {
      setIsLoadingCountries(false);
    }
  }, []);

  // Set default dates (tomorrow + 7 days) for better chances with trial API
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekLater = new Date();
    weekLater.setDate(weekLater.getDate() + 8);
    
    setDateFrom(tomorrow.toISOString().split('T')[0]);
    setDateTo(weekLater.toISOString().split('T')[0]);
  }, []);

  // Load countries on mount - wait for API response (no timeout, no fallback)
  useEffect(() => {
    loadCountries();
  }, [loadCountries]);

  // Load departure cities on mount (Kazakhstan by default)
  useEffect(() => {
    async function loadDepartures() {
      setIsLoadingDepartures(true);
      try {
        const response = await fetch(
          "/api/departures?departureCountryId=3"
        );
        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}: Failed to load departure cities`
          );
        }
        const data = await response.json();
        if (data.departures && data.departures.length > 0) {
          setDepartures(data.departures);
          // Set default departure to Almaty (27) if exists
          const defaultDep = data.departures.find(
            (d: { id: number }) => d.id === 27
          );
          if (defaultDep) {
            setDepartureId(String(defaultDep.id));
          }
        } else {
          setDepartures([]);
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(
          "Failed to load departure cities from API:",
          message
        );
        setDepartures([]);
      } finally {
        setIsLoadingDepartures(false);
      }
    }
    loadDepartures();
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
        // Wait for API response - no timeout
        const response = await fetch(`/api/cities?country=${encodeURIComponent(country)}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to load cities`);
        }
        
        const data = await response.json();
        setCities(data.cities || []);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('Failed to load cities:', message);
        setCities([]);
      } finally {
        setIsLoadingCities(false);
      }
    }
    loadCities();
  }, [country]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure dateTo is set - default to dateFrom + 7 days if not provided
    let finalDateTo = dateTo;
    if (!finalDateTo && dateFrom) {
      const dateFromObj = new Date(dateFrom);
      dateFromObj.setDate(dateFromObj.getDate() + 7);
      finalDateTo = dateFromObj.toISOString().split('T')[0];
    } else if (!finalDateTo) {
      // If no dateFrom either, set both to default range
      const today = new Date();
      const sevenDaysLater = new Date();
      sevenDaysLater.setDate(today.getDate() + 7);
      const fourteenDaysLater = new Date();
      fourteenDaysLater.setDate(today.getDate() + 14);
      
      // Set dateFrom if not set
      if (!dateFrom) {
        setDateFrom(sevenDaysLater.toISOString().split('T')[0]);
      }
      finalDateTo = fourteenDaysLater.toISOString().split('T')[0];
    }
    
    const params = new URLSearchParams();
    params.append("searchType", searchType);
    if (departureId) params.append("departureId", departureId);
    if (country) params.append("country", country);
    if (city) params.append("city", city);
    if (dateFrom) params.append("dateFrom", dateFrom);
    if (finalDateTo) params.append("dateTo", finalDateTo);
    params.append("nightsFrom", nightsFrom);
    params.append("nightsTo", nightsTo);
    params.append("adults", travelers);
    params.append("children", children);
    if (hotelStars > 0) params.append("hotelStars", hotelStars.toString());
    if (mealType !== "any") params.append("meal", mealType);
    if (hotelRating !== "any") params.append("hotelRating", hotelRating);

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
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {/* Departure City */}
          <div className="space-y-1">
            <Label htmlFor="departure" className="text-xs text-gray-200">
              Город вылета
            </Label>
            <Select
              value={departureId}
              onValueChange={setDepartureId}
              disabled={isLoadingDepartures || departures.length === 0}
            >
              <SelectTrigger id="departure" className="bg-white h-12 font-semibold">
                <SelectValue
                  placeholder={
                    isLoadingDepartures ? "Загрузка..." : "Выберите город"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {departures.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Country */}
          <div className="space-y-1">
            <Label htmlFor="country" className="text-xs text-gray-200">
              Страна
            </Label>
            <Select
              value={country}
              onValueChange={setCountry}
              disabled={isLoadingCountries || Boolean(countriesError)}
            >
              <SelectTrigger id="country" className="bg-white h-12 font-semibold">
                <SelectValue
                  placeholder={
                    isLoadingCountries
                      ? "Загрузка..."
                      : countriesError
                      ? "Ошибка загрузки"
                      : "Выберите"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {countriesError && (
              <div className="flex items-center justify-between text-xs text-red-200">
                <span>{countriesError}</span>
                <button
                  type="button"
                  onClick={loadCountries}
                  className="underline hover:text-white"
                >
                  Повторить
                </button>
              </div>
            )}
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
                onChange={(e) => {
                  const selectedDate = e.target.value;
                  setDateFrom(selectedDate);
                  // If dateTo is before the new dateFrom, update dateTo
                  if (dateTo && dateTo < selectedDate) {
                    const dateFromObj = new Date(selectedDate);
                    dateFromObj.setDate(dateFromObj.getDate() + 7);
                    setDateTo(dateFromObj.toISOString().split('T')[0]);
                  } else if (!dateTo && selectedDate) {
                    // Auto-set dateTo to dateFrom + 7 days if not set
                    const dateFromObj = new Date(selectedDate);
                    dateFromObj.setDate(dateFromObj.getDate() + 7);
                    setDateTo(dateFromObj.toISOString().split('T')[0]);
                  }
                }}
                min={new Date().toISOString().split("T")[0]}
                placeholder="От"
                className="bg-white text-gray-900 h-12 flex-1"
                required
              />
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => {
                  const selectedDate = e.target.value;
                  // Ensure dateTo is after dateFrom
                  if (dateFrom && selectedDate < dateFrom) {
                    // If dateTo is before dateFrom, set it to dateFrom + 1 day
                    const dateFromObj = new Date(dateFrom);
                    dateFromObj.setDate(dateFromObj.getDate() + 1);
                    setDateTo(dateFromObj.toISOString().split('T')[0]);
                  } else {
                    setDateTo(selectedDate);
                  }
                }}
                min={dateFrom || new Date().toISOString().split("T")[0]}
                placeholder="До"
                className="bg-white text-gray-900 h-12 flex-1"
                required
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
              Взрослые
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

          {/* Children */}
          <div className="space-y-1">
            <Label htmlFor="children" className="text-xs text-gray-200">
              Дети
            </Label>
            <Select value={children} onValueChange={setChildren}>
              <SelectTrigger id="children" className="bg-white h-12 font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[0, 1, 2, 3, 4].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num === 0 ? "Нет" : `${num} ${num === 1 ? "ребенок" : num < 5 ? "ребенка" : "детей"}`}
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
            <Select value={mealType} onValueChange={setMealType}>
              <SelectTrigger className="bg-white/20 backdrop-blur-sm text-white border-none h-10 hover:bg-white/30 transition-colors">
                <SelectValue placeholder="Питание" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Любое</SelectItem>
                <SelectItem value="1">BB (завтрак)</SelectItem>
                <SelectItem value="2">HB (полупансион)</SelectItem>
                <SelectItem value="3">FB (полный пансион)</SelectItem>
                <SelectItem value="4">AI (все включено)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Hotel Rating */}
          <div>
            <Select value={hotelRating} onValueChange={setHotelRating}>
              <SelectTrigger className="bg-white/20 backdrop-blur-sm text-white border-none h-10 hover:bg-white/30 transition-colors">
                <SelectValue placeholder="Рейтинг отеля" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Любой</SelectItem>
                <SelectItem value="5">4.5+ Превосходно</SelectItem>
                <SelectItem value="4">4.0+ Очень хорошо</SelectItem>
                <SelectItem value="3">3.5+ Хорошо</SelectItem>
                <SelectItem value="2">3.0+ Удовлетворительно</SelectItem>
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
