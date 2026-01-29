"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/components/siswa/cart-provider";
import { checkoutCart } from "@/lib/order";
import { useState } from "react";

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

function initials(text?: string) {
  const s = (text || "").trim();
  if (!s) return "—";
  const parts = s.split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] || "";
  const b = parts[1]?.[0] || "";
  return (a + b).toUpperCase() || "—";
}

export default function CartDrawer() {
  const router = useRouter();
  const { isOpen, close, items, inc, dec, remove, reset, totalPrice } = useCart();
  const [loading, setLoading] = useState(false);

  async function onCheckout() {
    if (items.length === 0) return;

    setLoading(true);
    try {
      await checkoutCart(items);
      reset();
      close();
      alert("Pesanan tersimpan (demo). Menunggu API backend.");
      router.push("/siswa/dashboard/pesanan");
    } catch (e: any) {
      alert(e?.message ?? "Checkout gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={[
          "fixed inset-0 z-40 bg-black/30 transition-opacity",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
        onClick={close}
      />

      {/* Drawer */}
      <aside
        className={[
          "fixed right-0 top-0 z-50 h-screen w-full max-w-md bg-white shadow-2xl transition-transform",
          isOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
        role="dialog"
        aria-label="Keranjang"
      >
        {/* ✅ Layout utama: header sticky, list scroll, footer sticky */}
        <div className="flex h-full flex-col">
          {/* Header (sticky) */}
          <div className="sticky top-0 z-10 border-b border-slate-100 bg-white px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-extrabold text-slate-900">Pesanan / Keranjang</div>
                <div className="text-xs text-slate-500">Tambah jumlah lalu checkout</div>
              </div>

              <button
                onClick={close}
                className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Tutup
              </button>
            </div>
          </div>

          {/* List (scroll hanya di sini) */}
          <div className="flex-1 overflow-y-auto p-5">
            {items.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                Keranjang kosong. Klik “Pesan” pada menu untuk menambah.
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((it) => (
                  <div
                    key={it.id_menu}
                    className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-purple-300 hover:shadow-sm"
                  >
                    <div className="flex gap-3">
                      {/* Foto */}
                      <div className="relative grid h-12 w-12 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-purple-50">
                        {it.fotoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={it.fotoUrl}
                            alt="foto"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="text-xs font-extrabold text-purple-700">
                            {initials(it.nama_makanan)}
                          </div>
                        )}
                      </div>


                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-extrabold text-slate-900">
                          {it.nama_makanan}
                        </div>
                        <div className="truncate text-xs text-slate-500">{it.stanName ?? "—"}</div>
                        <div className="mt-1 text-sm font-bold text-slate-900">
                          {formatRupiah(Number(it.harga))}
                        </div>
                      </div>

                      <button
                        onClick={() => remove(it.id_menu)}
                        className="h-fit rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-100"
                      >
                        Hapus
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => dec(it.id_menu)}
                          className="h-9 w-9 rounded-xl border border-slate-200 bg-white text-lg font-extrabold text-slate-700 hover:bg-slate-50"
                        >
                          −
                        </button>

                        <div className="w-10 text-center text-sm font-extrabold text-slate-900">
                          {it.qty}
                        </div>

                        <button
                          onClick={() => inc(it.id_menu)}
                          className="h-9 w-9 rounded-xl border border-slate-200 bg-white text-lg font-extrabold text-slate-700 hover:bg-slate-50"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-sm font-extrabold text-slate-900">
                        {formatRupiah(Number(it.harga) * it.qty)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer (nempel bawah) */}
          <div className="border-t border-slate-100 bg-white px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500">Total</div>
              <div className="text-lg font-extrabold text-slate-900">{formatRupiah(totalPrice)}</div>
            </div>

            <button
              disabled={loading || items.length === 0}
              onClick={onCheckout}
              className="mt-3 w-full rounded-2xl bg-purple-600 px-5 py-3 text-sm font-extrabold text-white hover:bg-purple-700 disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Checkout"}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
