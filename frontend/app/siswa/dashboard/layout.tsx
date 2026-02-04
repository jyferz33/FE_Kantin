// app/siswa/dashboard/layout.tsx
import type { ReactNode } from "react";
import { CartProvider } from "@/components/siswa/cart-provider";
import CartDrawer from "@/components/siswa/cart-drawer";
import NavbarSiswa, { SIDEBAR_W } from "@/components/siswa/NavbarSiswa";
import HeaderSiswa from "@/components/siswa/HeaderSiswa";
import { QueryProvider } from "@/components/providers/query-provider";

export default function DashboardSiswaLayout({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
    <CartProvider>
      <div className="min-h-screen bg-slate-50">
        <NavbarSiswa />

        {/* Area kanan */}
        <div style={{ paddingLeft: SIDEBAR_W }}>
          <HeaderSiswa />
          <main className="p-6">{children}</main>
        </div>

        <CartDrawer />
      </div>
    </CartProvider>
    
    </QueryProvider>
  );
}
