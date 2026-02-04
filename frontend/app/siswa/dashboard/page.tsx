// app/siswa/dashboard/page.tsx
"use client";

import Link from "next/link";
import { useRef } from "react";
import { useCart } from "@/components/siswa/cart-provider";

export default function DashboardSiswaPage() {
  const { open: openCart, totalQty } = useCart() as any;

  const scrollerRef = useRef<HTMLDivElement | null>(null);

  // ✅ dummy data (ganti title/desc/img nanti)
  const dummyFoods = [
    {
      id: 1,
      title: "Spaghetti Bolognese",
      desc: "Diskon sampai 40% ",
      img: "/image/spageti.png",
      rating: 4.8,
      comments: 156,
      place: "Kantin Sekolah",
      price: "Rp 12.000",
      badge: "Promo",
    },
    {
      id: 2,
      title: "Cheese Burger",
      desc: "Mulai Rp 10.000 ",
      img: "/image/burger.jpg",
      rating: 4.7,
      comments: 98,
      place: "Kantin Sekolah",
      price: "Rp 15.000",
      badge: "Promo",
    },
    {
      id: 3,
      title: "Pizza Pepperoni",
      desc: "Diskon 20% ",
      img: "/image/pizza.jpg",
      rating: 4.9,
      comments: 203,
      place: "Kantin Sekolah",
      price: "Rp 18.000",
      badge: "Promo",
    },
    {
      id: 4,
      title: "Japanese Ramen",
      desc: "Beli 2 gratis 1 ",
      img: "/image/ramen.jpg",
      rating: 4.6,
      comments: 77,
      place: "Kantin Sekolah",
      price: "Rp 16.000",
      badge: "Promo",
    },
    {
      id: 5,
      title: "Fried Chicken",
      desc: "Potongan 15% ",
      img: "/image/chicken.jpg",
      rating: 4.8,
      comments: 164,
      place: "Kantin Sekolah",
      price: "Rp 14.000",
      badge: "Promo",
    },
    {
      id: 6,
      title: "Spicy Macaroni",
      desc: "Promo terbatas ",
      img: "/image/macaroni.jpg",
      rating: 4.5,
      comments: 54,
      place: "Kantin Sekolah",
      price: "Rp 10.000",
      badge: "Promo",
    },
    {
      id: 7,
      title: "Special Fried Rice",
      desc: "Diskon 10% ",
      img: "/image/nasigoreng.jpg",
      rating: 4.7,
      comments: 121,
      place: "Kantin Sekolah",
      price: "Rp 13.000",
      badge: "Promo",
    },
    {
      id: 8,
      title: "Snack Time",
      desc: "Cashback ",
      img: "/image/snack.jpg",
      rating: 4.6,
      comments: 89,
      place: "Kantin Sekolah",
      price: "Rp 9.000",
      badge: "Promo",
    },
  ];

  function stars(rating: number) {
    const full = Math.max(0, Math.min(5, Math.round(rating)));
    return "★★★★★".slice(0, full) + "☆☆☆☆☆".slice(0, 5 - full);
  }

  function scrollByCards(dir: "left" | "right") {
    const el = scrollerRef.current;
    if (!el) return;

    // scroll kira-kira 2 card (lebih halus)
    const amount = 720;
    el.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  return (
    <div className="space-y-6">
      {/* HERO */}
      <div className="rounded-[2.25rem] border border-purple-100 bg-linear-to-br from-purple-200 via-white to-purple-200 p-8 lg:p-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-extrabold leading-tight text-slate-900 lg:text-5xl">
              Dengan <span className="text-purple-700">KantinKu</span> Pesan
              Makan Ngga usah <span className="text-purple-700">Antri</span>
            </h1>
          </div>

          <img
            src="/image/3dkantin.png"
            alt="KantinKu"
            className="h-52 w-auto object-contain drop-shadow-lg lg:h-64"
          />
        </div>
      </div>

      {/* HEADER MENU POPULER + PANAH */}
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-base font-extrabold text-slate-900">
            Menu Populer
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollByCards("left")}
            className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            aria-label="Geser kiri"
          >
            ←
          </button>

          <button
            type="button"
            onClick={() => scrollByCards("right")}
            className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            aria-label="Geser kanan"
          >
            →
          </button>

          <Link
            href="/siswa/dashboard/menu"
            className="ml-2 inline-flex items-center gap-1 text-sm font-extrabold text-purple-700 hover:underline"
          >
            View all <span aria-hidden>→</span>
          </Link>
        </div>
      </div>

      {/* ✅ CAROUSEL TANPA SCROLLBAR BAWAH */}
      <div
        ref={scrollerRef}
        className="no-scrollbar flex gap-5 overflow-x-auto pb-1"
      >
        {dummyFoods.slice(0, 8).map((item) => (
          <Link
            key={item.id}
            href="/siswa/dashboard/menu"
            className="group w-[320px] shrink-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:border-purple-300 hover:shadow-md"
          >
            {/* IMG dummy: kamu tinggal ganti nama filenya */}
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.img}
                alt={item.title}
                className="h-48 w-full object-cover transition group-hover:scale-[1.03]"
              />

              <div className="absolute right-3 top-3 rounded-full bg-white/80 px-3 py-1 text-[11px] font-extrabold text-purple-700 ring-1 ring-purple-100 backdrop-blur">
                {item.badge}
              </div>
            </div>

            {/* CONTENT */}
            <div className="p-5">
              <div className="truncate text-base font-extrabold text-slate-900">
                {item.title}
              </div>
              <div className="mt-1 truncate text-sm text-slate-500">
                {item.desc}
              </div>

              {/* Rating + komentar */}
              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500">{stars(item.rating)}</span>
                  <span className="font-extrabold text-slate-800">
                    {item.rating.toFixed(1)}
                  </span>
                </div>
                <span className="text-slate-500">{item.comments} komentar</span>
              </div>

              {/* Lokasi + harga */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100">
                    📍
                  </span>
                  <span className="truncate">{item.place}</span>
                </div>

                <div className="text-base font-extrabold text-purple-700">
                  {item.price}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ✅ CSS helper untuk hide scrollbar */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
