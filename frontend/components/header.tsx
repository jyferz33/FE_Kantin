"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-purple-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="relative container mx-auto flex h-16 items-center px-4">
        {/* Logo (LEFT) */}
        <Link href="/" className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-purple-500" />
          <span className="text-lg font-bold text-purple-600">KantinKu</span>
        </Link>

        {/* Desktop Navigation (CENTER) */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-gray-900 transition-colors hover:text-purple-600"
          >
            Home
          </Link>
          <Link
            href="/menu"
            className="text-sm font-medium text-gray-500 transition-colors hover:text-purple-600"
          >
            Menu
          </Link>
          <Link
            href="/order"
            className="text-sm font-medium text-gray-500 transition-colors hover:text-purple-600"
          >
            Order
          </Link>
          <Link
            href="/merchant"
            className="text-sm font-medium text-gray-500 transition-colors hover:text-purple-600"
          >
            Merchant
          </Link>
          <Link
            href="/tentang"
            className="text-sm font-medium text-gray-500 transition-colors hover:text-purple-600"
          >
            Tentang
          </Link>
        </nav>

        {/* Mobile Menu Button (RIGHT) */}
        <button
          className="ml-auto p-2 md:hidden"
          onClick={() => setIsMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="border-t border-purple-100 bg-white md:hidden">
          <nav className="container mx-auto flex flex-col gap-4 p-4">
            <Link href="/" className="text-sm font-medium text-gray-900">
              Home
            </Link>
            <Link href="/menu" className="text-sm font-medium text-gray-500">
              Menu
            </Link>
            <Link href="/order" className="text-sm font-medium text-gray-500">
              Order
            </Link>
            <Link href="/merchant" className="text-sm font-medium text-gray-500">
              Merchant
            </Link>
            <Link href="/tentang" className="text-sm font-medium text-gray-500">
              Tentang
            </Link>

            <div className="flex gap-3 border-t border-purple-100 pt-4">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-purple-200 bg-transparent text-purple-600"
                asChild
              >
                <Link href="/login">Masuk</Link>
              </Button>
              <Button
                size="sm"
                className="flex-1 rounded-full bg-purple-600 text-white hover:bg-purple-700"
                asChild
              >
                <Link href="/daftar">Daftar</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
