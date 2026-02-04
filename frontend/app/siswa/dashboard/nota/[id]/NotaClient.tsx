"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getRoleToken } from "@/lib/auth";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "https://ukk-p2.smktelkom-mlg.sch.id/api/";
const MAKER_ID = process.env.NEXT_PUBLIC_MAKER_ID ?? "1";

function joinUrl(base: string, path: string) {
  const b = base.endsWith("/") ? base : base + "/";
  const p = path.startsWith("/") ? path.slice(1) : path;
  return b + p;
}

async function safeJson(text: string) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function formatRp(n: unknown) {
  const num = Number(n ?? 0);
  if (!Number.isFinite(num)) return String(n ?? "");
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
}

function formatDateLike(s: unknown) {
  if (!s) return "";
  const str = String(s);
  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return str;
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

/** ====== TYPES ====== */
type DetailTrans = {
  id?: number;
  id_transaksi?: number;
  id_menu?: number;
  qty?: number;
  harga_beli?: number;
  subtotal?: number;
  created_at?: string;
  updated_at?: string;

  menu?: { nama?: string };
  nama_menu?: string;
};

type NotaApiData = {
  id?: number;
  tanggal?: string;
  created_at?: string;
  updated_at?: string;
  id_siswa?: number;
  status?: string;
  maker_id?: number;

  grandtTotal?: number; // sesuai response kamu
  grandTotal?: number;
  grand_total?: number;

  detail_trans?: DetailTrans[];

  siswa?: { nama?: string; kelas?: string; rombel?: string; username?: string };
  kasir?: { nama?: string };
  petugas?: { nama?: string };
  metode_pembayaran?: string;
  pembayaran?: string;
  diskon?: number;
  pajak?: number;
  ongkir?: number;
};

type NotaApiResponse = {
  status?: string;
  message?: string;
  data?: NotaApiData;

  /** internal helper (diinject dari client) */
  __unitMap?: Map<number, number>;
};

type NotaItem = {
  nama: string;
  qty: number;
  harga: number; // harga satuan
  subtotal: number; // harga * qty
  catatan?: string;
};

type NotaNormalized = {
  header: {
    no: string;
    tanggal: string;
    status: string;
    nama: string;
    kelas: string;
    metode: string;
    kasir: string;
  };
  items: NotaItem[];
  subtotalCalc: number;
  diskon: number;
  pajak: number;
  ongkir: number;
  total: number;
};

function pickList(data: any): any[] {
  const list =
    Array.isArray(data) ? data :
    Array.isArray(data?.data) ? data.data :
    Array.isArray(data?.menu) ? data.menu :
    Array.isArray(data?.result) ? data.result :
    Array.isArray(data?.items) ? data.items :
    Array.isArray(data?.payload) ? data.payload :
    [];
  return Array.isArray(list) ? list : [];
}

/** ambil harga satuan dari endpoint menu */
async function fetchUnitPriceMap(token: string) {
  async function fetchMenu(path: "getmenufood" | "getmenudrink") {
    const fd = new FormData();
    fd.append("search", ""); // ambil semua (atau set keyword kalau mau)

    const res = await fetch(joinUrl(API_BASE, path), {
      method: "POST",
      headers: {
        makerID: String(MAKER_ID),
        Authorization: `Bearer ${token}`,
      } as any,
      body: fd,
      cache: "no-store",
    });

    const raw = await res.text();
    const data: any = await safeJson(raw);

    if (!res.ok) {
      throw new Error(data?.message || data?.msg || raw || `HTTP ${res.status}`);
    }
    return pickList(data);
  }

  // jangan biarkan salah satu gagal bikin semuanya gagal
  const [food, drink] = await Promise.allSettled([
    fetchMenu("getmenufood"),
    fetchMenu("getmenudrink"),
  ]);

  const merged = [
    ...(food.status === "fulfilled" ? food.value : []),
    ...(drink.status === "fulfilled" ? drink.value : []),
  ];

  const map = new Map<number, number>();
  for (const m of merged) {
    const id = Number(m?.id_menu ?? m?.id ?? m?.ID ?? m?.Id ?? 0);
    if (!id) continue;

    const harga = Number(m?.harga ?? 0);
    if (Number.isFinite(harga)) map.set(id, harga);
  }

  return map;
}

/**
 * ✅ Normalizer:
 * - Harga kolom = harga satuan (dari __unitMap)
 * - Subtotal = harga satuan * qty
 */
function normalizeNotaFromYourApi(raw: NotaApiResponse): NotaNormalized {
  const d: NotaApiData = raw?.data ?? {};
  const unitMap = raw?.__unitMap;

  const header = {
    no: d?.id ? String(d.id) : "",
    tanggal: d?.tanggal || d?.created_at || "",
    status: d?.status || "",
    nama:
      d?.siswa?.nama ||
      d?.siswa?.username ||
      (d?.id_siswa ? `Siswa #${d.id_siswa}` : ""),
    kelas: d?.siswa?.kelas || d?.siswa?.rombel || "",
    metode: d?.metode_pembayaran || d?.pembayaran || "",
    kasir: d?.kasir?.nama || d?.petugas?.nama || "",
  };

  const itemsRaw: DetailTrans[] = Array.isArray(d?.detail_trans) ? d.detail_trans : [];

  const items: NotaItem[] = itemsRaw.map((it: DetailTrans, idx: number) => {
    const qty = Number(it?.qty ?? 0) || 0;
    const idMenu = Number(it?.id_menu ?? 0) || 0;

    // ✅ harga satuan dari endpoint menu
    const hargaFromMenu = unitMap?.get(idMenu);

    // fallback aman kalau map tidak nemu (pakai data dari nota bila ada)
    const fallbackLineTotal =
      Number((it as any)?.subtotal ?? 0) ||
      Number((it as any)?.harga_beli ?? 0) ||
      0;

    const harga =
      typeof hargaFromMenu === "number" && Number.isFinite(hargaFromMenu)
        ? hargaFromMenu
        : qty > 0
          ? fallbackLineTotal / qty
          : 0;

    const subtotal = qty > 0 ? harga * qty : 0;

    const nama =
      it?.menu?.nama ||
      it?.nama_menu ||
      (idMenu ? `Menu #${idMenu}` : `Item ${idx + 1}`);

    return { nama, qty, harga, subtotal, catatan: "" };
  });

  const subtotalCalc = items.reduce((a: number, b: NotaItem) => a + b.subtotal, 0);

  const diskon = Number(d?.diskon ?? 0) || 0;
  const pajak = Number(d?.pajak ?? 0) || 0;
  const ongkir = Number(d?.ongkir ?? 0) || 0;

  const total =
    Number(
      d?.grandtTotal ??
        d?.grandTotal ??
        d?.grand_total ??
        subtotalCalc - diskon + pajak + ongkir
    ) || subtotalCalc - diskon + pajak + ongkir;

  return { header, items, subtotalCalc, diskon, pajak, ongkir, total };
}

function NotaInvoice({ data }: { data: NotaApiResponse }) {
  const nota = useMemo(() => normalizeNotaFromYourApi(data), [data]);

  return (
    <div className="nota-paper">
      <div className="nota-head">
        <div>
          <div className="nota-title">NOTA PEMBAYARAN</div>
          <div className="nota-sub">SMK Telkom Malang</div>
        </div>

        <div className="nota-meta">
          <div className="row">
            <span>No</span>
            <b>{nota.header.no || "-"}</b>
          </div>
          <div className="row">
            <span>Tanggal</span>
            <b>{formatDateLike(nota.header.tanggal) || "-"}</b>
          </div>
          <div className="row">
            <span>Status</span>
            <b>{nota.header.status ? String(nota.header.status) : "-"}</b>
          </div>
        </div>
      </div>

      <div className="nota-info">
        <div className="info-col">
          <div className="label">Pelanggan</div>
          <div className="value">{nota.header.nama || "-"}</div>
          {nota.header.kelas ? <div className="muted">Kelas: {nota.header.kelas}</div> : null}
        </div>

        <div className="info-col">
          <div className="label">Pembayaran</div>
          <div className="value">{nota.header.metode || "-"}</div>
          {nota.header.kasir ? <div className="muted">Kasir: {nota.header.kasir}</div> : null}
        </div>
      </div>

      <div className="nota-table">
        <div className="thead">
          <div>No</div>
          <div>Item</div>
          <div className="right">Qty</div>
          <div className="right">Harga</div>
          <div className="right">Subtotal</div>
        </div>

        {nota.items.length ? (
          nota.items.map((it, i) => (
            <div className="trow" key={i}>
              <div>{i + 1}</div>
              <div>
                <div className="item-name">{it.nama}</div>
                {it.catatan ? <div className="item-note">{it.catatan}</div> : null}
              </div>
              <div className="right">{it.qty}</div>
              <div className="right">{formatRp(it.harga)}</div>
              <div className="right">{formatRp(it.subtotal)}</div>
            </div>
          ))
        ) : (
          <div className="trow">
            <div>—</div>
            <div className="muted">Tidak ada item</div>
            <div className="right">—</div>
            <div className="right">—</div>
            <div className="right">—</div>
          </div>
        )}
      </div>

      <div className="nota-summary">
        <div />
        <div className="sum-box">
          <div className="sum-row">
            <span>Subtotal</span>
            <b>{formatRp(nota.subtotalCalc)}</b>
          </div>

          {nota.diskon ? (
            <div className="sum-row">
              <span>Diskon</span>
              <b>- {formatRp(nota.diskon)}</b>
            </div>
          ) : null}

          {nota.pajak ? (
            <div className="sum-row">
              <span>Pajak</span>
              <b>{formatRp(nota.pajak)}</b>
            </div>
          ) : null}

          {nota.ongkir ? (
            <div className="sum-row">
              <span>Ongkir</span>
              <b>{formatRp(nota.ongkir)}</b>
            </div>
          ) : null}

          <div className="sum-total">
            <span>Total</span>
           <b>{formatRp(nota.subtotalCalc)}</b>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NotaClient({ orderId }: { orderId: string }) {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [html, setHtml] = useState<string>("");
  const [jsonData, setJsonData] = useState<NotaApiResponse | null>(null);

  useEffect(() => {
    let active = true;
    let objectUrl = "";

    async function load() {
      setLoading(true);
      setError("");
      setPdfUrl("");
      setHtml("");
      setJsonData(null);

      try {
        const token = getRoleToken("siswa");
        if (!token) throw new Error("Token siswa tidak ada. Login sebagai siswa dulu.");

        const maker = String(MAKER_ID);

        const url = joinUrl(API_BASE, `/cetaknota/${orderId}`) + `?makerID=${encodeURIComponent(maker)}`;

        const res = await fetch(url, {
          method: "GET",
          headers: {
            makerID: maker,
            makerId: maker,
            MakerID: maker,
            "Maker-Id": maker,
            Authorization: `Bearer ${token}`,
            Accept: "application/pdf,text/html,application/json;q=0.9,*/*;q=0.8",
          } as any,
          cache: "no-store",
        });

        if (!res.ok) {
          const t = await res.text();
          if (t.trim().startsWith("<")) {
            if (active) setHtml(t);
            throw new Error(`Server error (HTTP ${res.status}) — detail ditampilkan di bawah.`);
          }
          throw new Error(t || `Gagal memuat nota (HTTP ${res.status})`);
        }

        const ct = (res.headers.get("content-type") || "").toLowerCase();
        const blob = await res.blob();
        const blobType = (blob.type || "").toLowerCase();

        // PDF langsung
        if (ct.includes("application/pdf") || blobType.includes("application/pdf")) {
          objectUrl = URL.createObjectURL(blob);
          if (active) setPdfUrl(objectUrl);
          return;
        }

        const text = await blob.text();
        const parsed = await safeJson(text);

        // HTML langsung
        if (ct.includes("text/html") || (typeof parsed === "string" && parsed.trim().startsWith("<"))) {
          if (active) setHtml(typeof parsed === "string" ? parsed : text);
          return;
        }

        // JSON: inject unit price map
        const notaJson = parsed as NotaApiResponse;

        // ✅ ambil harga satuan menu dari endpoint menu
        const unitMap = await fetchUnitPriceMap(token);
        notaJson.__unitMap = unitMap;

        if (active) setJsonData(notaJson);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Gagal memuat nota.";
        if (active) setError(msg);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [orderId]);

  const handlePrint = () => {
    if (pdfUrl && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.focus();
      iframeRef.current.contentWindow.print();
      return;
    }
    window.print();
  };

  return (
    <div className="space-y-6">
      <style jsx global>{`
        .nota-paper {
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          background: #fff;
          padding: 24px;
        }
        .nota-head {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid #eef2f7;
        }
        .nota-title {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
        }
        .nota-sub {
          margin-top: 2px;
          font-size: 12px;
          color: #64748b;
        }
        .nota-meta {
          min-width: 220px;
          display: grid;
          gap: 6px;
          font-size: 12px;
          color: #334155;
        }
        .nota-meta .row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
        }
        .nota-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 16px;
        }
        .info-col {
          border: 1px solid #eef2f7;
          border-radius: 16px;
          padding: 12px;
        }
        .label {
          font-size: 11px;
          color: #64748b;
          font-weight: 700;
        }
        .value {
          margin-top: 4px;
          font-size: 14px;
          color: #0f172a;
          font-weight: 800;
        }
        .muted {
          margin-top: 4px;
          font-size: 12px;
          color: #64748b;
        }
        .nota-table {
          margin-top: 16px;
          border: 1px solid #eef2f7;
          border-radius: 16px;
          overflow: hidden;
        }
        .nota-table .thead,
        .nota-table .trow {
          display: grid;
          grid-template-columns: 48px 1fr 70px 110px 120px;
          gap: 12px;
          align-items: start;
          padding: 12px;
          font-size: 12px;
        }
        .nota-table .thead {
          background: #f8fafc;
          color: #0f172a;
          font-weight: 800;
        }
        .nota-table .trow {
          border-top: 1px solid #eef2f7;
          color: #0f172a;
        }
        .right {
          text-align: right;
        }
        .item-name {
          font-weight: 800;
        }
        .nota-summary {
          margin-top: 16px;
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 16px;
          align-items: start;
        }
        .sum-box {
          border: 1px solid #eef2f7;
          border-radius: 16px;
          padding: 12px;
        }
        .sum-row {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #334155;
          padding: 6px 0;
        }
        .sum-total {
          margin-top: 8px;
          padding-top: 10px;
          border-top: 1px dashed #cbd5e1;
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          color: #0f172a;
          font-weight: 900;
        }
      `}</style>

      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Nota</h1>
            <p className="mt-1 text-sm text-slate-500">
              Cetaknota untuk Order ID: <b>{orderId}</b>
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="rounded-2xl bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-700"
            >
              Print / Save PDF
            </button>
            <button
              type="button"
              onClick={() => router.push("/siswa/dashboard/pesanan")}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          Memuat nota...
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          <div className="font-extrabold">Gagal memuat nota</div>
          <div className="mt-1">{error}</div>
        </div>
      ) : null}

      {pdfUrl ? (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
          <iframe ref={iframeRef} title="Nota PDF" src={pdfUrl} className="h-[80vh] w-full" />
        </div>
      ) : html ? (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6">
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      ) : jsonData ? (
        <div className="space-y-4">
          <NotaInvoice data={jsonData} />
        </div>
      ) : (
        !loading &&
        !error && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            (Tidak ada body yang bisa ditampilkan)
          </div>
        )
      )}
    </div>
  );
}
