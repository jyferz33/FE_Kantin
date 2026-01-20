"use client";

import { useEffect, useMemo, useState } from "react";
import { getRoleToken } from "@/lib/auth";
import { useCart } from "@/components/siswa/cart-provider";

type MenuItem = {
  id_menu?: number;
  id?: number;
  ID?: number;
  Id?: number;

  nama_makanan?: string;
  jenis?: string;
  harga?: string | number;
  deskripsi?: string;

  foto?: string;
  gambar?: string;
  image?: string;

  nama_stan?: string;
  nama_kantin?: string;
  stan?: string;
  nama_pemilik?: string;
  stan_name?: string;
  kantin?: string;

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

function getId(item: MenuItem) {
  const id = item.id_menu ?? item.id ?? item.ID ?? item.Id ?? 0;
  return Number(id || 0);
}

function pickStanName(item: MenuItem) {
  return (
    item.nama_stan ||
    item.nama_kantin ||
    item.stan ||
    item.nama_pemilik ||
    item.stan_name ||
    item.kantin ||
    "-"
  );
}

function getFotoUrl(item: MenuItem) {
  const url = item.foto || item.gambar || item.image;
  if (!url) return "";

  // kalau sudah absolute
  if (typeof url === "string" && url.startsWith("http")) return url;

  // backend UKK biasanya simpan path relatif dari domain root
  const origin = "https://ukk-p2.smktelkom-mlg.sch.id/";
  return origin + String(url).replace(/^\/+/, "");
}

function pickList(data: any): MenuItem[] {
  const list =
    Array.isArray(data) ? data :
    Array.isArray(data?.data) ? data.data :
    Array.isArray(data?.menu) ? data.menu :
    Array.isArray(data?.result) ? data.result :
    Array.isArray(data?.items) ? data.items :
    Array.isArray(data?.payload) ? data.payload :
    [];

  return Array.isArray(list) ? (list as MenuItem[]) : [];
}

async function postMenuSiswa(path: string, search: string) {
  const token = getRoleToken("siswa");
  if (!token) throw new Error("Token siswa tidak ada. Login siswa dulu.");

  const fd = new FormData();
  fd.append("search", search ?? "");

  const res = await fetch(joinUrl(API_BASE, path), {
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
    // backend kamu kadang errornya bukan message/msg, jadi fallback raw
    throw new Error(data?.message || data?.msg || raw || `HTTP ${res.status}`);
  }

  return pickList(data);
}

export default function MenuSiswaPage() {
  const { addItem, open: openCart, totalQty } = useCart();

  const [tab, setTab] = useState<"makanan" | "minuman">("makanan");
  const [search, setSearch] = useState("");

  const [rows, setRows] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load(keyword = "") {
    setLoading(true);
    setError("");

    try {
      const path = tab === "makanan" ? "getmenufood" : "getmenudrink";
      const list = await postMenuSiswa(path, keyword);
      setRows(list);
    } catch (e: any) {
      setRows([]);
      setError(e?.message || "Gagal memuat menu.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const totalShown = useMemo(() => rows.length, [rows]);

  function handlePesan(menu: MenuItem) {
    const id = getId(menu);
    if (!id) return;

    const hargaNum = Number(menu.harga ?? 0);

    addItem(
      {
        id_menu: id,
        nama_makanan: String(menu.nama_makanan ?? "Menu"),
        harga: Number.isNaN(hargaNum) ? 0 : hargaNum,
        fotoUrl: getFotoUrl(menu) || undefined,
        stanName: pickStanName(menu),
        raw: menu,
      },
      1
    );

    // supaya pasti muncul drawer walau addItem kamu tidak auto-open
    openCart();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-extrabold text-slate-900">Menu</h1>
        <p className="mt-1 text-sm text-slate-500">
          Pilih menu, lalu checkout lewat popup keranjang.
        </p>

        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTab("makanan")}
              className={[
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                tab === "makanan"
                  ? "bg-purple-600 text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-purple-50",
              ].join(" ")}
            >
              Makanan
            </button>

            <button
              type="button"
              onClick={() => setTab("minuman")}
              className={[
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                tab === "minuman"
                  ? "bg-purple-600 text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-purple-50",
              ].join(" ")}
            >
              Minuman
            </button>

            {/* Cart button */}
            <button
              type="button"
              onClick={openCart}
              className="ml-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Keranjang ({totalQty})
            </button>
          </div>

          {/* Search */}
          <div className="flex w-full gap-2 lg:w-auto">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") load(search);
              }}
              placeholder='Cari menu (contoh: "rujak")...'
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
          <div className="font-extrabold">Gagal memuat menu</div>
          <div className="mt-1">{error}</div>
          <button
            type="button"
            onClick={() => load(search)}
            className="mt-3 rounded-2xl bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700"
          >
            Coba Lagi
          </button>
        </div>
      ) : null}

      {/* Grid Menu */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500 sm:col-span-2 lg:col-span-3">
            Memuat menu...
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500 sm:col-span-2 lg:col-span-3">
            Tidak ada menu untuk tab <b>{tab}</b>.
          </div>
        ) : (
          rows.map((it, idx) => {
            const id = getId(it) || idx;
            const fotoUrl = getFotoUrl(it);
            const stanName = pickStanName(it);

            return (
              <div
                key={id}
                className="rounded-3xl border border-slate-200 bg-white p-5 transition hover:border-purple-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-extrabold text-slate-900">
                      {it.nama_makanan ?? "-"}
                    </div>
                    <div className="mt-1 truncate text-sm text-slate-600">
                      Dari: <span className="font-semibold">{stanName}</span>
                    </div>
                  </div>
                  <div className="shrink-0 rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
                    {formatRupiah(it.harga)}
                  </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                  {fotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={fotoUrl}
                      alt={it.nama_makanan ?? "foto"}
                      className="h-36 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-36 items-center justify-center text-xs text-slate-400">
                      Tidak ada foto
                    </div>
                  )}
                </div>

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
