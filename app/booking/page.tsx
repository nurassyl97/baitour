"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { getTourById, type Tour } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import { MapPin, Clock, Users, Loader2 } from "lucide-react";

function BookingFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tourId = searchParams.get("tourId");
  const [tour, setTour] = useState<Tour | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    travelDate: "",
    adults: "2",
    children: "0",
    specialRequests: "",
    agreeToTerms: false,
  });

  useEffect(() => {
    if (tourId) {
      const foundTour = getTourById(tourId);
      setTour(foundTour || null);
    }
  }, [tourId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Generate reference number
    const referenceNumber = `TR${Date.now()}`;

    // Simulate form submission (in production, this would send to Formspree or backend)
    try {
      // Store in localStorage for confirmation page
      localStorage.setItem(
        "bookingData",
        JSON.stringify({
          ...formData,
          tourName: tour?.name,
          tourId,
          referenceNumber,
          submittedAt: new Date().toISOString(),
        })
      );

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect to confirmation
      router.push(`/confirmation?ref=${referenceNumber}`);
    } catch (error) {
      alert("There was an error submitting your booking. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (!tour) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Card>
            <CardContent className="p-12 text-center">
              <h2 className="text-2xl font-semibold mb-4">Tour Not Found</h2>
              <p className="text-muted-foreground mb-6">
                Please select a tour from our catalog.
              </p>
              <Button onClick={() => router.push("/")}>
                Browse Tours
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const totalPrice =
    tour.price * (parseInt(formData.adults) + parseInt(formData.children) * 0.7);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Complete Your Booking</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Your Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="fullName"
                        required
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        Phone Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="travelDate">
                        Travel Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="travelDate"
                        type="date"
                        required
                        value={formData.travelDate}
                        onChange={(e) =>
                          setFormData({ ...formData, travelDate: e.target.value })
                        }
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="adults">
                        Number of Adults <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="adults"
                        type="number"
                        min={tour.minGuests}
                        max={tour.maxGuests}
                        required
                        value={formData.adults}
                        onChange={(e) =>
                          setFormData({ ...formData, adults: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="children">Number of Children</Label>
                      <Input
                        id="children"
                        type="number"
                        min="0"
                        max="10"
                        value={formData.children}
                        onChange={(e) =>
                          setFormData({ ...formData, children: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialRequests">
                      Special Requests (Optional)
                    </Label>
                    <textarea
                      id="specialRequests"
                      className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                      value={formData.specialRequests}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          specialRequests: e.target.value,
                        })
                      }
                      placeholder="Any dietary restrictions, accessibility needs, or special requests..."
                    />
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      required
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          agreeToTerms: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed">
                      I agree to the terms and conditions and understand that
                      this is a booking request. The agency will contact me to
                      confirm availability and payment details.{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Booking Request"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative h-40 w-full rounded-lg overflow-hidden">
                  <Image
                    src={tour.image}
                    alt={tour.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">{tour.name}</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {tour.city}, {tour.country}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {tour.duration}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      {formData.adults} adults
                      {parseInt(formData.children) > 0 &&
                        `, ${formData.children} children`}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Adults ({formData.adults})</span>
                    <span>${tour.price * parseInt(formData.adults)}</span>
                  </div>
                  {parseInt(formData.children) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Children ({formData.children})</span>
                      <span>
                        ${(tour.price * 0.7 * parseInt(formData.children)).toFixed(0)}
                      </span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${totalPrice.toFixed(0)}</span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  <p>* Final price will be confirmed by our team</p>
                  <p>* Free cancellation up to 24 hours before departure</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    }>
      <BookingFormContent />
    </Suspense>
  );
}
