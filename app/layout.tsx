import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TravelTours - Discover Amazing Tours Worldwide",
  description:
    "Find and book the best tours around the world. From cultural experiences to adventure trips, we have the perfect tour for you.",
  keywords: ["tours", "travel", "vacation", "holidays", "booking"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="border-b bg-white">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary">
              TravelTours
            </Link>
            <div className="flex gap-6">
              <Link href="/" className="hover:text-primary">
                Home
              </Link>
              <Link href="/search" className="hover:text-primary">
                Tours
              </Link>
              <Link href="/#about" className="hover:text-primary">
                About
              </Link>
              <Link href="/#contact" className="hover:text-primary">
                Contact
              </Link>
            </div>
          </div>
        </nav>

        <main className="min-h-screen">{children}</main>

        <footer className="bg-gray-900 text-white py-12 mt-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">TravelTours</h3>
                <p className="text-gray-400">
                  Your trusted partner for unforgettable travel experiences
                  around the world.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link href="/" className="hover:text-white">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="/search" className="hover:text-white">
                      Tours
                    </Link>
                  </li>
                  <li>
                    <Link href="/#about" className="hover:text-white">
                      About Us
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Contact</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>Email: info@traveltours.com</li>
                  <li>Phone: +1 (555) 123-4567</li>
                  <li>Address: 123 Travel St, NY</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link href="/terms" className="hover:text-white">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="hover:text-white">
                      Privacy Policy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2026 TravelTours. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
