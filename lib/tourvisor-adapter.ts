// Adapter to transform Tourvisor API data to our Tour format

import type { SearchParams } from './data';
import { Tour, TourVariant } from './data';
import {
  TourvisorSearchHotel,
  TourvisorSearchTour,
  TourvisorHotTour,
  TourvisorHotelInfo,
} from './tourvisor-types';

/**
 * Generate a URL-friendly slug from tour data
 * Note: API returns hotel object directly (tour.name = hotel name)
 */
function generateSlug(tour: TourvisorSearchHotel): string {
  const hotelName = (tour.name || 'hotel')
    .toLowerCase()
    .replace(/[^a-z0-9а-я]+/gi, '-')
    .replace(/^-+|-+$/g, '');
  
  const countryName = (tour.country?.name || 'country')
    .toLowerCase()
    .replace(/[^a-z0-9а-я]+/gi, '-');
  
  return `${hotelName}-${countryName}-${tour.id}`;
}

/**
 * Format duration in Russian
 */
function formatDuration(nights: number): string {
  const days = nights + 1;
  
  // Russian pluralization
  const nightsWord = nights === 1 ? 'ночь' : 
                     (nights >= 2 && nights <= 4) ? 'ночи' : 'ночей';
  const daysWord = days === 1 ? 'день' : 
                   (days >= 2 && days <= 4) ? 'дня' : 'дней';
  
  return `${days} ${daysWord} / ${nights} ${nightsWord}`;
}

/**
 * Build highlights from tour info
 * Simplified for API structure
 */
function buildHighlights(tour: TourvisorSearchHotel): string[] {
  const highlights: string[] = [];

  // Hotel category
  if (tour.category) {
    const stars = '⭐'.repeat(tour.category);
    highlights.push(`Отель ${tour.category}${stars}`);
  }

  // Region/location
  const regionName = tour.region?.name;
  if (regionName) {
    highlights.push(`Расположение: ${regionName}`);
  }

  if (tour.seaDistance !== null && tour.seaDistance !== undefined) {
    highlights.push(`До моря: ${tour.seaDistance}м`);
  }

  // Default amenities (search results don't include them)
  highlights.push('Бассейн');
  highlights.push('Ресторан');

  return highlights.slice(0, 5);
}

/**
 * Build excluded items list
 */
function buildExcluded(): string[] {
  return [
    'Визовые сборы (если требуется)',
    'Личные расходы',
    'Экскурсии (оплачиваются дополнительно)',
  ];
}

/**
 * Fix protocol-relative URLs from Tourvisor
 */
function fixImageUrl(url: string | undefined): string {
  if (!url) return '';
  
  // If URL starts with //, add https:
  if (url.startsWith('//')) {
    return `https:${url}`;
  }
  
  return url;
}

/**
 * Get hotel image or default
 */
type HotelImageSource = Pick<TourvisorHotelInfo, "picturelink" | "country">;

function getHotelImage(hotel: HotelImageSource): string {
  // Try picture link from hotel object (API returns picturelink directly)
  if (hotel.picturelink) {
    return fixImageUrl(hotel.picturelink);
  }

  // Default image based on country
  const countryDefaults: { [key: string]: string } = {
    'Турция': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80',
    'ОАЭ': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
    'Египет': 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800&q=80',
    'Мальдивы': 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80',
    'Таиланд': 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80',
  };

  return (
    countryDefaults[hotel.country?.name || ''] ||
    'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&q=80'
  );
}

/**
 * Get multiple hotel images
 */
function getHotelImages(hotel: HotelImageSource): string[] {
  const mainImage = getHotelImage(hotel);
  return [mainImage, mainImage, mainImage];
}

/**
 * Build full description
 */
function buildDescription(tour: TourvisorSearchHotel): string {
  let description = '';

  // Hotel description from API or generate
  if (tour.hotelDescription) {
    description += tour.hotelDescription + '\n\n';
  } else {
    const stars = tour.category ? `(${tour.category}⭐)` : '';
    const regionName = tour.region?.name || '';
    description += `Отель ${tour.name || 'Отель'} ${stars} расположен в ${regionName}, ${tour.country?.name || ''}. `;
  }

  return description;
}

function toVariant(t: TourvisorSearchTour): TourVariant {
  return {
    id: t.id,
    operator: t.operator?.russianName || t.operator?.fullName || t.operator?.name || 'Оператор',
    operatorId: t.operator?.id || 0,
    date: t.date || '',
    nights: t.nights || 0,
    meal: t.meal?.russianName || t.meal?.name,
    price: t.price || 0,
    currency: t.currency || 'KZT',
  };
}

/**
 * Format nights range like "7-15 дней / 6-14 ночей"
 */
function formatDurationRange(nightsFrom?: number, nightsTo?: number): string {
  if (!nightsFrom && !nightsTo) return '—';
  const from = nightsFrom ?? nightsTo ?? 0;
  const to = nightsTo ?? nightsFrom ?? from;
  if (from <= 0 || to <= 0) return '—';
  if (from === to) return formatDuration(from);
  return `${from + 1}-${to + 1} дней / ${from}-${to} ночей`;
}

/**
 * Transform array of Tourvisor search hotels
 */
export function transformTours(
  tourvisorHotels: TourvisorSearchHotel[],
  searchParams?: SearchParams
): Tour[] {
  return tourvisorHotels.map((h) => {
    const hotelName = h.name || 'Hotel';
    const countryName = h.country?.name || 'Unknown Country';
    const regionName = h.region?.name || 'Resort';
    const price = h.price ?? 0;
    const currency = h.currency || 'KZT';
    const rating = h.rating ?? (h.category ? h.category * 1.8 : 4.0);

    const imageSource: HotelImageSource = {
      picturelink: h.picturelink,
      country: h.country,
    };

    const image = getHotelImage(imageSource);
    const variants = (h.tours || []).map(toVariant);

    return {
      id: String(h.id),
      name: `${hotelName} - ${countryName}`,
      slug: generateSlug(h),
      country: countryName,
      city: h.subRegion?.name || regionName,
      duration:
        variants.length > 0
          ? formatDurationRange(
              Math.min(...variants.map((v) => v.nights)),
              Math.max(...variants.map((v) => v.nights))
            )
          : formatDurationRange(searchParams?.nightsFrom, searchParams?.nightsTo),
      price: variants.length > 0 ? Math.min(...variants.map((v) => v.price)) : price,
      currency,
      rating,
      reviewCount: 0,
      image,
      images: getHotelImages(imageSource),
      description: buildDescription(h),
      highlights: buildHighlights(h),
      included: [
        `Проживание в отеле ${h.category}⭐`,
        'Авиаперелет туда и обратно',
        'Трансфер аэропорт-отель-аэропорт',
        'Медицинская страховка',
      ],
      excluded: buildExcluded(),
      hotel: {
        name: hotelName,
        rating,
        amenities: ['WiFi', 'Ресторан', 'Бассейн'],
      },
      maxGuests: 10,
      minGuests: 1,
      variants,
    };
  });
}

/**
 * Transform hot tour to our Tour format
 */
export function transformHotTour(hotTour: TourvisorHotTour, index?: number): Tour {
  const nights = hotTour.nights;
  const oldPrice = hotTour.priceOld || hotTour.price * 1.2;
  
  // Create unique ID by combining hotel, date, nights, and operator to avoid duplicates
  const uniqueId = `hot-${hotTour.hotel.id}-${hotTour.date}-${hotTour.nights}n-${hotTour.operator.id}${index !== undefined ? `-${index}` : ''}`;
  
  return {
    id: uniqueId,
    name: `🔥 ${hotTour.hotel.name} - ${hotTour.country.name}`,
    slug: `hot-${hotTour.hotel.name.toLowerCase().replace(/\s+/g, '-')}-${hotTour.date}`,
    country: hotTour.country.name,
    city: hotTour.hotel.region.name,
    duration: formatDuration(nights),
    price: hotTour.price,
    currency: hotTour.currency,
    rating: hotTour.hotel.rating || (hotTour.hotel.category * 1.6),
    reviewCount: 0,
    image: fixImageUrl(hotTour.hotel.picturelink) || getHotelImage(hotTour.hotel),
    images: [
      fixImageUrl(hotTour.hotel.picturelink) || getHotelImage(hotTour.hotel)
    ],
    description: `🔥 Горящий тур! Отель ${hotTour.hotel.name} (${hotTour.hotel.category}⭐) в ${hotTour.hotel.region.name}, ${hotTour.country.name}. Вылет ${hotTour.date}. Питание: ${hotTour.meal.fullRussianName || hotTour.meal.russianName}. Успейте забронировать по выгодной цене!`,
    highlights: [
      `🔥 Скидка ${Math.round(((oldPrice - hotTour.price) / oldPrice) * 100)}%`,
      `Вылет: ${new Date(hotTour.date).toLocaleDateString('ru-RU')}`,
      `Питание: ${hotTour.meal.russianName}`,
      `${hotTour.hotel.category}⭐ отель`,
      `Туроператор: ${hotTour.operator.russianName}`,
    ],
    included: [
      `Проживание в отеле ${hotTour.hotel.category}⭐`,
      `Питание: ${hotTour.meal.fullRussianName}`,
      'Авиаперелет',
      'Трансфер',
      'Страховка',
    ],
    excluded: [
      'Визовые сборы (если требуется)',
      'Личные расходы',
      'Дополнительные экскурсии',
    ],
    hotel: {
      name: hotTour.hotel.name,
      rating: hotTour.hotel.rating || hotTour.hotel.category,
      amenities: ['WiFi', 'Ресторан', 'Бассейн'],
    },
    maxGuests: 10,
    minGuests: 1,
  };
}

/**
 * Transform array of hot tours
 */
export function transformHotTours(hotTours: TourvisorHotTour[]): Tour[] {
  return hotTours.map((tour, index) => transformHotTour(tour, index));
}
