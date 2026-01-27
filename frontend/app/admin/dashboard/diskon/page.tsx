"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getRoleSession } from "@/lib/auth";
import {
  BadgePercent,
  Search,
  RefreshCcw,
  Plus,
  CalendarDays,
  Tag,
  Save,
  Trash2,
} from "lucide-react";

const BASE_URL = "https://ukk-p2.smktelkom-mlg.sch.id/api/";
const LS_KEY = "kantinku_diskon_list_v1";

type Diskon = {
  id: number; // bisa pakai id dari backend, atau temp jika tidak ada
  nama_diskon: string;
  persentase_diskon: number;
  tanggal_awal: string; // YYYY-MM-DD atau datetime string
  tanggal_akhir: string;
};

type ShowDiskonRes = {
  status: boolean;
  message: string;
  data: Diskon[];
};

function safeParseJSON<T>(raw: string | null, fallback: T): T {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveLocal(items: Diskon[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  } catch {}
}

function loadLocal(): Diskon[] {
  const arr = safeParseJSON<Diskon[]>(localStorage.getItem(LS_KEY), []);
  return Array.isArray(arr) ? arr : [];
}

function makeTempId() {
  return -Math.floor(Math.random() * 1_000_000);
}

function formatDateTime(s: string) {
  if (!s || typeof s !== "string") return "—";
  const fixed = s.includes("T") ? s : s.replace(" ", "T");
  const d = new Date(fixed.includes("T") ? fixed : `${fixed}T00:00:00`);
  if (Number.isNaN(d.getTime())) return s;
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export default function AdminDiskonPage() {
  const session = useMemo(() => getRoleSession("stand"), []);
  const token =
    session?.token ??
    session?.access_token ??
    session?.data?.token ??
    session?.data?.access_token;

  // ✅ LIST DISKON LOKAL (tanpa backend)
  const [items, setItems] = useState<Diskon[]>([]);
  const [search, setSearch] = useState("");

  // status
  const [loadingServer, setLoadingServer] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // form state
  const [showForm, setShowForm] = useState(false);
  const [namaDiskon, setNamaDiskon] = useState("");
  const [persen, setPersen] = useState<string>("10");
  const [tglAwal, setTglAwal] = useState("");
  const [tglAkhir, setTglAkhir] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // load local list on mount
  useEffect(() => {
    setItems(loadLocal());
  }, []);

  // filtered view (search lokal)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((x) => x.nama_diskon.toLowerCase().includes(q));
  }, [items, search]);

  // OPTIONAL: tombol "Sync dari backend" (kalau backend benar2 ada datanya)
  async function syncFromBackend() {
    setErrorMsg("");
    if (!token) {
      setErrorMsg("Token admin/stan tidak ditemukan.");
      return;
    }

    setLoadingServer(true);
    try {
      const fd = new FormData();
      fd.append("search", "");

      const res = await fetch(`${BASE_URL}showdiskon`, {
        method: "POST",
        headers: {
          makerID: "1",
          Authorization: `Bearer ${token}`,
          token: token, // penting untuk backend kamu
        },
        body: fd,
      });

      const data: ShowDiskonRes | null = await res.json().catch(() => null);

      if (!res.ok || data?.status === false) {
        throw new Error(data?.message ?? `Gagal sync (HTTP ${res.status})`);
      }

      // kalau backend kosong, tidak overwrite list lokal
      const arr = Array.isArray(data?.data) ? data!.data : [];
      if (arr.length > 0) {
        setItems(arr);
        saveLocal(arr);
      } else {
        setErrorMsg("Backend mengembalikan data kosong. List tetap pakai local.");
      }
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e?.message ?? "Gagal sync dari backend.");
    } finally {
      setLoadingServer(false);
    }
  }

  async function onAddDiskon(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!token) return setFormError("Token admin/stan tidak ditemukan.");

    if (!namaDiskon.trim()) return setFormError("Nama diskon wajib diisi.");
    const p = Number(persen);
    if (!Number.isFinite(p) || p <= 0 || p > 100) return setFormError("Persentase 1 - 100.");
    if (!tglAwal) return setFormError("Tanggal awal wajib diisi.");
    if (!tglAkhir) return setFormError("Tanggal akhir wajib diisi.");
    if (tglAkhir < tglAwal) return setFormError("Tanggal akhir tidak boleh sebelum awal.");

    setSaving(true);
    try {
      // tetap create ke backend (biar data beneran tersimpan)
      const fd = new FormData();
      fd.append("nama_diskon", namaDiskon.trim());
      fd.append("persentase_diskon", String(p));
      fd.append("tanggal_awal", tglAwal);
      fd.append("tanggal_akhir", tglAkhir);

      const res = await fetch(`${BASE_URL}tambahdiskon`, {
        method: "POST",
        headers: {
          makerID: "1",
          Authorization: `Bearer ${token}`,
          token: token,
        },
        body: fd,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || data?.status === false) {
        throw new Error(data?.message ?? `Gagal tambah diskon (HTTP ${res.status})`);
      }

      // ✅ update list TANPA backend: simpan lokal
      const newItem: Diskon = {
        id: Number(data?.data?.id ?? makeTempId()),
        nama_diskon: namaDiskon.trim(),
        persentase_diskon: p,
        tanggal_awal: tglAwal,
        tanggal_akhir: tglAkhir,
      };

      setItems((prev) => {
        const next = [newItem, ...prev];
        saveLocal(next);
        return next;
      });

      alert(data?.message ?? "Diskon berhasil ditambahkan ✅");

      // reset form
      setNamaDiskon("");
      setPersen("10");
      setTglAwal("");
      setTglAkhir("");
      setShowForm(false);
    } catch (e: any) {
      console.error(e);
      setFormError(e?.message ?? "Gagal tambah diskon 😢");
    } finally {
      setSaving(false);
    }
  }

  function clearLocal() {
    if (!confirm("Hapus semua list diskon lokal?")) return;
    setItems([]);
    saveLocal([]);
  }

  return (
    <div className="space-y-6">
      {/* Header page */}
      <div className="rounded-[2.25rem] bg-white px-7 py-6 shadow-2xl ring-1 ring-white/40">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Admin Panel</p>
            <h1 className="mt-1 text-2xl font-extrabold text-slate-900">Diskon</h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              List diskon ditampilkan dari <b>localStorage</b> (tanpa backend). Create tetap ke backend.
            </p>
          </div>

          <div className="flex w-full max-w-[760px] flex-wrap items-center gap-2 sm:flex-nowrap">
            <div className="relative flex-1 min-w-[260px]">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari diskon..."
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none focus:border-red-300"
              />
            </div>

            <button
              onClick={() => setShowForm((v) => !v)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 text-sm font-extrabold text-white hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              {showForm ? "Tutup Form" : "Tambah Diskon"}
            </button>

            <button
              onClick={clearLocal}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 hover:bg-slate-50"
              title="hapus list lokal"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </button>

            <button
              onClick={syncFromBackend}
              disabled={loadingServer}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 text-sm font-extrabold text-white hover:bg-red-600 disabled:opacity-60"
              title="kalau suatu saat backend showdiskon sudah benar"
            >
              <RefreshCcw className="h-4 w-4" />
              {loadingServer ? "Sync..." : "Sync Server"}
            </button>
          </div>
        </div>

        {errorMsg ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
            {errorMsg}
          </div>
        ) : null}
      </div>

      {/* Form tambah */}
      {showForm && (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-500">Tambah Diskon</p>
            <h2 className="text-lg font-extrabold text-slate-900">Form Diskon Baru</h2>
          </div>

          {formError ? (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {formError}
            </div>
          ) : null}

          <form onSubmit={onAddDiskon} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nama Diskon" icon={<Tag className="h-4 w-4" />}>
                <input
                  value={namaDiskon}
                  onChange={(e) => setNamaDiskon(e.target.value)}
                  placeholder="gebyar tahun lawas"
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none focus:border-red-300"
                />
              </Field>

              <Field label="Persentase Diskon" icon={<BadgePercent className="h-4 w-4" />}>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={persen}
                  onChange={(e) => setPersen(e.target.value)}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none focus:border-red-300"
                />
              </Field>

              <Field label="Tanggal Awal" icon={<CalendarDays className="h-4 w-4" />}>
                <input
                  type="date"
                  value={tglAwal}
                  onChange={(e) => setTglAwal(e.target.value)}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none focus:border-red-300"
                />
              </Field>

              <Field label="Tanggal Akhir" icon={<CalendarDays className="h-4 w-4" />}>
                <input
                  type="date"
                  value={tglAkhir}
                  onChange={(e) => setTglAkhir(e.target.value)}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none focus:border-red-300"
                />
              </Field>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500 px-5 py-3 text-sm font-extrabold text-white shadow-md hover:bg-red-600 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "Menyimpan..." : "Simpan Diskon"}
            </button>
          </form>
        </div>
      )}

      {/* List lokal */}
      {filtered.length === 0 ? (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-600">
            Belum ada diskon (list lokal kosong). Tambahkan lewat form.
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((it) => (
            <div
              key={it.id}
              className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100">
                  <BadgePercent className="h-5 w-5" />
                </div>

                <div className="rounded-full bg-red-500 px-3 py-1 text-xs font-extrabold text-white">
                  {it.persentase_diskon}%
                </div>
              </div>

              <div className="mt-3 text-lg font-extrabold text-slate-900">{it.nama_diskon}</div>

              <div className="mt-3 grid gap-2 text-xs font-semibold text-slate-600">
                <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                  <div className="text-[11px] text-slate-400">Mulai</div>
                  <div className="mt-1 font-extrabold text-slate-900">
                    {formatDateTime(it.tanggal_awal)}
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                  <div className="text-[11px] text-slate-400">Berakhir</div>
                  <div className="mt-1 font-extrabold text-slate-900">
                    {formatDateTime(it.tanggal_akhir)}
                  </div>
                </div>
              </div>

              {it.id > 0 ? (
                <Link
                  href={`/admin/dashboard/diskon/${it.id}`}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-extrabold text-white hover:bg-slate-800"
                >
                  Detail
                </Link>
              ) : (
                <div className="mt-4 rounded-2xl bg-amber-50 p-3 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                  Diskon ini tersimpan lokal (id server belum ada).
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-slate-500">{label}</p>
          <div className="mt-3">{children}</div>
        </div>
      </div>
    </div>
  );
}