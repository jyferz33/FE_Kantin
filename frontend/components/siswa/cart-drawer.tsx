"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/siswa/cart-provider";
import { checkoutCart } from "@/lib/order"; // <-- kita pakai placeholder checkoutCart
import { useState } from "react";

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
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
          "fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-2xl transition-transform",
          isOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <div className="text-sm font-extrabold text-slate-900">Pesanan / Keranjang</div>
            <div className="text-xs text-slate-500">Tambah jumlah lalu checkout</div>
          </div>
          <button
            onClick={close}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Tutup
          </button>
        </div>

        <div className="h-[calc(100%-150px)] overflow-auto p-5">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Keranjang kosong. Klik “Pesan” pada menu untuk menambah.
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((it) => (
                <div key={it.id_menu} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                      {it.fotoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={it.fotoUrl} alt="foto" className="h-full w-full object-cover" />
                      ) : (
                        <Image src="/image/mage.png" alt="placeholder" fill className="object-contain p-2 opacity-40" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-extrabold text-slate-900">
                        {it.nama_makanan}
                      </div>
                      <div className="truncate text-xs text-slate-500">
                        {it.stanName ?? "—"}
                      </div>
                      <div className="mt-1 text-sm font-bold text-slate-900">
                        {formatRupiah(Number(it.harga))}
                      </div>
                    </div>

                    <button
                      onClick={() => remove(it.id_menu)}
                      className="h-fit rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100"
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

        <div className="border-t border-slate-100 px-5 py-4">
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
      </aside>
    </>
  );
}
