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
    {
      label: "Dashboard",
      href: "/siswa/dashboard",
      img: "/image/home.png",
      exact: true,
    },
    {
      label: "Menu",
      href: "/siswa/dashboard/menu",
      img: "/image/foodlogo.png",
    },
    {
      label: "Diskon",
      href: "/siswa/dashboard/diskon",
      img: "/image/diskonlogo.png",
    },
    {
      label: "Pesanan Saya",
      href: "/siswa/dashboard/pesanan",
      img: "/image/receipt.png",
    },
    {
      label: "Histori",
      href: "/siswa/dashboard/histori",
      img: "/image/historilogo.png",
    },
    {
      label: "Profil",
      href: "/siswa/dashboard/profil",
      img: "/image/profillogo.png",
    },
  ];

  const isActive = (item: MenuItem) => {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  return (
    <aside
      className="fixed left-0 top-0 z-40 h-screen text-white bg-purple-700 border-r border-white/10"
      style={{ width: SIDEBAR_W }}
    >
      <div className="flex h-full flex-col px-3 py-10">
        {/* BRAND */}
        <div className="flex flex-col items-center gap-2">
          <div className="h-20 w-full flex items-center justify-center">
            <img
              src="/image/logokantin.png"
              alt="KantinKu"
              className="h-82 w-100 object-contain"
            />
          </div>
        </div>
        <hr className="border-t-3 border-gray-200 my-4"></hr>
        <br></br>


        {/* MENU */}
        <nav className="mt-7 flex-1 space-y-3">
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
                    ? "bg-white/15 ring-1 ring-white/25"
                    : "hover:bg-white/10"
                )}
              >

                

                {/* IMAGE */}
                {/* ICON */}
                <div className="h-10 w-10 shrink-0 rounded-2xl bg-white/10 flex items-center justify-center">
                  <img
                    src={m.img}
                    alt={m.label}
                    className="h-6 w-6 object-contain"
                  />
                </div>

                {/* TEXT */}
                <span className="text-sm font-semibold leading-none">
                  {m.label}
                </span>

              </Link>
            );
          })}
        </nav>

        {/* LOGOUT */}
        <div className="pt-3">
          <button
            onClick={() => {
              logoutRole("siswa");
              router.push("/siswa/login");
            }}
            className="w-full rounded-3xl px-4 py-3 text-[13px] font-bold bg-white/15 hover:bg-white/25 transition"
          >
            Logout
          </button>

          <div className="mt-3 text-center text-[10px] text-white/60">
            © KantinKu
          </div>
        </div>
      </div>
    </aside>
  );
}
