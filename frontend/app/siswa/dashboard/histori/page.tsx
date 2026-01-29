"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getRoleSession } from "@/lib/auth";

const BASE_URL = "https://ukk-p2.smktelkom-mlg.sch.id/api/";
const MAKER_ID = "1";

type OrderMonthItem = {
  id: number;
  tanggal: string; // "2026-01-19"
  id_siswa: number;
  id_stan: number;
  status: string;
  maker_id?: number;
  created_at: string; // "2025-01-21 06:38:08"
  updated_at: string;

  nama_siswa?: string;
  alamat?: string;
  telp?: string;
  foto?: string | null;
  id_user?: number;
};

type ApiRes = {
  status: boolean;
  message: string;
  data: OrderMonthItem[];
};

function ym01(year: number, monthIndex0: number) {
  const m = String(monthIndex0 + 1).padStart(2, "0");
  return `${year}-${m}-01`;
}

function toDateSafe(s: string) {
  if (!s) return null;
  const fixed = s.includes("T") ? s : s.replace(" ", "T");
  const d = new Date(fixed.includes("T") ? fixed : `${fixed}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatIDDate(dateStr: string) {
  const d = toDateSafe(dateStr);
  if (!d) return dateStr || "—";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(d);
}

function formatIDDateTime(dateStr: string) {
  const d = toDateSafe(dateStr);
  if (!d) return dateStr || "—";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

// ✅ sama seperti menu page kamu: jadikan foto jadi URL yang bisa diakses browser
function getFotoUrlHistori(foto?: string | null) {
  if (!foto) return "";

  // kalau sudah absolute
  if (foto.startsWith("http://") || foto.startsWith("https://")) return foto;

  // backend UKK biasanya simpan path relatif dari domain root
  const origin = "https://ukk-p2.smktelkom-mlg.sch.id/";
  return origin + foto.replace(/^\/+/, "");
}

export default function HistoriPage() {
  const router = useRouter();

  const session = useMemo(() => getRoleSession("siswa"), []);
  const token =
    session?.token ??
    session?.access_token ??
    session?.data?.token ??
    session?.data?.access_token;

  const now = useMemo(() => new Date(), []);
  const [year, setYear] = useState<number>(now.getFullYear());
  const [monthIdx, setMonthIdx] = useState<number>(now.getMonth()); // 0-11

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");
  const [items, setItems] = useState<OrderMonthItem[]>([]);

  async function loadMonth(y: number, m0: number) {
    setLoading(true);
    setErr("");

    if (!token) {
      setLoading(false);
      setErr("Token siswa tidak ditemukan. Silakan login ulang.");
      return;
    }

    const dateParam = ym01(y, m0);

    try {
      const res = await fetch(
        `${BASE_URL}showorderbymonthbysiswa/${dateParam}`,
        {
          method: "GET",
          headers: {
            makerID: MAKER_ID,
            Authorization: `Bearer ${token}`,
            token: token, // penting untuk backend kamu
          },
        }
      );

      const data: ApiRes | null = await res.json().catch(() => null);

      if (!res.ok || data?.status === false) {
        throw new Error(
          data?.message ?? `Gagal load histori (HTTP ${res.status})`
        );
      }

      const arr = Array.isArray(data?.data) ? data!.data : [];

      // ✅ SORT TERBARU DI ATAS
      const sorted = [...arr].sort((a, b) => {
        const da =
          toDateSafe(a.tanggal)?.getTime() ??
          toDateSafe(a.created_at)?.getTime() ??
          0;
        const db =
          toDateSafe(b.tanggal)?.getTime() ??
          toDateSafe(b.created_at)?.getTime() ??
          0;
        return db - da;
      });

      setItems(sorted);
    } catch (e: any) {
      console.error("showorderbymonthbysiswa error:", e);
      setItems([]);
      setErr(e?.message ?? "Gagal mengambil histori 😢");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMonth(year, monthIdx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, monthIdx]);

  const monthTitle = useMemo(
    () => `${MONTHS[monthIdx]} ${year}`,
    [monthIdx, year]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-[2.25rem] border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Histori</h1>
            <p className="mt-1 text-sm text-slate-500">
              Rekap order bulanan dari endpoint{" "}
              <b>showorderbymonthbysiswa</b>.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadMonth(year, monthIdx)}
            className="h-11 rounded-2xl bg-red-500 px-4 text-sm font-extrabold text-white hover:bg-red-600"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Bulan + Tahun */}
      <div className="rounded-[2.25rem] border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-extrabold text-slate-900">Filter</div>
            <div className="mt-1 text-xs font-semibold text-slate-500">
              Bulan: <b className="text-slate-700">{monthTitle}</b>
            </div>
          </div>

          {/* Tahun (simple) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setYear((y) => y - 1)}
              className="h-10 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 hover:bg-slate-50"
            >
              −
            </button>
            <div className="h-10 min-w-[90px] grid place-items-center rounded-2xl bg-slate-900 px-4 text-sm font-extrabold text-white">
              {year}
            </div>
            <button
              type="button"
              onClick={() => setYear((y) => y + 1)}
              className="h-10 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 hover:bg-slate-50"
            >
              +
            </button>
          </div>
        </div>

        {/* ✅ Bulan lengkap Jan–Des */}
        <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
          {MONTHS.map((m, idx) => {
            const active = idx === monthIdx;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMonthIdx(idx)}
                className={[
                  "rounded-2xl px-3 py-2 text-xs font-extrabold transition",
                  active
                    ? "bg-red-500 text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-red-50 hover:text-red-600",
                ].join(" ")}
              >
                {m}
              </button>
            );
          })}
        </div>

        <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs font-semibold text-slate-600">
          List otomatis diurutkan: <b>yang terbaru muncul paling atas</b>.
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="rounded-[2.25rem] border border-slate-200 bg-white p-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-600">
            Mengambil histori order...
          </div>
        </div>
      ) : err ? (
        <div className="rounded-[2.25rem] border border-red-200 bg-white p-6">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
            {err}
          </div>

          <button
            type="button"
            onClick={() => router.refresh?.()}
            className="mt-4 h-11 rounded-2xl bg-red-500 px-4 text-sm font-extrabold text-white hover:bg-red-600"
          >
            Coba Lagi
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-[2.25rem] border border-slate-200 bg-white p-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-600">
            Belum ada histori untuk bulan ini.
          </div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((it) => {
            const fotoUrl = getFotoUrlHistori(it.foto);

            return (
              <div
                key={it.id}
                className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-11 w-11 overflow-hidden rounded-2xl bg-red-50 ring-1 ring-red-100">
                      {fotoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={fotoUrl}
                          alt="foto"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              "/image/mage.png";
                          }}
                        />
                      ) : (
                        <Image
                          src="/image/mage.png"
                          alt="placeholder"
                          fill
                          className="object-contain p-2 opacity-40"
                        />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="truncate text-sm font-extrabold text-slate-900">
                        Order #{it.id}
                      </div>
                      <div className="text-xs font-semibold text-slate-500">
                        Tanggal:{" "}
                        <span className="font-bold text-slate-700">
                          {formatIDDate(it.tanggal)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={[
                      "rounded-full px-3 py-1 text-xs font-extrabold ring-1",
                      it.status?.toLowerCase().includes("belum")
                        ? "bg-amber-50 text-amber-700 ring-amber-200"
                        : "bg-emerald-50 text-emerald-700 ring-emerald-200",
                    ].join(" ")}
                  >
                    {it.status ?? "—"}
                  </span>
                </div>

                <div className="mt-4 grid gap-2 text-xs font-semibold text-slate-600">
                  <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                    <div className="text-[11px] text-slate-400">Nama Siswa</div>
                    <div className="mt-1 font-extrabold text-slate-900">
                      {it.nama_siswa ?? "—"}
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                      <div className="text-[11px] text-slate-400">Dibuat</div>
                      <div className="mt-1 font-extrabold text-slate-900">
                        {formatIDDateTime(it.created_at)}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                      <div className="text-[11px] text-slate-400">Update</div>
                      <div className="mt-1 font-extrabold text-slate-900">
                        {formatIDDateTime(it.updated_at)}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                    <div className="text-[11px] text-slate-400">Alamat</div>
                    <div className="mt-1 font-extrabold text-slate-900">
                      {it.alamat ?? "—"}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                    <div className="text-[11px] text-slate-400">Telepon</div>
                    <div className="mt-1 font-extrabold text-slate-900">
                      {it.telp ?? "—"}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-extrabold text-white hover:bg-slate-800"
                  onClick={() =>
                    alert(
                      "Detail order belum dibuat (menunggu endpoint detail)."
                    )
                  }
                >
                  Lihat Detail
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}