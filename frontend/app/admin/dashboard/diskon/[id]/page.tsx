"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getRoleSession } from "@/lib/auth";
import { ArrowLeft, BadgePercent, CalendarClock } from "lucide-react";

const BASE_URL = "https://ukk-p2.smktelkom-mlg.sch.id/api/";

type DetailRes = {
  status: boolean;
  message: string;
  data: {
    id: number;
    nama_diskon: string;
    persentase_diskon: number;
    tanggal_awal: string;
    tanggal_akhir: string;
    maker_id: number;
    created_at: string;
    updated_at: string;
  };
};

function formatDateTime(s: string) {
  if (!s || typeof s !== "string") return "—";
  const fixed = s.replace(" ", "T");
  const d = new Date(fixed);
  if (Number.isNaN(d.getTime())) return s;
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export default function DiskonDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const session = useMemo(() => getRoleSession("siswa"), []);
  const token =
    session?.token ??
    session?.access_token ??
    session?.data?.token ??
    session?.data?.access_token;

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [detail, setDetail] = useState<DetailRes["data"] | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setErrorMsg("");

      if (!token) {
        setLoading(false);
        setErrorMsg("Token tidak ditemukan. Pastikan login menyimpan token.");
        return;
      }

      try {
        const res = await fetch(`${BASE_URL}detaildiskon/${id}`, {
          method: "GET",
          headers: {
            makerID: "1",
            Authorization: `Bearer ${token}`,
          },
        });

        const data: DetailRes | null = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(data?.message ?? `Gagal ambil detail (HTTP ${res.status})`);
        }

        if (!data?.data) {
          throw new Error("Response detaildiskon tidak ada field data.");
        }

        if (!alive) return;
        setDetail(data.data);
      } catch (e: any) {
        console.error(e);
        if (!alive) return;
        setErrorMsg(e?.message ?? "Gagal mengambil detail diskon 😢");
      } finally {
        if (alive) setLoading(false);
      }
    }

    if (id) load();
    return () => {
      alive = false;
    };
  }, [id, token]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-[2.25rem] bg-white px-7 py-6 shadow-2xl ring-1 ring-white/40">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Siswa Panel</p>
            <h1 className="mt-1 text-2xl font-extrabold text-slate-900">Detail Diskon</h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Endpoint: <b>GET detaildiskon/{id}</b>
            </p>
          </div>

          <Link
            href="/siswa/dashboard/diskon"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
        </div>
      </div>

      {/* Card */}
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-600">
            Mengambil detail diskon...
          </div>
        ) : errorMsg ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
            {errorMsg}
          </div>
        ) : !detail ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-600">
            Data detail tidak tersedia.
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100">
                  <BadgePercent className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-slate-900">
                    {detail.nama_diskon}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-500">
                    ID Diskon: <b>{detail.id}</b>
                  </div>
                </div>
              </div>

              <div className="inline-flex w-fit items-center rounded-full bg-red-500 px-4 py-2 text-sm font-extrabold text-white">
                {detail.persentase_diskon}%
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InfoCard
                icon={<CalendarClock className="h-5 w-5" />}
                label="Tanggal Awal"
                value={formatDateTime(detail.tanggal_awal)}
              />
              <InfoCard
                icon={<CalendarClock className="h-5 w-5" />}
                label="Tanggal Akhir"
                value={formatDateTime(detail.tanggal_akhir)}
              />
              <InfoCard label="Dibuat" value={formatDateTime(detail.created_at)} />
              <InfoCard label="Diupdate" value={formatDateTime(detail.updated_at)} />
            </div>

            <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-xs font-semibold text-red-700">
              Diskon aktif pada rentang tanggal di atas. Nanti jika API mengirim menu diskon (produk apa saja),
              aku bisa buatkan list item diskonnya di bawah detail ini.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start gap-3">
        {icon ? (
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-red-50 text-red-600">
            {icon}
          </div>
        ) : null}
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-500">{label}</p>
          <p className="mt-1 truncate text-base font-extrabold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}