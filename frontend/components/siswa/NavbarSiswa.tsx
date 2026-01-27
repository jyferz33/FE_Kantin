// components/siswa/NavbarSiswa.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutRole } from "@/lib/auth";

const SIDEBAR_W = 280;

function cn(...s: (string | false | null | undefined)[]) {
  return s.filter(Boolean).join(" ");
}

export default function NavbarSiswa() {
  const pathname = usePathname();
  const router = useRouter();

  const menus = [
    { label: "Dashboard", href: "/siswa/dashboard", exact: true },
    { label: "Menu", href: "/siswa/dashboard/menu" },
    { label: "Diskon", href: "/siswa/dashboard/diskon" },
    { label: "Pesanan Saya", href: "/siswa/dashboard/pesanan" },
    { label: "Histori", href: "/siswa/dashboard/histori" },
    { label: "Profil", href: "/siswa/dashboard/profil" },
  ];

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside
      className="fixed left-0 top-0 z-40 h-screen border-r border-slate-200 bg-white"
      style={{ width: SIDEBAR_W }}
    >
      <div className="flex h-full flex-col px-5 py-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <span className="h-3 w-3 rounded-sm bg-purple-600" />
          <div className="leading-tight">
            <div className="text-sm font-extrabold text-slate-900">KantinKu</div>
            <div className="text-xs text-slate-500">Dashboard Siswa</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="mt-6 flex-1 space-y-1">
          {menus.map((m) => {
            const active = isActive(m.href, (m as any).exact);
            return (
              <Link
                key={m.href}
                href={m.href}
                className={cn(
                  "flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition",
                  active ? "bg-purple-600 text-white" : "text-slate-700 hover:bg-purple-50"
                )}
              >
                <span>{m.label}</span>
                <span className={cn("text-xs", active ? "text-white/90" : "text-slate-400")}>
                  →
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <button
          type="button"
          onClick={() => {
            logoutRole("siswa");
            router.push("/siswa/login");
          }}
          className="rounded-2xl bg-purple-600 px-4 py-3 text-sm font-extrabold text-white hover:bg-purple-700"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
