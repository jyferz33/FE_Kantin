// app/siswa/dashboard/layout.tsx
import type { ReactNode } from "react";
import { CartProvider } from "@/components/siswa/cart-provider";
import CartDrawer from "@/components/siswa/cart-drawer";
import NavbarSiswa from "@/components/siswa/NavbarSiswa";
import HeaderSiswa from "@/components/siswa/HeaderSiswa";

const SIDEBAR_W = 280;

export default function DashboardSiswaLayout({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-slate-50">
        {/* Sidebar fixed nempel kiri */}
        <NavbarSiswa />

        {/* Area kanan */}
        <div style={{ paddingLeft: SIDEBAR_W }}>
          <HeaderSiswa />
          <main className="p-6">{children}</main>
        </div>

        {/* Drawer global */}
        <CartDrawer />
      </div>
    </CartProvider>
  );
}
