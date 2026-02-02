// TypeScript types for Tourvisor API
// Documentation: https://api.tourvisor.ru/search/docs

// ============= Reference Books (Справочники) =============

export interface Departure {
  id: number;
  name: string;
  nameGenitive: string;
}

export interface Country {
  id: number;
  name: string;
}

export interface Region {
  id: number;
  name: string;
  countryId: number;
}

export interface SubRegion {
  id: number;
  name: string;
  regionId: number;
}

export interface Arrival {
  id: number;
  name: string;
}

export interface Meal {
  id: number;
  name: string;
  russianName: string;
  fullName: string;
  fullRussianName: string;
}

export interface Operator {
  id: number;
  name: string;
  russianName: string;
  fullName: string;
}

export interface HotelType {
  id: number;
  name: string;
}

export interface HotelGroupService {
  id: number;
  name: string;
  services: {
    id: number;
    name: string;
  }[];
}

export interface Currency {
  code: string;
  name: string;
}

export interface CurrencyRate {
  currency: string;
  rate: number;
}

// ============= Search Request =============

export interface TourvisorSearchRequest {
  departureId: number; // Required - город вылета
  countryIds: number[]; // Required - массив ID стран
  nights: {
    from: number;
    to: number;
  }; // Required - диапазон ночей
  adults: number; // Required - количество взрослых
  children?: number; // Количество детей
  childrenAges?: number[]; // Возраста детей
  currency: string; // Required - валюта (USD, KZT, RUB)
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string; // YYYY-MM-DD
  regionIds?: number[]; // Курорты
  hotelIds?: number[]; // Отели
  meal?: number; // Минимальный тип питания
  hotelCategory?: number; // Минимальная категория отеля (1-5)
  hotelRating?: number; // Рейтинг отеля: 0=any, 2=3.0+, 3=3.5+, 4=4.0+, 5=4.5+
  priceFrom?: number;
  priceTo?: number;
  operatorIds?: number[];
  onlyCharter?: boolean; // Только чартерные рейсы
  arrivalIds?: number[]; // Города прилета
  hotelTypeIds?: number[]; // Типы отелей
  hotelServiceIds?: number[]; // Услуги в отелях
}

// ============= Search Response =============

export interface TourvisorSearchResponse {
  searchId: string;
}

export interface TourvisorSearchStatus {
  isComplete: boolean;
  progress?: number; // 0-100
}

// ============= Tour Data =============

export interface TourvisorPrice {
  currency: string;
  value: number;
}

export interface TourvisorHotelInfo {
  id: number;
  name: string;
  category: number; // Звезды отеля
  rating?: number;
  type?: number;
  latitude?: number;
  longitude?: number;
  picturelink?: string;
  hotelDescriptionLink?: string;
  country: Country;
  region: Region;
  subRegion?: SubRegion;
}

export interface TourvisorPort {
  id: string;
  name: string;
  shortName: string;
  timeZone: string;
}

export interface TourvisorFlightPoint {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  port: TourvisorPort;
}

export interface TourvisorFuelCharge {
  name: string;
  amount: number;
  currency: string;
}

export interface TourvisorFlightCompany {
  id: string;
  name: string;
  logo: string;
  thumb: string;
}

export interface TourvisorFlight {
  number: string;
  departure: TourvisorFlightPoint;
  arrival: TourvisorFlightPoint;
  company: TourvisorFlightCompany;
  plane: string;
  class: string;
  baggage: number;
  carryOn: string;
  fuelCharges: TourvisorFuelCharge[];
  onDemand: boolean;
  noPlaces: boolean;
}

export interface TourvisorFlightOption {
  price: TourvisorPrice;
  fuelCharge: TourvisorPrice;
  isDefault: boolean;
  forward: TourvisorFlight[];
  backward: TourvisorFlight[];
}

export interface TourvisorSurcharge {
  name: string;
  amount: number;
  currency: string;
}

export interface TourvisorTourInfo {
  flags: {
    noFlight: boolean;
    noTransfer: boolean;
    noInsurance: boolean;
    noMeal: boolean;
  };
  surcharges: TourvisorSurcharge[];
}

export interface TourvisorTour {
  id: string;
  searchId: string;
  country: Country;
  departure: Departure;
  hotel: TourvisorHotelInfo;
  meal: Meal;
  nights: number;
  date: string; // YYYY-MM-DD - дата начала тура
  price: TourvisorPrice;
  priceOperator: TourvisorPrice;
  operator: Operator;
  flightOptions: TourvisorFlightOption[];
  info: TourvisorTourInfo;
}

export interface TourvisorSearchResult {
  isComplete: boolean;
  tours: TourvisorTour[];
  progress?: number;
}

// ============= Search Results (Hotels) =============
// Response items from GET /tours/search/{searchId}
export interface TourvisorSearchTour {
  adults: number;
  childs: number;
  currency: string;
  date: string;
  flightNights: number;
  flightPlace: number;
  fuelCharge: number;
  hotelPlace: number;
  id: string;
  isCharter: boolean;
  isPromo: boolean;
  meal: Meal;
  name: string;
  nights: number;
  operator: Operator;
  placement: string;
  price: number;
  roomType: string;
}

export interface TourvisorSearchHotel {
  id: number;
  name: string;
  category: number;
  country: Country;
  region: Region;
  subRegion?: SubRegion;
  seaDistance?: number;
  rating?: number;
  price: number;
  currency: string;
  hotelDescription?: string;
  hotelDescriptionLink?: string;
  hasDescription?: boolean;
  hasPictures?: boolean;
  picturelink?: string;
  latitude?: number;
  longitude?: number;
  tours?: TourvisorSearchTour[];
}

// ============= Hotel Description =============

export interface TourvisorHotelDescription {
  id: number;
  name: string;
  category: number;
  rating?: number;
  type?: number;
  latitude?: number;
  longitude?: number;
  address?: string;
  description?: string;
  photos?: string[];
  amenities?: string[];
  country: Country;
  region: Region;
  subRegion?: SubRegion;
}

// ============= Hot Tours =============

export interface TourvisorHotTour {
  country: Country;
  currency: string;
  date: string; // YYYY-MM-DD
  departure: Departure;
  hotel: TourvisorHotelInfo;
  meal: Meal;
  nights: number;
  operator: Operator;
  price: number;
  priceOld: number;
}

// ============= API Response Wrappers =============

export interface TourvisorApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
