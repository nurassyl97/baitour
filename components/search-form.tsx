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
import { getCountries, getCitiesByCountry } from "@/lib/api";

export function SearchForm() {
  const router = useRouter();
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [dates, setDates] = useState("");
  const [nights, setNights] = useState("7");
  const [travelers, setTravelers] = useState("2");
  const [countries, setCountries] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  // Load countries on mount
  useEffect(() => {
    async function loadCountries() {
      setIsLoadingCountries(true);
      try {
        const countriesList = await getCountries();
        setCountries(countriesList);
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
      setCity(""); // Reset city selection
      try {
        const citiesList = await getCitiesByCountry(country);
        setCities(citiesList);
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
    if (country) params.append("country", country);
    if (city) params.append("city", city);
    if (dates) params.append("dates", dates);
    if (nights) params.append("nights", nights);
    if (travelers) params.append("travelers", travelers);

    router.push(`/search?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow-lg p-6 space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="space-y-2">
          <Label htmlFor="country" className="text-sm font-semibold text-gray-700">
            Страна
          </Label>
          <Select value={country} onValueChange={setCountry} disabled={isLoadingCountries}>
            <SelectTrigger id="country">
              <SelectValue placeholder={isLoadingCountries ? "Загрузка..." : "Выберите страну"} />
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

        <div className="space-y-2">
          <Label htmlFor="city" className="text-sm font-semibold text-gray-700">
            Курорт
          </Label>
          <Select value={city} onValueChange={setCity} disabled={!country || isLoadingCities}>
            <SelectTrigger id="city">
              <SelectValue placeholder={isLoadingCities ? "Загрузка..." : "Выберите курорт"} />
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

        <div className="space-y-2">
          <Label htmlFor="dates" className="text-sm font-semibold text-gray-700">
            Дата вылета
          </Label>
          <Input
            id="dates"
            type="date"
            value={dates}
            onChange={(e) => setDates(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="text-gray-900"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nights" className="text-sm font-semibold text-gray-700">
            Количество ночей
          </Label>
          <Select value={nights} onValueChange={setNights}>
            <SelectTrigger id="nights">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? "ночь" : num < 5 ? "ночи" : "ночей"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="travelers" className="text-sm font-semibold text-gray-700">
            Человек
          </Label>
          <Select value={travelers} onValueChange={setTravelers}>
            <SelectTrigger id="travelers">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg">
        Поиск туров
      </Button>
    </form>
  );
}
