// components/siswa/HeaderSiswa.tsx
"use client";

import Link from "next/link";
import { useCart } from "@/components/siswa/cart-provider";

export default function HeaderSiswa() {
  const { totalQty, open } = useCart();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-slate-50/80 backdrop-blur">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="min-w-0">
          <div className="text-sm font-extrabold text-slate-900">Dashboard Siswa</div>
          <div className="text-xs text-slate-500">Pilih menu, tambah keranjang, lalu checkout.</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={open}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-800 hover:bg-slate-50"
          >
            Keranjang ({totalQty})
          </button>

          <Link
            href="/siswa/dashboard/profil"
            className="rounded-2xl bg-purple-600 px-4 py-2 text-sm font-extrabold text-white hover:bg-purple-700"
          >
            Profil
          </Link>
        </div>
      </div>
    </header>
  );
}
