// Adapter to transform Tourvisor API data to our Tour format

import { Tour } from './data';
import {
  TourvisorTour,
  TourvisorHotTour,
  TourvisorHotelDescription,
} from './tourvisor-types';

/**
 * Generate a URL-friendly slug from tour data
 */
function generateSlug(tour: TourvisorTour): string {
  const hotelName = tour.hotel.name
    .toLowerCase()
    .replace(/[^a-z0-9а-я]+/gi, '-')
    .replace(/^-+|-+$/g, '');
  
  const countryName = tour.country.name
    .toLowerCase()
    .replace(/[^a-z0-9а-я]+/gi, '-');
  
  return `${hotelName}-${countryName}-${tour.nights}n-${tour.id}`;
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
 * Extract hotel amenities from description
 */
function extractAmenities(hotelDescription?: TourvisorHotelDescription): string[] {
  if (!hotelDescription?.amenities) {
    // Return default amenities based on hotel category
    return ['WiFi', 'Ресторан', 'Бассейн'];
  }
  return hotelDescription.amenities;
}

/**
 * Build highlights from tour info
 */
function buildHighlights(tour: TourvisorTour, hotelDescription?: TourvisorHotelDescription): string[] {
  const highlights: string[] = [];

  // Flight info
  if (!tour.info.flags.noFlight && tour.flightOptions.length > 0) {
    const defaultFlight = tour.flightOptions.find(f => f.isDefault) || tour.flightOptions[0];
    if (defaultFlight.forward.length > 0) {
      const flight = defaultFlight.forward[0];
      highlights.push(`Прямой рейс ${flight.company.name}`);
    }
  }

  // Meal
  if (!tour.info.flags.noMeal) {
    highlights.push(`Питание: ${tour.meal.fullRussianName || tour.meal.russianName}`);
  }

  // Transfer
  if (!tour.info.flags.noTransfer) {
    highlights.push('Трансфер из аэропорта включен');
  }

  // Hotel features
  if (hotelDescription?.amenities) {
    highlights.push(...hotelDescription.amenities.slice(0, 3));
  }

  // Region/location
  highlights.push(`Расположение: ${tour.hotel.region.name}`);

  return highlights.slice(0, 5); // Max 5 highlights
}

/**
 * Build included items list
 */
function buildIncluded(tour: TourvisorTour): string[] {
  const included: string[] = [];

  // Hotel
  const hotelStars = '⭐'.repeat(tour.hotel.category);
  included.push(`Проживание в отеле ${tour.hotel.category}${hotelStars}`);

  // Meal
  if (!tour.info.flags.noMeal) {
    included.push(`Питание: ${tour.meal.fullRussianName || tour.meal.russianName}`);
  }

  // Flight
  if (!tour.info.flags.noFlight) {
    included.push('Авиаперелет туда и обратно');
  }

  // Transfer
  if (!tour.info.flags.noTransfer) {
    included.push('Трансфер аэропорт-отель-аэропорт');
  }

  // Insurance
  if (!tour.info.flags.noInsurance) {
    included.push('Медицинская страховка');
  }

  // Tour operator services
  included.push('Услуги туроператора');

  return included;
}

/**
 * Build excluded items list
 */
function buildExcluded(tour: TourvisorTour): string[] {
  const excluded: string[] = [];

  // Flight not included
  if (tour.info.flags.noFlight) {
    excluded.push('Авиаперелет (приобретается отдельно)');
  }

  // Transfer not included
  if (tour.info.flags.noTransfer) {
    excluded.push('Трансфер из аэропорта');
  }

  // Insurance not included
  if (tour.info.flags.noInsurance) {
    excluded.push('Медицинская страховка');
  }

  // Meal not included
  if (tour.info.flags.noMeal) {
    excluded.push('Питание');
  }

  // Visa fees
  excluded.push('Визовые сборы (если требуется)');

  // Personal expenses
  excluded.push('Личные расходы');

  // Excursions
  excluded.push('Экскурсии (оплачиваются дополнительно)');

  return excluded;
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
function getHotelImage(tour: TourvisorTour, hotelDescription?: TourvisorHotelDescription): string {
  // Try hotel description photos first
  if (hotelDescription?.photos && hotelDescription.photos.length > 0) {
    return fixImageUrl(hotelDescription.photos[0]);
  }

  // Try hotel picture link
  if (tour.hotel.picturelink) {
    return fixImageUrl(tour.hotel.picturelink);
  }

  // Default image based on country
  const countryDefaults: { [key: string]: string } = {
    'Турция': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80',
    'ОАЭ': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
    'Египет': 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800&q=80',
    'Мальдивы': 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80',
    'Таиланд': 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80',
  };

  return countryDefaults[tour.country.name] || 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&q=80';
}

/**
 * Get multiple hotel images
 */
function getHotelImages(tour: TourvisorTour, hotelDescription?: TourvisorHotelDescription): string[] {
  // Use description photos if available
  if (hotelDescription?.photos && hotelDescription.photos.length > 0) {
    return hotelDescription.photos.slice(0, 5).map(fixImageUrl);
  }

  // Otherwise return single image repeated
  const mainImage = getHotelImage(tour, hotelDescription);
  return [mainImage, mainImage, mainImage];
}

/**
 * Build full description
 */
function buildDescription(tour: TourvisorTour, hotelDescription?: TourvisorHotelDescription): string {
  let description = '';

  // Hotel description
  if (hotelDescription?.description) {
    description += hotelDescription.description + '\n\n';
  } else {
    description += `Отель ${tour.hotel.name} (${tour.hotel.category}⭐) расположен в ${tour.hotel.region.name}, ${tour.country.name}. `;
  }

  // Tour details
  description += `Тур на ${formatDuration(tour.nights)} включает проживание в отеле `;
  
  if (!tour.info.flags.noMeal) {
    description += `с питанием ${tour.meal.fullRussianName || tour.meal.russianName}`;
  }

  if (!tour.info.flags.noFlight) {
    description += `, авиаперелет`;
  }

  if (!tour.info.flags.noTransfer) {
    description += `, трансфер из аэропорта`;
  }

  description += `.`;

  // Location
  if (tour.hotel.subRegion) {
    description += ` Отель находится в районе ${tour.hotel.subRegion.name}.`;
  }

  // Operator
  description += ` Туроператор: ${tour.operator.russianName || tour.operator.name}.`;

  return description;
}

/**
 * Transform Tourvisor tour to our Tour format
 */
export function transformTourvisorTour(
  tourvisorTour: TourvisorTour,
  hotelDescription?: TourvisorHotelDescription
): Tour {
  return {
    id: tourvisorTour.id,
    name: `${tourvisorTour.hotel.name} - ${tourvisorTour.country.name}`,
    slug: generateSlug(tourvisorTour),
    country: tourvisorTour.country.name,
    city: tourvisorTour.hotel.region.name,
    duration: formatDuration(tourvisorTour.nights),
    price: tourvisorTour.price.value,
    currency: tourvisorTour.price.currency,
    rating: hotelDescription?.rating || tourvisorTour.hotel.rating || (tourvisorTour.hotel.category * 1.6), // Estimate from stars
    reviewCount: 0, // Tourvisor doesn't provide review count
    image: getHotelImage(tourvisorTour, hotelDescription),
    images: getHotelImages(tourvisorTour, hotelDescription),
    description: buildDescription(tourvisorTour, hotelDescription),
    highlights: buildHighlights(tourvisorTour, hotelDescription),
    included: buildIncluded(tourvisorTour),
    excluded: buildExcluded(tourvisorTour),
    hotel: {
      name: tourvisorTour.hotel.name,
      rating: hotelDescription?.rating || tourvisorTour.hotel.rating || tourvisorTour.hotel.category,
      amenities: extractAmenities(hotelDescription),
    },
    maxGuests: 10, // Default, Tourvisor doesn't specify
    minGuests: 1,
  };
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
    image: fixImageUrl(hotTour.hotel.picturelink) || getHotelImage({ 
      hotel: hotTour.hotel, 
      country: hotTour.country 
    } as any),
    images: [
      fixImageUrl(hotTour.hotel.picturelink) || getHotelImage({ 
        hotel: hotTour.hotel, 
        country: hotTour.country 
      } as any)
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
 * Transform array of Tourvisor tours
 */
export function transformTours(
  tourvisorTours: TourvisorTour[],
  hotelDescriptions?: Map<number, TourvisorHotelDescription>
): Tour[] {
  return tourvisorTours.map(tour => {
    const hotelDesc = hotelDescriptions?.get(tour.hotel.id);
    return transformTourvisorTour(tour, hotelDesc);
  });
}

/**
 * Transform array of hot tours
 */
export function transformHotTours(hotTours: TourvisorHotTour[]): Tour[] {
  return hotTours.map((tour, index) => transformHotTour(tour, index));
}
