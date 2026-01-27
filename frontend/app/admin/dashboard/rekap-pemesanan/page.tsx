"use client";

import { useMemo, useState } from "react";
import { getRoleToken } from "@/lib/auth";

type OrderRow = {
  id_order?: number;
  id?: number;
  status?: string;
  created_at?: string;
  tanggal?: string;

  // kadang ada detail item
  nama_makanan?: string;
  jumlah?: number | string;
  qty?: number | string;

  // stan / siswa (kalau ada)
  nama_siswa?: string;
  username?: string;
  nama_stan?: string;

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

function pickId(r: OrderRow) {
  return r.id_order ?? r.id ?? r.ID ?? null;
}

function pickDate(r: OrderRow) {
  return r.created_at ?? r.tanggal ?? r.date ?? "-";
}

function pickStatus(r: OrderRow) {
  return String(r.status ?? "-");
}

function pickQty(r: OrderRow) {
  return r.jumlah ?? r.qty ?? "-";
}

function pickMenu(r: OrderRow) {
  return r.nama_makanan ?? r.menu ?? r.nama_menu ?? "-";
}

function normalizeList(data: any): OrderRow[] {
  const list =
    Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.result)
      ? data.result
      : Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data?.orders)
      ? data.orders
      : [];
  return Array.isArray(list) ? (list as OrderRow[]) : [];
}

async function fetchRekapByMonth(dateYYYYMM01: string) {
  const token = getRoleToken("stand");
  if (!token) throw new Error("Token admin/stand tidak ada. Login admin dulu.");

  const res = await fetch(joinUrl(API_BASE, `showorderbymonth/${dateYYYYMM01}`), {
    method: "GET",
    headers: {
      makerID: MAKER_ID,
      Authorization: `Bearer ${token}`,
    } as any,
  });

  const raw = await res.text();
  const data: any = await safeJson(raw);

  if (!res.ok) {
    throw new Error(data?.message || data?.msg || raw || `HTTP ${res.status}`);
  }

  return normalizeList(data);
}

// ubah "2026-01" => "2026-01-01"
function monthToFirstDate(month: string) {
  if (!month) return "";
  return `${month}-01`;
}

export default function AdminRekapPage() {
  // default bulan ini (lokal user)
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const [month, setMonth] = useState(`${yyyy}-${mm}`);

  const [rows, setRows] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const dateParam = monthToFirstDate(month);
      if (!dateParam) throw new Error("Bulan belum dipilih.");

      const list = await fetchRekapByMonth(dateParam);
      setRows(list);
    } catch (e: any) {
      setRows([]);
      setErr(e?.message || "Gagal memuat rekap.");
    } finally {
      setLoading(false);
    }
  }

  const totalOrder = rows.length;

  const statusCount = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of rows) {
      const s = pickStatus(r).toLowerCase();
      map[s] = (map[s] || 0) + 1;
    }
    return map;
  }, [rows]);

  const topStatuses = useMemo(() => {
    const entries = Object.entries(statusCount).sort((a, b) => b[1] - a[1]);
    return entries.slice(0, 6);
  }, [statusCount]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Rekap Pemesanan</h1>
        <p className="mt-1 text-sm text-slate-500">
          Rekap order per bulan (Admin/Stan) dari endpoint <b>showorderbymonth/YYYY-MM-01</b>.
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

          <div className="sm:ml-auto text-xs text-slate-500">
            {rows.length ? `Total data: ${rows.length}` : null}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-bold text-slate-500">Total Order</div>
            <div className="mt-1 text-2xl font-extrabold text-slate-900">{totalOrder}</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 md:col-span-2">
            <div className="text-xs font-bold text-slate-500">Breakdown Status (jika ada)</div>
            {topStatuses.length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {topStatuses.map(([s, n]) => (
                  <span
                    key={s}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700"
                  >
                    {s} : {n}
                  </span>
                ))}
              </div>
            ) : (
              <div className="mt-2 text-sm text-slate-500">Belum ada data status.</div>
            )}
          </div>
        </div>

        {/* Error */}
        {err ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <div className="font-extrabold">Gagal memuat rekap</div>
            <div className="mt-1 whitespace-pre-wrap">{err}</div>
          </div>
        ) : null}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-6 py-4">
          <div className="text-sm font-extrabold text-slate-900">Daftar Order (per bulan)</div>
          <div className="text-xs text-slate-500">
            Kolom bisa “-” kalau field tidak dikirim backend.
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold text-slate-600">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Tanggal</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Menu</th>
                <th className="px-6 py-3">Qty</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td className="px-6 py-6 text-slate-500" colSpan={5}>
                    Memuat data...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="px-6 py-6 text-slate-500" colSpan={5}>
                    Belum ada data. Pilih bulan lalu klik <b>Tampilkan</b>.
                  </td>
                </tr>
              ) : (
                rows.map((r, idx) => {
                  const id = pickId(r) ?? `row-${idx}`;
                  return (
                    <tr key={id} className="border-t border-slate-100">
                      <td className="px-6 py-4 font-extrabold text-slate-900">{id}</td>
                      <td className="px-6 py-4 text-slate-700">{String(pickDate(r))}</td>
                      <td className="px-6 py-4 text-slate-700">{pickStatus(r)}</td>
                      <td className="px-6 py-4 text-slate-700">{pickMenu(r)}</td>
                      <td className="px-6 py-4 text-slate-700">{String(pickQty(r))}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-6 py-3 text-xs text-slate-500">
          Request: GET <b>showorderbymonth/{monthToFirstDate(month) || "YYYY-MM-01"}</b> (Bearer stand_token + makerID).
        </div>
      </div>
    </div>
  );
}
