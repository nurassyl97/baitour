import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock } from "lucide-react";
import { Tour } from "@/lib/data";

interface TourCardProps {
  tour: Tour;
}

export function TourCard({ tour }: TourCardProps) {
  const tourLink = `/tour/${tour.id}`;
  
  return (
    <Link href={tourLink} className="block">
      <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full cursor-pointer">
        <div className="relative h-48 w-full">
          <Image
            src={tour.image}
            alt={tour.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <Badge className="absolute top-2 right-2 bg-white text-black">
            {tour.price.toLocaleString()} {tour.currency === 'KZT' ? '₸' : tour.currency || '₸'}
          </Badge>
        </div>
        
        <CardContent className="p-4 space-y-2">
          <h3 className="font-semibold text-lg line-clamp-2">{tour.name}</h3>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            <span>
              {tour.city}, {tour.country}
            </span>
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            <span>{tour.duration}</span>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
            <span className="font-semibold">{tour.rating}</span>
            <span className="text-sm text-muted-foreground ml-1">
              ({tour.reviewCount})
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
