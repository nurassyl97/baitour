import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getTourById, getAllTours } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Star,
  MapPin,
  Clock,
  Users,
  Check,
  X,
  Hotel,
} from "lucide-react";
import type { Metadata } from "next";

interface TourPageProps {
  params: {
    id: string;
  };
}

export async function generateStaticParams() {
  const tours = getAllTours();
  return tours.map((tour) => ({
    id: tour.id,
  }));
}

export async function generateMetadata({
  params,
}: TourPageProps): Promise<Metadata> {
  const tour = getTourById(params.id);

  if (!tour) {
    return {
      title: "Tour Not Found",
    };
  }

  return {
    title: `${tour.name} - ${tour.city}, ${tour.country} | TravelTours`,
    description: tour.description,
    openGraph: {
      title: tour.name,
      description: tour.description,
      images: [tour.image],
    },
  };
}

export default function TourPage({ params }: TourPageProps) {
  const tour = getTourById(params.id);

  if (!tour) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: tour.name,
    description: tour.description,
    image: tour.image,
    offers: {
      "@type": "Offer",
      price: tour.price,
      priceCurrency: tour.currency,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: tour.rating,
      reviewCount: tour.reviewCount,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Image Gallery */}
        <div className="relative h-[500px] w-full">
          <Image
            src={tour.image}
            alt={tour.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="container mx-auto">
              <Badge className="mb-4 bg-white text-black">
                {tour.country}
              </Badge>
              <h1 className="text-5xl font-bold mb-4">{tour.name}</h1>
              <div className="flex flex-wrap gap-6 text-lg">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  {tour.city}, {tour.country}
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  {tour.duration}
                </div>
                <div className="flex items-center">
                  <Star className="h-5 w-5 mr-2 fill-yellow-400 text-yellow-400" />
                  {tour.rating} ({tour.reviewCount} reviews)
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>About This Tour</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg leading-relaxed">{tour.description}</p>
                </CardContent>
              </Card>

              {/* Highlights */}
              <Card>
                <CardHeader>
                  <CardTitle>Tour Highlights</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {tour.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* What's Included/Excluded */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-600">
                      What's Included
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {tour.included.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600">
                      What's Not Included
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {tour.excluded.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <X className="h-4 w-4 text-red-500 mr-2 mt-1 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Hotel Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Hotel className="h-5 w-5 mr-2" />
                    Accommodation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="text-lg font-semibold mb-2">
                    {tour.hotel.name}
                  </h3>
                  <div className="flex items-center mb-4">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="font-semibold">{tour.hotel.rating}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tour.hotel.amenities.map((amenity, index) => (
                      <Badge key={index} variant="secondary">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-4xl font-bold">
                        ${tour.price}
                      </span>
                      <span className="text-muted-foreground">per person</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      * Price may vary based on season and availability
                    </p>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between py-3 border-b">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-semibold">{tour.duration}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b">
                      <span className="text-muted-foreground">Group Size</span>
                      <span className="font-semibold">
                        {tour.minGuests}-{tour.maxGuests} people
                      </span>
                    </div>
                    <div className="flex justify-between py-3 border-b">
                      <span className="text-muted-foreground">Rating</span>
                      <span className="font-semibold flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                        {tour.rating} ({tour.reviewCount})
                      </span>
                    </div>
                  </div>

                  <Link href={`/booking?tourId=${tour.id}`}>
                    <Button size="lg" className="w-full mb-3">
                      Book Now
                    </Button>
                  </Link>
                  
                  <p className="text-xs text-center text-muted-foreground">
                    Free cancellation up to 24 hours before departure
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
