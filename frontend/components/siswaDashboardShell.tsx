"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { label: "Dashboard", href: "/siswa/dashboard" },
  { label: "Profile", href: "/siswa/dashboard/profile" },
  { label: "Menu", href: "/siswa/dashboard/menu" },
  { label: "Diskon", href: "/siswa/dashboard/diskon" },
  { label: "Pesanan Saya", href: "/siswa/dashboard/pesanan" },
  { label: "Histori", href: "/siswa/dashboard/histori" },
];

export default function SiswaDashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-white">
      {/* TOP BAR */}
      <header className="sticky top-0 z-40 border-b border-purple-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-purple-600" />
            <span className="text-lg font-extrabold text-purple-600">KantinKu</span>
            <span className="ml-2 rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
              Dashboard Siswa
            </span>
          </div>

          {/* placeholder kanan (nanti: nama siswa / logout) */}
          <div className="text-xs font-semibold text-slate-500">Siswa</div>
        </div>

        {/* NAV */}
        <nav className="border-t border-purple-100">
          <div className="mx-auto w-full max-w-6xl overflow-x-auto px-2">
            <div className="flex gap-2 py-2 whitespace-nowrap">
              {nav.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/siswa/dashboard" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "rounded-full px-4 py-2 text-sm font-semibold transition",
                      active
                        ? "bg-purple-600 text-white"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-purple-50 hover:text-purple-700",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </header>

      {/* CONTENT */}
      <section className="mx-auto w-full max-w-6xl px-4 py-8">{children}</section>
    </main>
  );
}
