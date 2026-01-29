"use client";

import Link from "next/link";

export default function AdminDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Navbar */}
            <header className="sticky top-0 z-50 w-full border-b border-violet-100 bg-white/90 backdrop-blur">
                <div className="relative mx-auto flex h-16 max-w-6xl items-center px-4">
                    {/* Brand (LEFT) */}
                    <Link href="/admin/dashboard" className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-violet-600" />
                        <span className="text-lg font-bold text-violet-700">KantinKu</span>
                        <span className="ml-2 hidden rounded-full bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-700 md:inline">
                            Admin
                        </span>
                    </Link>

                    {/* Desktop Menu (CENTER) */}
                    <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 md:flex">
                        <Link
                            href="/admin/dashboard/data-siswa"
                            className="text-sm font-medium text-slate-600 hover:text-violet-700"
                        >
                            Data Siswa
                        </Link>
                        <Link
                            href="/admin/dashboard/menu"
                            className="text-sm font-medium text-slate-600 hover:text-violet-700"
                        >
                            Makanan & Minuman
                        </Link>
                        <Link
                                href="/admin/dashboard/order"
                                className="text-sm font-medium text-slate-600 hover:text-violet-700"
                            >
                                Order
                            </Link>
                        <Link
                            href="/admin/dashboard/rekap-pemesanan"
                            className="text-sm font-medium text-slate-600 hover:text-violet-700"
                        >
                            Rekap Pemesanan
                        </Link>
                        <Link
                            href="/admin/dashboard/rekap-pemasukan"
                            className="text-sm font-medium text-slate-600 hover:text-violet-700"
                        >
                            Rekap Pemasukan
                        </Link>
                        <Link
                            href="/admin/dashboard/profil-stan"
                            className="text-sm font-medium text-slate-600 hover:text-violet-700"
                        >
                            Profil Stan
                        </Link>
                        <Link
                            href="/admin/dashboard/diskon"
                            className="text-sm font-medium text-slate-600 hover:text-violet-700"
                        >
                            Tambah Diskon
                        </Link>
                        <Link
                            href="/admin/dashboard/menu-diskon"
                            className="text-sm font-medium text-slate-600 hover:text-violet-700"
                        >
                            Diskon
                        </Link>
                    </nav>

                    {/* Right Actions */}
                    <div className="ml-auto flex items-center gap-3">
                        <Link
                            href="/admin/dashboard/profil-stan"
                            className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 md:inline-flex"
                        >
                            Edit Profil
                        </Link>

                        <button
                            type="button"
                            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
                            onClick={() => alert("Nanti kita sambungkan ke fitur logout ya 🙂")}
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Mobile Menu (simple list) */}
                <div className="block border-t border-violet-100 bg-white md:hidden">
                    <div className="mx-auto max-w-6xl px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                            <Link
                                href="/admin/dashboard/data-siswa"
                                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                            >
                                Data Siswa
                            </Link>
                            <Link
                                href="/admin/dashboard/menu"
                                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                            >
                                Makanan & Minuman
                            </Link>
                            <Link
                                href="/admin/dashboard/order"
                                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                            >
                                Order
                            </Link>

                            <Link
                                href="/admin/dashboard/rekap-pemesanan"
                                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                            >
                                Rekap Pemesanan
                            </Link>
                            <Link
                                href="/admin/dashboard/rekap-pemasukan"
                                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                            >
                                Rekap Pemasukan
                            </Link>
                            <Link
                                href="/admin/dashboard/profil-stan"
                                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                            >
                                Profil Stan
                            </Link>
                            <Link
                                href="/admin/dashboard/diskon"
                                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                            >
                                Tambah Diskon
                            </Link>
                            <Link
                                href="/admin/dashboard/menu-diskon"
                                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                            >
                                Diskon
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        </div>
    );
}
