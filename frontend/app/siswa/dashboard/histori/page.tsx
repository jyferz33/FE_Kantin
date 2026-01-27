"use client";

import { useEffect, useMemo, useState } from "react";
import { getRoleToken } from "@/lib/auth";

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

function formatRupiah(value: any) {
  const n = Number(value ?? 0);
  if (Number.isNaN(n)) return String(value ?? "");
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

type HistRow = {
  id_order?: number;
  id?: number;

  status?: string;
  created_at?: string;
  tanggal?: string;

  nama_makanan?: string;
  jumlah?: number | string;
  qty?: number | string;

  harga?: number | string;
  total?: number | string;

  nama_stan?: string;
  nama_kantin?: string;

  [key: string]: any;
};

function pickId(r: HistRow) {
  return Number(r.id_order ?? r.id ?? r.ID ?? 0) || null;
}

function pickDate(r: HistRow) {
  return r.created_at ?? r.tanggal ?? r.date ?? "";
}

function pickStan(r: HistRow) {
  return r.nama_stan || r.nama_kantin || r.stan || r.kantin || "-";
}

function pickQty(r: HistRow) {
  return r.jumlah ?? r.qty ?? r.count ?? "-";
}

function pickTotal(r: HistRow) {
  return r.total ?? r.total_harga ?? r.grand_total ?? null;
}

function statusBadge(status: string) {
  const s = (status || "").toLowerCase();
  if (s.includes("belum")) return "bg-slate-100 text-slate-700 border-slate-200";
  if (s.includes("dimasak")) return "bg-amber-50 text-amber-700 border-amber-200";
  if (s.includes("diantar")) return "bg-blue-50 text-blue-700 border-blue-200";
  if (s.includes("sampai") || s.includes("siap"))
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  return "bg-purple-50 text-purple-700 border-purple-200";
}

async function fetchHistByMonth(dateYYYYMM01: string) {
  const token = getRoleToken("siswa");
  if (!token) throw new Error("Token siswa tidak ada. Login siswa dulu.");

  const res = await fetch(
    joinUrl(API_BASE, `showorderbymonthbysiswa/${dateYYYYMM01}`),
    {
      method: "GET",
      headers: {
        makerID: MAKER_ID,
        Authorization: `Bearer ${token}`,
      } as any,
    }
  );

  const raw = await res.text();
  const data: any = await safeJson(raw);

  if (!res.ok) {
    throw new Error(data?.message || data?.msg || raw || `HTTP ${res.status}`);
  }

  // backend kamu kadang balikin array langsung, kadang di data/result/items
  const list =
    Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.result)
      ? data.result
      : Array.isArray(data?.items)
      ? data.items
      : [];

  return Array.isArray(list) ? (list as HistRow[]) : [];
}

// helper: dari "2026-01" jadi "2026-01-01"
function monthToYYYYMM01(monthValue: string) {
  if (!monthValue) return "";
  return `${monthValue}-01`;
}

export default function HistoriPage() {
  // default: bulan sekarang
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [month, setMonth] = useState(defaultMonth); // format input month: YYYY-MM
  const [rows, setRows] = useState<HistRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const quickMonths = useMemo(
    () => [
      { label: "Jan", m: "01" },
      { label: "Feb", m: "02" },
      { label: "Mar", m: "03" },
      { label: "Apr", m: "04" },
      { label: "Mei", m: "05" },
      { label: "Jun", m: "06" },
      { label: "Jul", m: "07" },
      { label: "Agu", m: "08" },
      { label: "Sep", m: "09" },
      { label: "Okt", m: "10" },
      { label: "Nov", m: "11" },
      { label: "Des", m: "12" },
    ],
    []
  );

  async function load(forMonth = month) {
    setLoading(true);
    setError("");
    try {
      const dateParam = monthToYYYYMM01(forMonth);
      const list = await fetchHistByMonth(dateParam);
      setRows(list);
    } catch (e: any) {
      setRows([]);
      setError(e?.message || "Gagal memuat histori.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // auto load ketika masuk halaman
    load(defaultMonth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalOrder = rows.length;

  const totalRupiah = useMemo(() => {
    // kalau backend tidak mengirim total, hasilnya 0 (aman)
    return rows.reduce((sum, r) => sum + Number(pickTotal(r) ?? 0), 0);
  }, [rows]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Histori</h1>
            <p className="mt-1 text-sm text-slate-500">
              Rekap order bulanan dari endpoint <b>showorderbymonthbysiswa</b>.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
            />
            <button
              type="button"
              onClick={() => load(month)}
              className="rounded-2xl bg-purple-600 px-4 py-2 text-sm font-extrabold text-white hover:bg-purple-700"
            >
              Terapkan
            </button>
            <button
              type="button"
              onClick={() => load(month)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span>{loading ? "Memuat..." : `Total: ${totalOrder} order`}</span>
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <span>Total nominal (jika backend kirim field total): {formatRupiah(totalRupiah)}</span>
        </div>
      </div>

      {/* Filter cepat */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="text-sm font-extrabold text-slate-900">Pilih Bulan Cepat</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {quickMonths.map((m) => {
            const year = month.slice(0, 4) || String(new Date().getFullYear());
            const nextMonth = `${year}-${m.m}`;
            const active = month === nextMonth;

            return (
              <button
                key={m.m}
                type="button"
                onClick={() => {
                  setMonth(nextMonth);
                  load(nextMonth);
                }}
                className={[
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  active
                    ? "bg-purple-600 text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-purple-50 hover:text-purple-700",
                ].join(" ")}
              >
                {m.label}
              </button>
            );
          })}
        </div>

        {/* Error */}
        {error ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <div className="font-extrabold">Gagal memuat histori</div>
            <div className="mt-1">{error}</div>
            <button
              type="button"
              onClick={() => load(month)}
              className="mt-3 rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700"
            >
              Coba Lagi
            </button>
          </div>
        ) : null}
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="text-sm font-extrabold text-slate-900">
            List Order Bulan {month}
          </div>
          <div className="text-xs text-slate-500">{loading ? "Memuat..." : `${rows.length} data`}</div>
        </div>

        {loading ? (
          <div className="px-6 py-8 text-sm text-slate-500">Memuat data...</div>
        ) : rows.length === 0 ? (
          <div className="px-6 py-8 text-sm text-slate-500">
            Tidak ada data histori pada bulan ini.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {rows.map((r, idx) => {
              const id = pickId(r) ?? idx;
              const st = String(r.status ?? "-");
              const stan = pickStan(r);

              return (
                <div key={id} className="px-6 py-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-extrabold text-slate-900">
                          Order #{id}
                        </div>
                        <span
                          className={[
                            "rounded-full border px-3 py-1 text-xs font-bold",
                            statusBadge(st),
                          ].join(" ")}
                        >
                          {st}
                        </span>
                      </div>

                      <div className="mt-1 text-sm text-slate-600">
                        Stan: <span className="font-semibold">{stan}</span>
                      </div>

                      <div className="mt-2 text-sm text-slate-700">
                        {r.nama_makanan ? (
                          <>
                            Menu: <span className="font-semibold">{r.nama_makanan}</span>
                          </>
                        ) : (
                          <span className="text-slate-500">
                            (Nama menu belum ada di response)
                          </span>
                        )}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        {pickDate(r) ? `Tanggal: ${pickDate(r)}` : null}
                      </div>
                    </div>

                    <div className="flex flex-col items-start gap-1 md:items-end">
                      <div className="text-sm text-slate-700">
                        Qty: <span className="font-semibold">{String(pickQty(r))}</span>
                      </div>

                      {pickTotal(r) != null ? (
                        <div className="text-sm font-extrabold text-slate-900">
                          {formatRupiah(pickTotal(r))}
                        </div>
                      ) : r.harga != null ? (
                        <div className="text-sm font-extrabold text-slate-900">
                          {formatRupiah(r.harga)}
                        </div>
                      ) : (
                        <div className="text-sm text-slate-400">-</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
