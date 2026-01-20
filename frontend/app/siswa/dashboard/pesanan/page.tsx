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

type OrderRow = {
  id_order?: number;
  id?: number;

  status?: string;
  nama_makanan?: string;
  jumlah?: number | string;
  harga?: number | string;
  total?: number | string;

  nama_stan?: string;
  nama_kantin?: string;

  created_at?: string;
  tanggal?: string;

  [key: string]: any;
};

function pickId(r: OrderRow) {
  return r.id_order ?? r.id ?? (r as any).ID ?? null;
}

function pickDate(r: OrderRow) {
  return r.created_at ?? r.tanggal ?? (r as any).date ?? "";
}

function pickStan(r: OrderRow) {
  return r.nama_stan || r.nama_kantin || (r as any).stan || "-";
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

function statusBadge(status: string) {
  const s = (status || "").toLowerCase();
  if (s.includes("belum")) return "bg-slate-100 text-slate-700 border-slate-200";
  if (s.includes("dimasak")) return "bg-amber-50 text-amber-700 border-amber-200";
  if (s.includes("diantar")) return "bg-blue-50 text-blue-700 border-blue-200";
  if (s.includes("sampai")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  return "bg-purple-50 text-purple-700 border-purple-200";
}

async function fetchOrdersByStatus(statusPath: string) {
  const token = getRoleToken("siswa");
  if (!token) throw new Error("Token siswa tidak ada. Login siswa dulu.");

  const res = await fetch(joinUrl(API_BASE, `showorder/${statusPath}`), {
    method: "GET",
    headers: {
      makerID: MAKER_ID,
      Authorization: `Bearer ${token}`,
    } as any,
  });

  const raw = await res.text();
  const data: any = await safeJson(raw);

  if (!res.ok) {
    throw new Error(data?.message || data?.msg || `HTTP ${res.status}`);
  }

  const list =
    Array.isArray(data) ? data :
    Array.isArray(data?.data) ? data.data :
    Array.isArray(data?.result) ? data.result :
    Array.isArray(data?.items) ? data.items :
    [];

  return Array.isArray(list) ? (list as OrderRow[]) : [];
}

export default function PesananSayaPage() {
  const tabs = useMemo(
    () => [
      { key: "belum dikonfirm", label: "Belum Konfirmasi" },
      { key: "dimasak", label: "Dimasak" },
      { key: "diantar", label: "Diantar" },
      { key: "sampai", label: "Sampai" },
    ],
    []
  );

  const [active, setActive] = useState(tabs[0].key);
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const statusPath = encodeURIComponent(active);
      const list = await fetchOrdersByStatus(statusPath);
      setRows(list);
    } catch (e: any) {
      setRows([]);
      setError(e?.message || "Gagal memuat pesanan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-extrabold text-slate-900">Pesanan Saya</h1>
        <p className="mt-1 text-sm text-slate-500">
          Pantau status pesanan kamu: belum konfirmasi, dimasak, diantar, sampai.
        </p>

        {/* Tabs */}
        <div className="mt-4 flex flex-wrap gap-2">
          {tabs.map((t) => {
            const isActive = t.key === active;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setActive(t.key)}
                className={[
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  isActive
                    ? "bg-purple-600 text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-purple-50",
                ].join(" ")}
              >
                {t.label}
              </button>
            );
          })}

          <button
            type="button"
            onClick={load}
            className="ml-auto rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        <div className="mt-3 text-xs text-slate-500">
          {loading ? "Memuat..." : `Total: ${rows.length} pesanan`}
        </div>
      </div>

      {/* Error */}
      {error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          <div className="font-extrabold">Gagal memuat pesanan</div>
          <div className="mt-1">{error}</div>
          <button
            type="button"
            onClick={load}
            className="mt-3 rounded-2xl bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700"
          >
            Coba Lagi
          </button>
        </div>
      ) : null}

      {/* List */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4">
          <div className="text-sm font-extrabold text-slate-900">
            Daftar Pesanan ({active})
          </div>
          <div className="text-xs text-slate-500">
            (Isi detail bisa beda tergantung response backend)
          </div>
        </div>

        {loading ? (
          <div className="px-6 py-8 text-sm text-slate-500">Memuat data...</div>
        ) : rows.length === 0 ? (
          <div className="px-6 py-8 text-sm text-slate-500">
            Belum ada pesanan pada status ini.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {rows.map((r, idx) => {
              const id = pickId(r) ?? `row-${idx}`;
              const s = String(r.status ?? active);

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
                            statusBadge(s),
                          ].join(" ")}
                        >
                          {s}
                        </span>
                      </div>

                      <div className="mt-1 text-sm text-slate-600">
                        Stan: <span className="font-semibold">{pickStan(r)}</span>
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
                      {r.jumlah != null ? (
                        <div className="text-sm text-slate-700">
                          Qty: <span className="font-semibold">{r.jumlah}</span>
                        </div>
                      ) : null}

                      {r.total != null ? (
                        <div className="text-sm font-extrabold text-slate-900">
                          {formatRupiah(r.total)}
                        </div>
                      ) : r.harga != null ? (
                        <div className="text-sm font-extrabold text-slate-900">
                          {formatRupiah(r.harga)}
                        </div>
                      ) : null}

                      {/* ✅ Tombol Cetak Nota */}
                      <button
                        type="button"
                        onClick={() => {
                          const oid = pickId(r);
                          if (!oid) return alert("ID order tidak ditemukan dari backend.");
                          window.location.href = `/siswa/dashboard/nota/${oid}`;
                        }}
                        className="mt-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-700"
                      >
                        Cetak Nota
                      </button>
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
