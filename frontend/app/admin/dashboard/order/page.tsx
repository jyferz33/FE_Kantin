"use client";

import { useEffect, useMemo, useState } from "react";
import { getRoleToken } from "@/lib/auth";

type OrderRow = {
  id_order?: number;
  id?: number;
  ID?: number;
  status?: string;
  created_at?: string;
  tanggal?: string;
  [key: string]: any;
};

type NotaDetail = any;

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

function pickOrderId(r: OrderRow) {
  return Number(r.id_order ?? r.id ?? r.ID ?? 0) || null;
}

function pickDate(r: OrderRow) {
  return r.created_at ?? r.tanggal ?? r.date ?? "";
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

/** ================== ENDPOINT PATHS (ADMIN) ================== **/
const LIST_PATH = "getorder"; // ✅ ADMIN/stan order list: getorder/<status>
const NOTA_PATH = "cetaknota"; // cetaknota/<id>
const UPDATE_STATUS_PATH = "updatestatus"; // updatestatus/<id> (PUT, urlencoded)

/** ================== FETCHERS ================== **/

function requireStandToken() {
  const token = getRoleToken("stand");
  if (!token) throw new Error("Token admin/stan tidak ada. Login admin dulu.");
  return token;
}

async function fetchOrdersByStatus(statusPath: string) {
  const token = requireStandToken();

  const res = await fetch(joinUrl(API_BASE, `${LIST_PATH}/${statusPath}`), {
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

  return Array.isArray(list) ? (list as OrderRow[]) : [];
}

async function fetchNotaDetail(orderId: number) {
  const token = requireStandToken();

  const res = await fetch(joinUrl(API_BASE, `${NOTA_PATH}/${orderId}`), {
    method: "GET",
    headers: {
      makerID: MAKER_ID,
      Authorization: `Bearer ${token}`,
    } as any,
  });

  const raw = await res.text();
  const data: any = await safeJson(raw);

  if (!res.ok) return null;
  return data;
}

async function updateStatus(orderId: number, nextStatus: string) {
  const token = requireStandToken();

  // ✅ doc kamu: PUT + urlencoded
  const body = new URLSearchParams();
  body.set("status", nextStatus);

  const res = await fetch(joinUrl(API_BASE, `${UPDATE_STATUS_PATH}/${orderId}`), {
    method: "PUT",
    headers: {
      makerID: MAKER_ID,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
    } as any,
    body: body.toString(),
  });

  const raw = await res.text();
  const data: any = await safeJson(raw);

  if (!res.ok) throw new Error(data?.message || data?.msg || raw || `HTTP ${res.status}`);
  return data;
}

/** ================== PARSERS (nota) ================== **/

function pickSiswa(nota: NotaDetail | null) {
  if (!nota || typeof nota !== "object") return "-";
  return (
    nota?.nama_siswa ||
    nota?.username ||
    nota?.siswa?.username ||
    nota?.siswa?.nama ||
    nota?.user?.username ||
    nota?.user?.name ||
    nota?.pemesan?.username ||
    nota?.pemesan?.nama ||
    "-"
  );
}

function pickStan(nota: NotaDetail | null) {
  if (!nota || typeof nota !== "object") return "-";
  return (
    nota?.nama_stan ||
    nota?.stan?.nama_stan ||
    nota?.stan?.nama ||
    nota?.kantin?.nama ||
    nota?.nama_kantin ||
    nota?.stan_name ||
    "-"
  );
}

function pickItems(nota: NotaDetail | null) {
  if (!nota || typeof nota !== "object") return [];
  const items =
    (Array.isArray(nota.items) && nota.items) ||
    (Array.isArray(nota.pesan) && nota.pesan) ||
    (Array.isArray(nota.menu) && nota.menu) ||
    (Array.isArray(nota.detail) && nota.detail) ||
    [];
  return Array.isArray(items) ? items : [];
}

function pickItemName(it: any) {
  return it?.nama_makanan || it?.nama_menu || it?.menu || it?.nama || "-";
}

function pickItemQty(it: any) {
  return it?.qty ?? it?.jumlah ?? it?.count ?? 1;
}

/** ================== PAGE ================== **/

export default function AdminOrderPage() {
  const tabs = useMemo(
    () => [
      { key: "belum dikonfirm", label: "Belum Dikonfirm" },
      { key: "dimasak", label: "Dimasak" },
      { key: "diantar", label: "Diantar" },
      { key: "sampai", label: "Sampai" },
    ],
    []
  );

  const [active, setActive] = useState(tabs[1].key);
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [notaMap, setNotaMap] = useState<Record<number, NotaDetail | null>>({});
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  async function preloadNota(ids: number[]) {
    const need = ids.filter((id) => !(id in notaMap));
    if (need.length === 0) return;

    const chunkSize = 8;
    const nextMap: Record<number, NotaDetail | null> = {};

    for (let i = 0; i < need.length; i += chunkSize) {
      const chunk = need.slice(i, i + chunkSize);
      const results = await Promise.all(
        chunk.map(async (id) => {
          const d = await fetchNotaDetail(id);
          return [id, d] as const;
        })
      );
      for (const [id, d] of results) nextMap[id] = d;
    }

    setNotaMap((prev) => ({ ...prev, ...nextMap }));
  }

  async function load() {
    setLoading(true);
    setErr("");

    try {
      const statusPath = encodeURIComponent(active);
      const list = await fetchOrdersByStatus(statusPath);
      setRows(list);

      const ids = list.map(pickOrderId).filter(Boolean) as number[];
      await preloadNota(ids);
    } catch (e: any) {
      setRows([]);
      setErr(e?.message || "Gagal memuat order.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((r) => {
      const id = pickOrderId(r);
      const nota = id ? notaMap[id] : null;

      const siswa = pickSiswa(nota).toLowerCase();
      const stan = pickStan(nota).toLowerCase();
      const status = String(r.status ?? active).toLowerCase();

      return (
        String(id ?? "").includes(q) ||
        siswa.includes(q) ||
        stan.includes(q) ||
        status.includes(q)
      );
    });
  }, [rows, notaMap, search, active]);

  async function handleUpdateStatus(id: number, nextStatus: string) {
    try {
      setUpdatingId(id);
      await updateStatus(id, nextStatus);
      await load();
    } catch (e: any) {
      alert(e?.message || "Gagal update status");
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Order</h1>
            <p className="mt-1 text-sm text-slate-500">
              Pantau pesanan dan ubah status: belum dikonfirm → dimasak → diantar → sampai.
            </p>
          </div>

          <div className="flex w-full gap-2 lg:w-auto">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari ID / nama siswa / stan / status..."
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 lg:w-80"
            />
            <button
              type="button"
              onClick={load}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
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
        </div>
      </div>

      {err ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          <div className="font-extrabold">Gagal memuat order</div>
          <div className="mt-1">{err}</div>
          <button
            type="button"
            onClick={load}
            className="mt-3 rounded-2xl bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700"
          >
            Coba Lagi
          </button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="text-sm font-extrabold text-slate-900">
            Daftar Order ({active})
          </div>
          <div className="text-xs text-slate-500">
            {loading ? "Memuat..." : `${filtered.length} data`}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold text-slate-600">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Siswa</th>
                <th className="px-6 py-3">Stan</th>
                <th className="px-6 py-3">Detail Pesanan</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Waktu</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td className="px-6 py-6 text-slate-500" colSpan={7}>
                    Memuat data...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td className="px-6 py-6 text-slate-500" colSpan={7}>
                    Tidak ada order pada status ini.
                  </td>
                </tr>
              ) : (
                filtered.map((r, idx) => {
                  const id = pickOrderId(r) ?? idx;
                  const nota = typeof id === "number" ? notaMap[id] ?? null : null;

                  const siswa = pickSiswa(nota);
                  const stan = pickStan(nota);
                  const items = pickItems(nota);
                  const status = String(r.status ?? active);

                  return (
                    <tr key={id} className="border-t border-slate-100 align-top">
                      <td className="px-6 py-4 font-extrabold text-slate-900">{id}</td>
                      <td className="px-6 py-4 text-slate-700">{siswa}</td>
                      <td className="px-6 py-4 text-slate-700">{stan}</td>
                      <td className="px-6 py-4 text-slate-700">
                        {items.length ? (
                          <div className="space-y-1">
                            {items.slice(0, 3).map((it: any, i: number) => (
                              <div key={i} className="text-sm">
                                {pickItemName(it)} × {pickItemQty(it)}
                              </div>
                            ))}
                            {items.length > 3 ? (
                              <div className="text-xs text-slate-500">
                                +{items.length - 3} item lain
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={[
                            "inline-flex rounded-full border px-3 py-1 text-xs font-bold",
                            statusBadge(status),
                          ].join(" ")}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {pickDate(r) ? String(pickDate(r)) : "-"}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            disabled={updatingId === id}
                            onClick={() => handleUpdateStatus(Number(id), "dimasak")}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                          >
                            Dimasak
                          </button>
                          <button
                            type="button"
                            disabled={updatingId === id}
                            onClick={() => handleUpdateStatus(Number(id), "diantar")}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                          >
                            Diantar
                          </button>
                          <button
                            type="button"
                            disabled={updatingId === id}
                            onClick={() => handleUpdateStatus(Number(id), "sampai")}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                          >
                            Sampai
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-6 py-3 text-xs text-slate-500">
          Catatan: Nama siswa / stan / detail menu diambil dari cetaknota/&lt;id&gt;. Kalau masih "-", berarti endpoint
          nota tidak mengembalikan field tersebut (atau berbeda namanya).
        </div>
      </div>
    </div>
  );
}
