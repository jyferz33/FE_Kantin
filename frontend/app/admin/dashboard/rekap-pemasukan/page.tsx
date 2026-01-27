"use client";

import { useMemo, useState } from "react";
import { getRoleToken } from "@/lib/auth";

type Row = {
  tanggal?: string;
  date?: string;
  created_at?: string;

  pemasukan?: number | string;
  total?: number | string;
  nominal?: number | string;
  jumlah?: number | string;
  harga?: number | string;

  nama_menu?: string;
  nama_makanan?: string;
  menu?: string;

  status?: string;

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

function monthToFirstDate(month: string) {
  if (!month) return "";
  return `${month}-01`;
}

function toNumber(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

function pickDate(r: Row) {
  return r.tanggal ?? r.date ?? r.created_at ?? "-";
}

function pickMenu(r: Row) {
  return r.nama_makanan ?? r.nama_menu ?? r.menu ?? "-";
}

/**
 * Fleksibel ambil nominal:
 * - kalau backend kirim "pemasukan" / "total" / "nominal" => pakai itu
 * - kalau hanya ada harga & jumlah => hitung harga*jumlah
 */
function pickNominal(r: Row) {
  const direct =
    r.pemasukan ?? r.total ?? r.nominal ?? r.jumlah; // jumlah kadang total uang di beberapa API

  // kalau ada pemasukan/total/nominal yang masuk akal
  if (direct != null && String(direct).trim() !== "") {
    const n = toNumber(direct);
    // kalau ini ternyata qty (kecil), masih ada chance salah,
    // tapi kita tetap tampilkan agar tidak blank.
    if (n !== 0) return n;
  }

  const harga = toNumber(r.harga);
  const qty = toNumber(r.jumlah);
  if (harga && qty) return harga * qty;

  return 0;
}

function normalizeList(data: any): Row[] {
  const list =
    Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.result)
      ? data.result
      : Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data?.pemasukan)
      ? data.pemasukan
      : [];
  return Array.isArray(list) ? (list as Row[]) : [];
}

async function fetchPemasukanByMonth(dateYYYYMM01: string) {
  const token = getRoleToken("stand");
  if (!token) throw new Error("Token admin/stand tidak ada. Login admin dulu.");

  const res = await fetch(joinUrl(API_BASE, `showpemasukanbybulan/${dateYYYYMM01}`), {
    method: "GET",
    headers: {
      makerID: MAKER_ID,
      Authorization: `Bearer ${token}`,
    } as any,
  });

  const raw = await res.text();

  // kalau backend ngasih angka plain text "20000"
  const rawTrim = raw?.trim?.() ?? "";
  if (res.ok && rawTrim && /^[0-9]+$/.test(rawTrim)) {
    return { kind: "number" as const, total: Number(rawTrim), rows: [] as Row[], raw };
  }

  const data: any = await safeJson(raw);

  if (!res.ok) {
    throw new Error(data?.message || data?.msg || raw || `HTTP ${res.status}`);
  }

  // kemungkinan:
  // A) { total: 12345 } atau { pemasukan: 12345 }
  const maybeTotal =
    toNumber(data?.total) ||
    toNumber(data?.pemasukan) ||
    toNumber(data?.data?.total) ||
    toNumber(data?.data?.pemasukan);

  const list = normalizeList(data);

  if (maybeTotal) {
    return { kind: "object-total" as const, total: maybeTotal, rows: list, raw };
  }

  if (list.length) {
    return { kind: "list" as const, total: 0, rows: list, raw };
  }

  // kalau response kosong tapi OK
  return { kind: "empty" as const, total: 0, rows: [] as Row[], raw };
}

export default function AdminPemasukanPage() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const [month, setMonth] = useState(`${yyyy}-${mm}`);

  const [rows, setRows] = useState<Row[]>([]);
  const [totalFromApi, setTotalFromApi] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const dateParam = monthToFirstDate(month);
      if (!dateParam) throw new Error("Bulan belum dipilih.");

      const res = await fetchPemasukanByMonth(dateParam);

      setRows(res.rows);

      // jika api memberi total langsung -> pakai itu
      if (res.kind === "number" || res.kind === "object-total") {
        setTotalFromApi(res.total);
      } else {
        setTotalFromApi(null);
      }
    } catch (e: any) {
      setRows([]);
      setTotalFromApi(null);
      setErr(e?.message || "Gagal memuat pemasukan.");
    } finally {
      setLoading(false);
    }
  }

  const computedTotal = useMemo(() => {
    if (!rows.length) return 0;
    return rows.reduce((sum, r) => sum + pickNominal(r), 0);
  }, [rows]);

  const finalTotal = totalFromApi ?? computedTotal;

  const previewCols = useMemo(() => {
    // bantu kamu lihat kira-kira field apa yang muncul
    if (!rows.length) return [];
    const keys = Object.keys(rows[0] || {});
    return keys.slice(0, 10);
  }, [rows]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Rekap Pemasukan</h1>
        <p className="mt-1 text-sm text-slate-500">
          Endpoint: <b>showpemasukanbybulan/YYYY-MM-01</b> (Bearer stand_token + makerID).
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-slate-700">Bulan:</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
            />
          </div>

          <button
            type="button"
            onClick={load}
            className="rounded-2xl bg-purple-600 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-purple-700 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Memuat..." : "Tampilkan"}
          </button>

          <div className="sm:ml-auto rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2">
            <div className="text-[11px] font-bold text-slate-500">Total Pemasukan</div>
            <div className="text-lg font-extrabold text-slate-900">{formatRupiah(finalTotal)}</div>
            <div className="text-[11px] text-slate-500">
              {totalFromApi != null ? "Sumber: backend" : "Sumber: hasil hitung dari list (fallback)"}
            </div>
          </div>
        </div>

        {err ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <div className="font-extrabold">Gagal memuat pemasukan</div>
            <div className="mt-1 whitespace-pre-wrap">{err}</div>
          </div>
        ) : null}

        {rows.length ? (
          <div className="mt-4 text-xs text-slate-500">
            Preview field teratas dari row[0]: <b>{previewCols.join(", ")}</b>
          </div>
        ) : null}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-6 py-4">
          <div className="text-sm font-extrabold text-slate-900">Daftar Pemasukan (Detail)</div>
          <div className="text-xs text-slate-500">
            Kalau backend hanya mengembalikan total, tabel bisa kosong—itu normal.
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold text-slate-600">
              <tr>
                <th className="px-6 py-3">Tanggal</th>
                <th className="px-6 py-3">Menu</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Nominal</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td className="px-6 py-6 text-slate-500" colSpan={4}>
                    Memuat data...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="px-6 py-6 text-slate-500" colSpan={4}>
                    Tidak ada detail list. (Jika total sudah muncul di atas, berarti backend mengembalikan total saja.)
                  </td>
                </tr>
              ) : (
                rows.map((r, idx) => {
                  const nominal = pickNominal(r);
                  return (
                    <tr key={idx} className="border-t border-slate-100">
                      <td className="px-6 py-4 text-slate-700">{String(pickDate(r))}</td>
                      <td className="px-6 py-4 text-slate-700">{pickMenu(r)}</td>
                      <td className="px-6 py-4 text-slate-700">{String(r.status ?? "-")}</td>
                      <td className="px-6 py-4 text-right font-extrabold text-slate-900">
                        {formatRupiah(nominal)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-6 py-3 text-xs text-slate-500">
          Request: GET <b>showpemasukanbybulan/{monthToFirstDate(month) || "YYYY-MM-01"}</b>
        </div>
      </div>
    </div>
  );
}
