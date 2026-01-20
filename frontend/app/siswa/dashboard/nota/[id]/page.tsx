"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function NotaPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const orderId = params.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // hasil nota bisa pdf/html/json
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [html, setHtml] = useState<string>("");
  const [jsonData, setJsonData] = useState<any>(null);

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
        if (!token) throw new Error("Token siswa tidak ada. Login siswa dulu.");

        const res = await fetch(joinUrl(API_BASE, `cetaknota/${orderId}`), {
          method: "GET",
          headers: {
            makerID: MAKER_ID,
            Authorization: `Bearer ${token}`,
          } as any,
        });

        // kalau 401 / 403, tampilkan pesan jelas
        if (!res.ok) {
          const t = await res.text();
          const parsed = await safeJson(t);
          throw new Error(
            typeof parsed === "string"
              ? parsed
              : parsed?.message || parsed?.msg || `Gagal memuat nota (HTTP ${res.status})`
          );
        }

        const ct = (res.headers.get("content-type") || "").toLowerCase();

        // 1) PDF
        if (ct.includes("application/pdf")) {
          const blob = await res.blob();
          objectUrl = URL.createObjectURL(blob);
          if (active) setPdfUrl(objectUrl);
          return;
        }

        // 2) HTML
        if (ct.includes("text/html")) {
          const text = await res.text();
          if (active) setHtml(text);
          return;
        }

        // 3) JSON (atau text biasa)
        const text = await res.text();
        const parsed = await safeJson(text);

        // kalau ternyata string panjang HTML walau CT json, tetap tampilkan sebagai HTML
        if (typeof parsed === "string" && parsed.trim().startsWith("<")) {
          if (active) setHtml(parsed);
        } else {
          if (active) setJsonData(parsed);
        }
      } catch (e: any) {
        if (active) setError(e?.message || "Gagal memuat nota.");
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

  const prettyJson = useMemo(() => {
    if (!jsonData) return "";
    try {
      return JSON.stringify(jsonData, null, 2);
    } catch {
      return String(jsonData);
    }
  }, [jsonData]);

  return (
    <div className="space-y-6">
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
              onClick={() => window.print()}
              className="rounded-2xl bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-700"
            >
              Print
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
          <div className="mt-3 text-xs text-rose-700/80">
            Catatan: Endpoint cetaknota butuh token siswa & makerID. Kalau tetap 401, kemungkinan role/akses nota dibatasi oleh backend.
          </div>
        </div>
      ) : pdfUrl ? (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
          <iframe
            title="Nota PDF"
            src={pdfUrl}
            className="h-[80vh] w-full"
          />
        </div>
      ) : html ? (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6">
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-6 py-4 text-sm font-extrabold text-slate-900">
            Output Nota (JSON/Text)
          </div>
          <pre className="max-h-[70vh] overflow-auto px-6 py-4 text-xs text-slate-700">
{prettyJson || "(Tidak ada body yang bisa ditampilkan)"}
          </pre>
        </div>
      )}
    </div>
  );
}
