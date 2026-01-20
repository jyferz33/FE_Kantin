// lib/cart.ts
export type CartItem = {
  id_menu: number;
  nama_makanan: string;
  harga: number;
  qty: number;
  fotoUrl?: string;
  stanName?: string;
  raw?: any;
};

const KEY = "siswa_cart";

export function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function clearCart() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
