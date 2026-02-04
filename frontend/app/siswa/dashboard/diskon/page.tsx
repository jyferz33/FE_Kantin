"use client";

import { useEffect, useMemo, useState } from "react";
import { getRoleToken } from "@/lib/auth";
import { useCart } from "@/components/siswa/cart-provider";

type MenuDiskonItem = {
  id: number;
  id_menu: number;
  id_diskon: number;

  nama_makanan: string;
  harga: number;
  jenis: string;
  foto: string | null;
  deskripsi?: string | null;
  id_stan?: number;

  // injected dari parent diskon
  nama_diskon?: string;
  persentase_diskon?: number;
  tanggal_awal?: string;
  tanggal_akhir?: string;

  [key: string]: any;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "https://ukk-p2.smktelkom-mlg.sch.id/api/";
const MAKER_ID = process.env.NEXT_PUBLIC_MAKER_ID ?? "1";

function joinUrl(base: string, path: string) {
  return `${base.replace(/\/+$/, "/")}${path.replace(/^\/+/, "")}`;
}

async function safeJson(text: string) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function formatRupiah(value: string | number | undefined) {
  const n = Number(value ?? 0);
  if (Number.isNaN(n)) return String(value ?? "");
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

// ✅ hitung harga setelah diskon (backend tidak mengembalikan)
function hargaSetelahDiskon(harga: number, persen?: number | null) {
  const p = Number(persen ?? 0);
  if (!p || Number.isNaN(p)) return harga;
  return Math.round(harga - harga * (p / 100));
}

function getFotoUrl(foto: string | null | undefined) {
  if (!foto) return "";
  if (foto.startsWith("http")) return foto;

  // ✅ encodeURI wajib karena filename bisa ada spasi
  const origin = "https://ukk-p2.smktelkom-mlg.sch.id/";
  return origin + encodeURI(String(foto).replace(/^\/+/, ""));
}

async function postMenuDiskon(search: string) {
  const token = getRoleToken("siswa");
  if (!token) throw new Error("Token siswa tidak ada. Login siswa dulu.");

  const fd = new FormData();
  fd.append("search", search ?? "");

  const res = await fetch(joinUrl(API_BASE, "getmenudiskonsiswa"), {
    method: "POST",
    headers: {
      makerID: MAKER_ID,
      Authorization: `Bearer ${token}`,
    } as any,
    body: fd,
  });

  const raw = await res.text();
  const data: any = await safeJson(raw);

  if (!res.ok) {
    throw new Error(data?.message || data?.msg || raw || `HTTP ${res.status}`);
  }

  // ✅ ini adalah list DISKON, bukan list menu
  const diskonList = Array.isArray(data?.data) ? data.data : [];

  return diskonList;
}

export default function MenuDiskonSiswaPage() {
  const { addItem, open: openCart, totalQty } = useCart();

  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<MenuDiskonItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load(keyword = "") {
    setLoading(true);
    setError("");

    try {
      const diskonList = await postMenuDiskon(keyword);

      /**
       * ✅ FLATTEN:
       * diskon[] -> menu_diskon[]
       * agar foto/harga muncul karena foto ada di menu_diskon
       */
      const flattened: MenuDiskonItem[] = diskonList.flatMap((diskon: any) =>
        (diskon.menu_diskon ?? []).map((menu: any) => ({
          ...menu,

          // inject data diskon
          nama_diskon: diskon.nama_diskon,
          persentase_diskon: diskon.persentase_diskon,
          tanggal_awal: diskon.tanggal_awal,
          tanggal_akhir: diskon.tanggal_akhir,

          // pastikan field wajib ada
          id: Number(menu.id ?? menu.id_menu ?? 0),
          id_menu: Number(menu.id_menu ?? menu.id ?? 0),
          id_diskon: Number(menu.id_diskon ?? diskon.id ?? 0),
          harga: Number(menu.harga ?? 0),
          nama_makanan: String(menu.nama_makanan ?? "Menu"),
          jenis: String(menu.jenis ?? "-"),
          foto: menu.foto ?? null,
        }))
      );

      // ✅ hilangkan duplikat (kadang backend ngirim dobel)
      const uniqMap = new Map<string, MenuDiskonItem>();
      for (const it of flattened) {
        const key = `${it.id_diskon}-${it.id_menu}`;
        if (!uniqMap.has(key)) uniqMap.set(key, it);
      }

      setRows(Array.from(uniqMap.values()));
    } catch (e: any) {
      setRows([]);
      setError(e?.message || "Gagal memuat menu diskon.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalShown = useMemo(() => rows.length, [rows]);

  function handlePesan(menu: MenuDiskonItem) {
    const hargaDiskon = hargaSetelahDiskon(menu.harga, menu.persentase_diskon);

    addItem(
      {
        id_menu: menu.id_menu,
        nama_makanan: menu.nama_makanan,
        harga: hargaDiskon, // ✅ masukkan harga diskon ke cart
        fotoUrl: getFotoUrl(menu.foto) || undefined,
        stanName: `Diskon: ${menu.nama_diskon ?? "-"}`,
        raw: menu,
      },
      1
    );

    openCart();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-extrabold text-slate-900">Menu Diskon</h1>
        <p className="mt-1 text-sm text-slate-500">
          Menu promo dari diskon admin. Klik Pesan untuk masuk keranjang.
        </p>

        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Cart */}
          <button
            type="button"
            onClick={openCart}
            className="w-fit rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Keranjang ({totalQty})
          </button>

          {/* Search */}
          <div className="flex w-full gap-2 lg:w-auto">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") load(search);
              }}
              placeholder='Cari menu diskon (contoh: "rica")...'
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 lg:w-72"
            />
            <button
              type="button"
              onClick={() => load(search)}
              className="rounded-2xl bg-purple-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-purple-700"
            >
              Cari
            </button>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                load("");
              }}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="mt-3 text-xs text-slate-500">
          {loading ? "Memuat..." : `Total: ${totalShown} item`}
        </div>
      </div>

      {/* Error */}
      {error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          <div className="font-extrabold">Gagal memuat menu diskon</div>
          <div className="mt-1 whitespace-pre-wrap">{error}</div>
          <button
            type="button"
            onClick={() => load(search)}
            className="mt-3 rounded-2xl bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-700"
          >
            Coba Lagi
          </button>
        </div>
      ) : null}

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500 sm:col-span-2 lg:col-span-3">
            Memuat menu diskon...
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500 sm:col-span-2 lg:col-span-3">
            Tidak ada menu diskon.
          </div>
        ) : (
          rows.map((it) => {
            const fotoUrl = getFotoUrl(it.foto);
            const persen = Number(it.persentase_diskon ?? 0);
            const hargaDiskon = hargaSetelahDiskon(it.harga, persen);

            return (
              <div
                key={`${it.id_diskon}-${it.id_menu}`}
                className="relative rounded-3xl border border-slate-200 bg-white p-5 transition hover:border-purple-300 hover:shadow-md"
              >
                {/* Badge */}
                <div className="absolute right-4 top-4 rounded-full bg-purple-600 px-3 py-1 text-xs font-extrabold text-white">
                  {persen}% OFF
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-extrabold text-slate-900">
                      {it.nama_makanan}
                    </div>
                    <div className="mt-1 truncate text-xs text-slate-500">
                      Diskon:{" "}
                      <span className="font-bold text-purple-700">
                        {it.nama_diskon ?? "-"}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 rounded-full px-3 py-1 text-xs font-bold text-purple-700">
                    {formatRupiah(hargaDiskon)}
                  </div>
                </div>

                {/* Harga asli */}
                <div className="mt-2 text-xs text-slate-500">
                  Harga asli:{" "}
                  <span className="font-semibold line-through">
                    {formatRupiah(it.harga)}
                  </span>
                </div>

                {/* Foto */}
                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                  {fotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={fotoUrl}
                      alt={it.nama_makanan}
                      className="h-36 w-full object-cover"
                      onError={(e) => {
                        // fallback jika link foto error
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-36 items-center justify-center text-xs text-slate-400">
                      Tidak ada foto
                    </div>
                  )}
                </div>

                {/* Desc */}
                <div className="mt-3 text-sm text-slate-600">
                  <div className="line-clamp-2">{it.deskripsi ?? "—"}</div>
                </div>

                <button
                  type="button"
                  onClick={() => handlePesan(it)}
                  className="mt-4 w-full rounded-2xl bg-purple-600 px-4 py-3 text-sm font-extrabold text-white hover:bg-purple-700"
                >
                  Pesan
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}