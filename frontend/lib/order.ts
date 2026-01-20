import { getRoleToken } from "@/lib/auth";

export type CartItem = {
  id_menu: number;
  nama_makanan: string;
  harga: number;
  qty: number;
  raw?: any;
};

function pickStanId(item: CartItem): number {
  const r = item.raw ?? {};
  const candidates = [
    r.id_stan,
    r.idStan,
    r.id_stand,
    r.id_maker,
    r.maker_id,
    r.stan_id,
    r.id_kantin,
    r.id_penjual,
  ];

  const found = candidates.find((v) => v !== undefined && v !== null && String(v).trim() !== "");
  const n = Number(found);

  if (!Number.isFinite(n) || n <= 0) {
    console.log("RAW MENU (cek id_stan):", r);
    throw new Error(`id_stan tidak ditemukan untuk menu: ${item.nama_makanan}`);
  }
  return n;
}

export async function checkoutCart(items: CartItem[]) {
  const token = getRoleToken("siswa");
  if (!token) throw new Error("Token siswa tidak ada. Login siswa dulu.");
  if (!items.length) throw new Error("Keranjang kosong.");

  // group per stan
  const grouped: Record<number, { id_menu: number; qty: number }[]> = {};
  for (const it of items) {
    const id_stan = pickStanId(it);
    grouped[id_stan] ||= [];
    grouped[id_stan].push({ id_menu: it.id_menu, qty: it.qty });
  }

  // kirim per stan via PROXY Next.js
  for (const idStanStr of Object.keys(grouped)) {
    const id_stan = Number(idStanStr);

    const payload = {
      id_stan,
      pesan: grouped[id_stan],
    };

    const res = await fetch("/api/pesan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        makerID: 1,
        payload,
      }),
    });

    const data = await res.json().catch(() => ({} as any));
    if (!res.ok || !data?.ok) {
      throw new Error(data?.message || "Gagal membuat pesanan (proxy).");
    }
  }

  return true;
}
