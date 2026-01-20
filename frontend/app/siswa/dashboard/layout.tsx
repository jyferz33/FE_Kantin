import type { ReactNode } from "react";
import SiswaDashboardShell from "@/components/siswaDashboardShell";
import { CartProvider } from "@/components/siswa/cart-provider";
import CartDrawer from "@/components/siswa/cart-drawer";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <SiswaDashboardShell>{children}</SiswaDashboardShell>
      <CartDrawer />
    </CartProvider>
  );
}
