import { SearchForm } from "@/components/search-form";
import { TourCard } from "@/components/tour-card";
import { getPopularTours } from "@/lib/data";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MapPin, Shield, Award, HeadphonesIcon } from "lucide-react";

export default function HomePage() {
  const popularTours = getPopularTours(6);

  return (
    <div>
      {/* Hero Section */}
      <section
        className="relative h-[600px] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80')",
        }}
      >
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Discover Your Next Adventure
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Explore amazing tours and experiences around the world with expert
            guides and unforgettable memories
          </p>
          <div className="max-w-4xl mx-auto">
            <SearchForm />
          </div>
        </div>
      </section>

      {/* Popular Tours */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Popular Tours</h2>
            <p className="text-lg text-muted-foreground">
              Handpicked tours loved by thousands of travelers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/search">
              <Button size="lg">View All Tours</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Why Choose Us</h2>
            <p className="text-lg text-muted-foreground">
              We make your travel dreams come true
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Worldwide Destinations
              </h3>
              <p className="text-muted-foreground">
                Tours in over 50 countries across all continents
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Guides</h3>
              <p className="text-muted-foreground">
                Professional local guides with years of experience
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Best Price Guarantee</h3>
              <p className="text-muted-foreground">
                Competitive prices and flexible payment options
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                <HeadphonesIcon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
              <p className="text-muted-foreground">
                Always here to help before, during, and after your trip
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About & Contact */}
      <section id="about" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">About TravelTours</h2>
            <p className="text-lg text-muted-foreground mb-6">
              We are a passionate team of travel enthusiasts dedicated to
              creating unforgettable experiences for our customers. With over 10
              years of experience in the travel industry, we carefully curate
              each tour to ensure the highest quality and value.
            </p>
            <div id="contact" className="mt-12 p-8 bg-white rounded-lg shadow">
              <h3 className="text-2xl font-semibold mb-4">Get in Touch</h3>
              <p className="text-muted-foreground mb-4">
                Have questions? We'd love to hear from you.
              </p>
              <div className="space-y-2">
                <p>
                  <strong>Email:</strong> info@traveltours.com
                </p>
                <p>
                  <strong>Phone:</strong> +1 (555) 123-4567
                </p>
                <p>
                  <strong>Hours:</strong> Mon-Fri 9AM-6PM EST
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
