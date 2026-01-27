// app/siswa/dashboard/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getRoleToken } from "@/lib/auth";
import { useCart } from "@/components/siswa/cart-provider";

type MenuItem = {
  id_menu?: number;
  id?: number;
  nama_makanan?: string;
  harga?: string | number;
  deskripsi?: string;
  foto?: string;
  gambar?: string;
  image?: string;

  nama_stan?: string;
  nama_kantin?: string;
  stan?: string;
  nama_pemilik?: string;

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
  return Number(item.id_menu ?? item.id ?? item.ID ?? item.Id ?? 0);
}

function pickStanName(item: MenuItem) {
  return (
    item.nama_stan ||
    item.nama_kantin ||
    item.stan ||
    item.nama_pemilik ||
    item?.stan_name ||
    item?.kantin ||
    "-"
  );
}

function getFotoUrl(item: MenuItem) {
  const url = item.foto || item.gambar || item.image;
  if (!url) return "";
  if (typeof url === "string" && url.startsWith("http")) return url;
  const origin = "https://ukk-p2.smktelkom-mlg.sch.id/";
  return origin + String(url).replace(/^\/+/, "");
}

async function postMenuSiswa(path: string, search: string) {
  const token = getRoleToken("siswa");
  if (!token) throw new Error("Token siswa tidak ada. Login siswa dulu.");

  const fd = new FormData();
  fd.append("search", search);

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

  if (!res.ok) throw new Error(data?.message || data?.msg || `HTTP ${res.status}`);

  const list =
    Array.isArray(data) ? data :
    Array.isArray(data?.data) ? data.data :
    Array.isArray(data?.menu) ? data.menu :
    Array.isArray(data?.result) ? data.result :
    Array.isArray(data?.items) ? data.items :
    [];

  return Array.isArray(list) ? (list as MenuItem[]) : [];
}

export default function DashboardSiswaPage() {
  const { addItem } = useCart();

  const [rows, setRows] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      // Dashboard: tampilkan makanan dulu (paling umum)
      const list = await postMenuSiswa("getmenufood", "");
      setRows(list);
    } catch (e: any) {
      setRows([]);
      setErr(e?.message || "Gagal memuat menu.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const featured = useMemo(() => rows.slice(0, 9), [rows]);

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
      } as any,
      1
    );
  }

  return (
    <div className="space-y-6">
      {/* HERO */}
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="inline-flex rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
            KantinKu • Siswa
          </div>

          <h1 className="mt-3 text-3xl font-extrabold text-slate-900">
            Selamat datang di <span className="text-purple-600">KantinKu</span> 👋
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Pilih menu favoritmu, tambah ke keranjang, lalu checkout. Keranjang akan muncul di kanan (drawer) kapan pun.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/siswa/dashboard/menu"
              className="rounded-2xl bg-purple-600 px-5 py-3 text-sm font-extrabold text-white hover:bg-purple-700"
            >
              Lihat Menu (View All)
            </Link>
            <Link
              href="/siswa/dashboard/diskon"
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-700 hover:bg-slate-50"
            >
              Lihat Diskon
            </Link>
          </div>
        </div>

        {/* Banner placeholder (kamu mau ganti gambar sendiri nanti) */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex h-full min-h-[170px] items-center justify-center rounded-2xl bg-slate-50 text-center">
            <div>
              <div className="text-sm font-extrabold text-slate-700">Tempat Banner Gambar</div>
              <div className="mt-1 text-xs text-slate-500">(Nanti kamu masukkan gambar sesuai keinginan)</div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: Menu grid (seperti gambar 2) */}
      <div className="rounded-3xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <div className="text-base font-extrabold text-slate-900">Menu Populer</div>
            <div className="text-xs text-slate-500">Ambil dari backend (makanan)</div>
          </div>

          <Link
            href="/siswa/dashboard/menu"
            className="text-sm font-bold text-purple-700 hover:underline"
          >
            View all
          </Link>
        </div>

        {err ? (
          <div className="px-6 py-6 text-sm text-rose-700">
            {err}
            <button
              onClick={load}
              className="ml-3 rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-700"
            >
              Coba Lagi
            </button>
          </div>
        ) : null}

        <div className="p-6">
          {loading ? (
            <div className="text-sm text-slate-500">Memuat menu...</div>
          ) : featured.length === 0 ? (
            <div className="text-sm text-slate-500">Belum ada menu untuk ditampilkan.</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((it, idx) => {
                const id = getId(it) || idx;
                const fotoUrl = getFotoUrl(it);
                const stan = pickStanName(it);

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
                        <div className="mt-1 truncate text-xs text-slate-500">
                          {stan}
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
                          className="h-40 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-40 items-center justify-center text-xs text-slate-400">
                          Tidak ada foto
                        </div>
                      )}
                    </div>

                    <div className="mt-3 line-clamp-2 text-sm text-slate-600">
                      {it.deskripsi ?? "—"}
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
              })}
            </div>
          )}
        </div>
      </div>

      {/* Optional: shortcut card kecil bawah (kalau mau) */}
      <div className="rounded-3xl border border-purple-100 bg-purple-50 px-6 py-4 text-sm text-purple-700">
        Sidebar akan tetap muncul di semua halaman, dan keranjang tetap ada sampai checkout.
      </div>
    </div>
  );
}
