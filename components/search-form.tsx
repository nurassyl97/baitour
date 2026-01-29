"use client";

import { useState } from "react";
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
import { getCountries, getCitiesByCountry } from "@/lib/data";

export function SearchForm() {
  const router = useRouter();
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [dates, setDates] = useState("");
  const [travelers, setTravelers] = useState("2");

  const countries = getCountries();
  const cities = country ? getCitiesByCountry(country) : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (country) params.append("country", country);
    if (city) params.append("city", city);
    if (dates) params.append("dates", dates);
    if (travelers) params.append("travelers", travelers);

    router.push(`/search?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow-lg p-6 space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="country" className="text-sm font-semibold text-gray-700">
            Страна
          </Label>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger id="country">
              <SelectValue placeholder="Выберите страну" />
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
            Город
          </Label>
          <Select value={city} onValueChange={setCity} disabled={!country}>
            <SelectTrigger id="city">
              <SelectValue placeholder="Выберите город" />
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
            Дата поездки
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
          <Label htmlFor="travelers" className="text-sm font-semibold text-gray-700">
            Количество человек
          </Label>
          <Input
            id="travelers"
            type="number"
            min="1"
            max="20"
            value={travelers}
            onChange={(e) => setTravelers(e.target.value)}
            className="text-gray-900"
            placeholder="2"
          />
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg">
        Поиск туров
      </Button>
    </form>
  );
}
