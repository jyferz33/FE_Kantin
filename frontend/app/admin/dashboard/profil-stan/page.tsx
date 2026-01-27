"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import { ArrowLeft, Pencil, Store, User, Phone, AtSign } from "lucide-react";

type StanResponse = any;

function pickStanPayload(data: any) {
  return data?.data ?? data?.stan ?? data;
}

function getField(obj: any, keys: string[], fallback = "—") {
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === "string" && v.trim() !== "") return v;
    if (typeof v === "number") return String(v);
  }
  return fallback;
}

export default function ProfilStanViewPage() {
  const [loading, setLoading] = useState(true);
  const [stan, setStan] = useState<any>(null);

  useEffect(() => {
    let alive = true;

    async function loadStan() {
      setLoading(true);
      try {
        const data = await api<StanResponse>("get_stan", { method: "GET" });
        if (!alive) return;
        setStan(pickStanPayload(data));
      } catch (err: any) {
        console.error("get_stan error:", err);
        alert(err?.message || "Gagal mengambil data stan 😢");
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadStan();
    return () => {
      alive = false;
    };
  }, []);

  const namaStan = getField(stan, ["nama_stan", "namaStan"]);
  const namaPemilik = getField(stan, ["nama_pemilik", "namaPemilik"]);
  const telp = getField(stan, ["telp", "telepon", "phone"]);
  const username = getField(stan, ["username", "user"]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">Admin Panel</p>
          <h1 className="text-2xl font-extrabold text-slate-900">Profil Stan</h1>
          <p className="mt-1 text-sm text-slate-500">
            Halaman ini hanya untuk melihat data. Untuk mengubah, masuk ke mode edit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>

          <Link
            href="/admin/dashboard/profil-stan/edit"
            className="inline-flex items-center gap-2 rounded-2xl bg-red-500 px-4 py-2 text-sm font-extrabold text-white shadow-sm hover:bg-red-600"
          >
            <Pencil className="h-4 w-4" />
            Edit Profil
          </Link>
        </div>
      </div>

      {/* Card */}
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-red-100">
            <Image src="/image/areng.jpeg" alt="Admin" fill className="object-cover" />
          </div>
          <div>
            <p className="text-base font-extrabold text-slate-900">Ringkasan Profil</p>
            <p className="text-xs font-semibold text-slate-500">
              Data diambil dari <b>get_stan</b>
            </p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-600">
            Mengambil data stan...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoRow icon={<Store className="h-5 w-5" />} label="Nama Stan" value={namaStan} />
            <InfoRow icon={<User className="h-5 w-5" />} label="Nama Pemilik" value={namaPemilik} />
            <InfoRow icon={<Phone className="h-5 w-5" />} label="Telepon" value={telp} />
            <InfoRow icon={<AtSign className="h-5 w-5" />} label="Username" value={username} />

            <div className="md:col-span-2 mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs font-semibold text-slate-600">
              Untuk mengubah data, klik tombol <b>Edit Profil</b>.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-red-50 text-red-600">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-500">{label}</p>
          <p className="mt-1 truncate text-base font-extrabold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}