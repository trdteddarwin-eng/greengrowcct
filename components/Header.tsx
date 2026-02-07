"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/call", label: "Practice" },
  { href: "/scenarios", label: "Scenarios" },
  { href: "/playbook", label: "Playbook" },
  { href: "/objections", label: "Objections" },
  { href: "/history", label: "History" },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-gray-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl" role="img" aria-label="Phone">
            📞
          </span>
          <span className="text-xl font-bold text-white">
            GreenGrow <span className="text-green-500">CCT</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-green-500/10 text-green-500"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden flex flex-col items-center justify-center w-10 h-10 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <span
            className={`block w-5 h-0.5 bg-current transition-transform duration-200 ${
              mobileMenuOpen ? "translate-y-[3px] rotate-45" : ""
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-current my-1 transition-opacity duration-200 ${
              mobileMenuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-current transition-transform duration-200 ${
              mobileMenuOpen ? "-translate-y-[3px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile nav dropdown */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-gray-800 bg-gray-950 px-4 pb-4 pt-2">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-green-500/10 text-green-500"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
