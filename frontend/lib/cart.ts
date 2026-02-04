// lib/cart.ts
export type CartItem = {
  id_menu: number;
  nama_makanan: string;
  harga: number;
  qty: number;
  deskripsi?: string; // ✅ TAMBAH INI
  fotoUrl?: string;
  stanName?: string;
  raw?: any;
};

const LS_KEY = "siswa_cart";

export function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(items));
}

export function clearCart() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LS_KEY);
}
