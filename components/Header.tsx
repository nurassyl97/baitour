"use client";

import { useState } from "react";
import Link from "next/link";

const navItems = [
  { href: "/", label: "Главная" },
  { href: "/search", label: "Туры" },
  { href: "/#about", label: "О нас" },
  { href: "/#contact", label: "Контакты" },
] as const;

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="border-b bg-gradient-to-r from-[#22a7f0] to-[#1b8fd8] shadow-md relative z-50">
      <div className="ds-container py-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-bold text-white hover:text-[#FFC800] transition-colors shrink-0"
        >
          <span className="text-white">BAI</span>
          <span className="text-[#FFC800]">tour</span>
        </Link>

        {/* Desktop nav: hidden on mobile, visible from lg */}
        <div className="hidden lg:flex gap-6 text-white font-medium">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="hover:text-[#FFC800] transition-colors whitespace-nowrap"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Burger: visible only below lg */}
        <button
          type="button"
          onClick={() => setIsMenuOpen((v) => !v)}
          className="lg:hidden flex items-center justify-center w-10 h-10 text-white hover:text-[#FFC800] transition-colors rounded focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={isMenuOpen}
        >
          <span className="text-2xl leading-none" aria-hidden>
            ☰
          </span>
        </button>
      </div>

      {/* Mobile menu: slide-down, only below lg */}
      <div
        className={`lg:hidden absolute left-0 right-0 top-full z-50 bg-gradient-to-b from-[#22a7f0] to-[#1b8fd8] shadow-lg overflow-hidden transition-[max-height] duration-300 ease-out ${
          isMenuOpen ? "max-h-[280px]" : "max-h-0"
        }`}
        aria-hidden={!isMenuOpen}
      >
        <div className="ds-container py-4 flex flex-col gap-1">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setIsMenuOpen(false)}
              className="py-3 px-2 text-white font-medium hover:text-[#FFC800] hover:bg-white/10 rounded-lg transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
