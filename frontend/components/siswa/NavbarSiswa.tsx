"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutRole } from "@/lib/auth";

export const SIDEBAR_W = 240;

type MenuItem = {
  label: string;
  href: string;
  img: string; // path dari /public/image
  exact?: boolean;
};

function cn(...s: (string | false | null | undefined)[]) {
  return s.filter(Boolean).join(" ");
}

export default function NavbarSiswa() {
  const pathname = usePathname();
  const router = useRouter();

  const menus: MenuItem[] = [
    { label: "Dashboard", href: "/siswa/dashboard", img: "/image/home.png", exact: true },
    { label: "Menu", href: "/siswa/dashboard/menu", img: "/image/foodlogo.png" },
    { label: "Diskon", href: "/siswa/dashboard/diskon", img: "/image/diskonlogo.png" },
    { label: "Pesanan Saya", href: "/siswa/dashboard/pesanan", img: "/image/receipt.png" },
    { label: "Histori", href: "/siswa/dashboard/histori", img: "/image/historilogo.png" },
    { label: "Profil", href: "/siswa/dashboard/profil", img: "/image/profillogo.png" },
  ];

  const isActive = (item: MenuItem) => {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen text-white",
        "border-r border-white/10",
        "bg-linear-to-b from-purple-400 via-purple-500 to-purple-600"
      )}
      style={{ width: SIDEBAR_W }}
    >
      <div className="flex h-full flex-col px-3 py-8">
        {/* BRAND */}
        {/* BRAND */}
        <div className="relative h-32 flex items-center justify-center">
          {/* LOGO (bebas diatur ukurannya) */}
          <img
            src="/image/logokantin.png"
            alt="KantinKu"
            className="absolute h-46 w-auto object-contain drop-shadow-md"
          />

          {/* divider */}
          <div className="absolute bottom-0 h-px w-full  bg-white/50" />
        </div>


        {/* MENU */}
        <nav className="mt-6 flex-1 space-y-3">
          {menus.map((m) => {
            const active = isActive(m);

            return (
              <Link
                key={m.href}
                href={m.href}
                className={cn(
                  "group relative flex items-center gap-3",
                  "rounded-2xl px-4 py-3 transition-all",
                  active
                    ? "bg-white/18 ring-1 ring-white/25 shadow-sm"
                    : "hover:bg-white/12"
                )}
              >
                {/* ICON */}
                <div
                  className={cn(
                    "h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center transition",
                    active ? "bg-white/20" : "bg-white/10 group-hover:bg-white/15"
                  )}
                >
                  <img src={m.img} alt={m.label} className="h-6 w-6 object-contain" />
                </div>

                {/* TEXT */}
                <span className={cn("text-sm font-semibold leading-none", active ? "text-white" : "text-white/90")}>
                  {m.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* ✅ divider di atas logout */}
        <div className="my-4 h-px w-full bg-white/20" />

        {/* LOGOUT */}
        <div className="pt-1">
          <button
            onClick={() => {
              logoutRole("siswa");
              router.push("/siswa/login");
            }}
            className="w-full rounded-3xl px-4 py-3 text-[13px] font-bold bg-white/15 hover:bg-white/25 transition"
          >
            Logout
          </button>

          <div className="mt-3 text-center text-[10px] text-white/70">
            © KantinKu
          </div>
        </div>
      </div>
    </aside>
  );
}
