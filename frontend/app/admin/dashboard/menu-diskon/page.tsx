"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getRoleSession } from "@/lib/auth";
import {
  ArrowLeft,
  BadgePercent,
  Search,
  RefreshCcw,
  UtensilsCrossed,
  CupSoda,
  Link2,
} from "lucide-react";

const BASE_URL = "https://ukk-p2.smktelkom-mlg.sch.id/api/";
const MAKER_ID = "1";

type MenuApiItem = {
  id: number | null; // bisa id relasi / atau null (tergantung endpoint)
  nama_makanan: string;
  harga: number;
  jenis: "makanan" | "minuman" | string;
  foto: string | null;
  deskripsi?: string | null;
  id_stan?: number | null;

  // ✅ ini yang dipakai buat attach
  id_menu: number;

  // kadang ada, kadang tidak (tergantung endpoint)
  nama_diskon: string | null;
  persentase_diskon: number | null;
  tanggal_awal: string | null;
  tanggal_akhir: string | null;
  id_diskon: number | null;
};

type DiskonWithMenu = {
  id: number;
  nama_diskon: string;
  persentase_diskon: number;
  tanggal_awal: string;
  tanggal_akhir: string;
  menu_diskon: MenuApiItem[];
};

type ApiRes<T> = {
  status: boolean;
  message: string;
  data: T;
};

function pickToken(session: any) {
  return (
    session?.token ??
    session?.access_token ??
    session?.data?.token ??
    session?.data?.access_token
  );
}

function imgUrl(path: string | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `https://ukk-p2.smktelkom-mlg.sch.id/${path}`;
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDateTime(s: string | null) {
  if (!s) return "—";
  const fixed = s.includes("T") ? s : s.replace(" ", "T");
  const d = new Date(fixed);
  if (Number.isNaN(d.getTime())) return s;
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

// ✅ hitung harga setelah diskon di frontend
function calcAfterDiscount(price: number, percent: number) {
  const p = Math.max(0, Math.min(100, Number(percent || 0)));
  const after = Math.round(price - price * (p / 100));
  const saved = Math.max(0, price - after);
  return { after, saved };
}

export default function DiskonMenuPage() {
  const session = useMemo(() => getRoleSession("stand"), []);
  const token = pickToken(session);

  const [err, setErr] = useState("");

  // ====== diskon list (dari getmenudiskon) ======
  const [diskonLoading, setDiskonLoading] = useState(false);
  const [diskonList, setDiskonList] = useState<DiskonWithMenu[]>([]);
  const [selectedDiskonId, setSelectedDiskonId] = useState<number | null>(null);

  const selectedDiskon = useMemo(
    () => diskonList.find((d) => d.id === selectedDiskonId) ?? null,
    [diskonList, selectedDiskonId]
  );

  // ====== search menu ======
  const [tab, setTab] = useState<"makanan" | "minuman">("makanan");
  const [search, setSearch] = useState("");
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuApiItem[]>([]);

  // add loading per item
  const [addingId, setAddingId] = useState<number | null>(null);

  async function loadDiskonWithMenu() {
    setErr("");
    if (!token) {
      setErr("Token admin/stan tidak ditemukan.");
      return;
    }

    setDiskonLoading(true);
    try {
      const fd = new FormData();
      fd.append("search", "");

      const res = await fetch(`${BASE_URL}getmenudiskon`, {
        method: "POST",
        headers: {
          makerID: MAKER_ID,
          Authorization: `Bearer ${token}`,
          token: token,
        },
        body: fd,
      });

      const data: ApiRes<DiskonWithMenu[]> | null = await res.json().catch(() => null);

      if (!res.ok || data?.status === false) {
        throw new Error(data?.message ?? `Gagal load diskon (HTTP ${res.status})`);
      }

      const arr = Array.isArray(data?.data) ? data!.data : [];

      // terbaru di atas
      arr.sort((a, b) => b.id - a.id);

      setDiskonList(arr);

      // auto pilih diskon pertama kalau belum ada pilihan
      if (!selectedDiskonId && arr.length > 0) setSelectedDiskonId(arr[0].id);

      // kalau diskon yg dipilih hilang, pindah ke pertama
      if (selectedDiskonId && !arr.some((x) => x.id === selectedDiskonId)) {
        setSelectedDiskonId(arr[0]?.id ?? null);
      }
    } catch (e: any) {
      console.error(e);
      setErr(e?.message ?? "Gagal load diskon.");
      setDiskonList([]);
    } finally {
      setDiskonLoading(false);
    }
  }

  async function searchMenu() {
    setErr("");
    if (!token) return setErr("Token admin/stan tidak ditemukan.");

    setMenuLoading(true);
    try {
      const fd = new FormData();
      fd.append("search", search ?? "");

      const endpoint = tab === "makanan" ? "getmenumakanan" : "getmenuminuman";

      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          makerID: MAKER_ID,
          Authorization: `Bearer ${token}`,
          token: token,
        },
        body: fd,
      });

      const data: ApiRes<MenuApiItem[]> | null = await res.json().catch(() => null);

      if (!res.ok || data?.status === false) {
        throw new Error(data?.message ?? `Gagal load menu (HTTP ${res.status})`);
      }

      const arr = Array.isArray(data?.data) ? data!.data : [];

      // yang belum diskon muncul dulu
      arr.sort((a, b) => Number(!!a.id_diskon) - Number(!!b.id_diskon));

      setMenuItems(arr);
    } catch (e: any) {
      console.error(e);
      setMenuItems([]);
      setErr(e?.message ?? "Gagal load menu.");
    } finally {
      setMenuLoading(false);
    }
  }

  // ✅ tambah menu diskon pakai endpoint yang benar: insert_menu_diskon
  async function attachMenuToDiskon(menu: MenuApiItem) {
    setErr("");
    if (!token) return setErr("Token admin/stan tidak ditemukan.");
    if (!selectedDiskonId) return setErr("Pilih diskon dulu.");

    const id_menu = Number(menu.id_menu);
    if (!id_menu) return setErr("ID menu tidak valid.");

    setAddingId(id_menu);
    try {
      const fd = new FormData();
      fd.append("id_diskon", String(selectedDiskonId));
      fd.append("id_menu", String(id_menu));

      const res = await fetch(`${BASE_URL}insert_menu_diskon`, {
        method: "POST",
        headers: {
          makerID: MAKER_ID,
          Authorization: `Bearer ${token}`,
          token: token,
        },
        body: fd,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || data?.status === false) {
        throw new Error(data?.message ?? `Gagal tambah menu diskon (HTTP ${res.status})`);
      }

      alert(data?.message ?? "Menu berhasil ditambahkan ke diskon ✅");

      // reload agar menu_diskon muncul di atas
      await loadDiskonWithMenu();

      // update list hasil search agar terlihat "sudah diskon"
      setMenuItems((prev) =>
        prev.map((x) =>
          x.id_menu === id_menu
            ? {
                ...x,
                id_diskon: selectedDiskonId,
                nama_diskon: selectedDiskon?.nama_diskon ?? x.nama_diskon,
                persentase_diskon: selectedDiskon?.persentase_diskon ?? x.persentase_diskon,
                tanggal_awal: selectedDiskon?.tanggal_awal ?? x.tanggal_awal,
                tanggal_akhir: selectedDiskon?.tanggal_akhir ?? x.tanggal_akhir,
              }
            : x
        )
      );
    } catch (e: any) {
      console.error(e);
      setErr(e?.message ?? "Gagal menambahkan menu ke diskon");
    } finally {
      setAddingId(null);
    }
  }

  useEffect(() => {
    loadDiskonWithMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="rounded-[2.25rem] bg-white px-7 py-6 shadow-2xl ring-1 ring-white/40">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Admin Panel</p>
            <h1 className="mt-1 text-2xl font-extrabold text-slate-900">Menu Diskon</h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Pilih diskon → cari menu → klik <b>Tambahkan</b>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/dashboard/diskon"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Link>

            <button
              onClick={loadDiskonWithMenu}
              disabled={diskonLoading}
              className="inline-flex items-center gap-2 rounded-2xl bg-red-500 px-4 py-2 text-sm font-extrabold text-white hover:bg-red-600 disabled:opacity-60"
            >
              <RefreshCcw className="h-4 w-4" />
              {diskonLoading ? "Loading..." : "Reload Diskon"}
            </button>
          </div>
        </div>

        {err ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {err}
          </div>
        ) : null}
      </div>

      {/* PILIH DISKON */}
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100">
            <BadgePercent className="h-5 w-5" />
          </div>
          <div>
            <div className="text-base font-extrabold text-slate-900">Pilih Diskon</div>
            <div className="text-xs font-semibold text-slate-500">
              Data dari <b>getmenudiskon</b>
            </div>
          </div>
        </div>

        {diskonList.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-600">
            Tidak ada diskon. Buat diskon dulu di halaman Diskon.
          </div>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="text-xs font-bold text-slate-500">Daftar Diskon</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {diskonList.map((d) => {
                  const active = d.id === selectedDiskonId;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setSelectedDiskonId(d.id)}
                      className={[
                        "rounded-full px-4 py-2 text-xs font-extrabold transition",
                        active
                          ? "bg-red-500 text-white"
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-red-50 hover:text-red-600",
                      ].join(" ")}
                    >
                      {d.nama_diskon} • {d.persentase_diskon}%
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="text-xs font-bold text-slate-500">Ringkasan</div>
              {selectedDiskon ? (
                <div className="mt-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                  <div className="text-base font-extrabold text-slate-900">
                    {selectedDiskon.nama_diskon}
                  </div>
                  <div className="mt-1 text-sm font-extrabold text-red-600">
                    {selectedDiskon.persentase_diskon}%
                  </div>
                  <div className="mt-2 text-xs font-semibold text-slate-600">
                    {formatDateTime(selectedDiskon.tanggal_awal)} →{" "}
                    {formatDateTime(selectedDiskon.tanggal_akhir)}
                  </div>

                  <div className="mt-3 rounded-2xl bg-white p-3 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                    Menu diskon terpasang:{" "}
                    <b>{selectedDiskon.menu_diskon?.length ?? 0}</b>
                  </div>
                </div>
              ) : (
                <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-600">
                  Pilih salah satu diskon.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MENU YANG SUDAH MASUK DISKON */}
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
        <div className="text-base font-extrabold text-slate-900">
          Menu yang Sudah Masuk Diskon
        </div>
        <div className="text-xs font-semibold text-slate-500">
          Data diambil dari <b>menu_diskon</b> pada diskon terpilih.
        </div>

        {!selectedDiskon ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-600">
            Pilih diskon dulu.
          </div>
        ) : (selectedDiskon.menu_diskon?.length ?? 0) === 0 ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-600">
            Belum ada menu yang masuk diskon ini.
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {selectedDiskon.menu_diskon.map((m, idx) => (
              <MenuCard
                key={`${m.id_menu}-${idx}`}
                item={m}
                diskonName={selectedDiskon.nama_diskon}
                diskonPercent={selectedDiskon.persentase_diskon}
              />
            ))}
          </div>
        )}
      </div>

      {/* SEARCH MENU */}
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-base font-extrabold text-slate-900">Cari Menu</div>
            <div className="text-xs font-semibold text-slate-500">
              Endpoint: <b>{tab === "makanan" ? "getmenumakanan" : "getmenuminuman"}</b>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setTab("makanan")}
              className={[
                "inline-flex h-11 items-center gap-2 rounded-2xl px-4 text-sm font-extrabold transition",
                tab === "makanan"
                  ? "bg-red-500 text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
              ].join(" ")}
            >
              <UtensilsCrossed className="h-4 w-4" />
              Makanan
            </button>

            <button
              type="button"
              onClick={() => setTab("minuman")}
              className={[
                "inline-flex h-11 items-center gap-2 rounded-2xl px-4 text-sm font-extrabold transition",
                tab === "minuman"
                  ? "bg-red-500 text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
              ].join(" ")}
            >
              <CupSoda className="h-4 w-4" />
              Minuman
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari menu..."
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none focus:border-red-300"
            />
          </div>

          <button
            onClick={searchMenu}
            disabled={menuLoading}
            className="h-11 rounded-2xl bg-red-500 px-5 text-sm font-extrabold text-white hover:bg-red-600 disabled:opacity-60"
          >
            {menuLoading ? "Loading..." : "Cari"}
          </button>
        </div>

        {menuLoading ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-600">
            Mengambil data menu...
          </div>
        ) : menuItems.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-600">
            Belum ada hasil. Ketik kata lalu klik Cari.
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {menuItems.map((m, idx) => {
              const already = !!m.id_diskon;
              const disabled = !selectedDiskonId;
              const isAdding = addingId === m.id_menu;

              const showName = m.nama_diskon ?? "—";
              const showPercent = m.persentase_diskon ?? 0;
              const { after, saved } = calcAfterDiscount(Number(m.harga || 0), Number(showPercent || 0));

              return (
                <div
                  key={`${m.id_menu}-${idx}`}
                  className="rounded-[1.75rem] border border-slate-200 bg-white p-4"
                >
                  <div className="flex gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-slate-50 ring-1 ring-slate-200">
                      {imgUrl(m.foto) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imgUrl(m.foto)!} alt="foto" className="h-full w-full object-cover" />
                      ) : (
                        <Image
                          src="/image/mage.png"
                          alt="placeholder"
                          fill
                          className="object-contain p-2 opacity-40"
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-extrabold text-slate-900">
                        {m.nama_makanan}
                      </div>
                      <div className="mt-1 text-xs font-semibold text-slate-500">
                        ID Menu: <b className="text-slate-700">{m.id_menu}</b>
                      </div>

                      <div className="mt-2 flex items-end justify-between gap-3">
                        <div>
                          <div className="text-[11px] font-bold text-slate-500">Harga</div>
                          <div className="text-sm font-extrabold text-slate-900">
                            {formatRupiah(Number(m.harga))}
                          </div>
                        </div>
                        {already ? (
                          <div className="text-right">
                            <div className="text-[11px] font-bold text-slate-500">Setelah Diskon</div>
                            <div className="text-sm font-extrabold text-red-600">
                              {formatRupiah(after)}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {already ? (
                    <div className="mt-3 rounded-2xl bg-amber-50 p-3 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                      Sudah punya diskon: <b>{showName}</b> ({showPercent}%)
                      {saved > 0 ? (
                        <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-[11px] font-extrabold text-amber-700 ring-1 ring-amber-200">
                          Hemat {formatRupiah(saved)}
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-xs font-semibold text-slate-600 ring-1 ring-slate-100">
                      Belum punya diskon.
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={disabled || isAdding}
                    onClick={() => attachMenuToDiskon(m)}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-extrabold text-white hover:bg-slate-800 disabled:opacity-60"
                  >
                    <Link2 className="h-4 w-4" />
                    {isAdding ? "Menambahkan..." : "Tambahkan ke Diskon Terpilih"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function MenuCard({
  item,
  diskonName,
  diskonPercent,
}: {
  item: MenuApiItem;
  diskonName: string;
  diskonPercent: number;
}) {
  const price = Number(item.harga || 0);
  const percent = Number(diskonPercent || 0);
  const { after, saved } = calcAfterDiscount(price, percent);

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4">
      <div className="flex gap-3">
        <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-slate-50 ring-1 ring-slate-200">
          {imgUrl(item.foto) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imgUrl(item.foto)!} alt="foto" className="h-full w-full object-cover" />
          ) : (
            <Image
              src="/image/mage.png"
              alt="placeholder"
              fill
              className="object-contain p-2 opacity-40"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-extrabold text-slate-900">{item.nama_makanan}</div>
          <div className="mt-1 text-xs font-semibold text-slate-500">
            ID Menu: <b className="text-slate-700">{item.id_menu}</b>
          </div>

          <div className="mt-2 flex items-end justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold text-slate-500">Harga</div>
              <div className="text-sm font-extrabold text-slate-900">{formatRupiah(price)}</div>
            </div>

            <div className="text-right">
              <div className="text-[11px] font-bold text-slate-500">Setelah Diskon</div>
              <div className="text-sm font-extrabold text-red-600">{formatRupiah(after)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-2xl bg-red-50 p-3 text-xs font-semibold text-red-700 ring-1 ring-red-100">
        Diskon: <b>{diskonName}</b> ({diskonPercent}%)
        {saved > 0 ? (
          <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-[11px] font-extrabold text-red-600 ring-1 ring-red-200">
            Hemat {formatRupiah(saved)}
          </span>
        ) : null}
      </div>
    </div>
  );
}