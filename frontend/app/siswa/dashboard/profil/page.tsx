"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, User, Phone, AtSign, MapPin, IdCard } from "lucide-react";
import { getRoleSession } from "@/lib/auth";

const BASE_URL = "https://ukk-p2.smktelkom-mlg.sch.id/api/";
const MAKER_ID = "1";

type ProfileResponse = any;

function pickProfilePayload(data: any) {
  return data?.data ?? data?.profile ?? data?.siswa ?? data;
}

function getField(obj: any, keys: string[], fallback = "—") {
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === "string" && v.trim() !== "") return v;
    if (typeof v === "number") return String(v);
  }
  return fallback;
}

function imgUrl(path: string | null | undefined) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `https://ukk-p2.smktelkom-mlg.sch.id/${path}`;
}

export default function ProfilSiswaPage() {
  const session = useMemo(() => getRoleSession("siswa"), []);
  const token =
    session?.token ??
    session?.access_token ??
    session?.data?.token ??
    session?.data?.access_token;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    let alive = true;

    async function loadProfile() {
      setLoading(true);
      setErr("");

      try {
        const res = await fetch(`${BASE_URL}get_profile`, {
          method: "GET",
          headers: {
            makerID: MAKER_ID,
            ...(token ? { Authorization: `Bearer ${token}`, token } : {}),
          },
        });

        const data: ProfileResponse | null = await res.json().catch(() => null);

        if (!res.ok || data?.status === false) {
          throw new Error(data?.message ?? `Gagal mengambil profil (HTTP ${res.status})`);
        }

        if (!alive) return;
        setProfile(pickProfilePayload(data));
      } catch (e: any) {
        console.error("get_profile error:", e);
        if (!alive) return;
        setErr(e?.message ?? "Gagal mengambil profil siswa 😢");
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      alive = false;
    };
  }, [token]);

  const nama = getField(profile, ["nama_siswa", "nama", "name", "username"]);
  const username = getField(profile, ["username", "user", "nama_user"]);
  const telp = getField(profile, ["telp", "telepon", "phone"]);
  const alamat = getField(profile, ["alamat", "address"]);
  const idSiswa = getField(profile, ["id_siswa", "id", "idsiswa"]);
  const foto = imgUrl(profile?.foto ?? profile?.photo ?? profile?.avatar);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">Siswa Panel</p>
          <h1 className="text-2xl font-extrabold text-slate-900">Profil Siswa</h1>
          <p className="mt-1 text-sm text-slate-500">
            Data profil diambil dari endpoint <b>get_profile</b>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/siswa/dashboard"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>

         
        </div>
      </div>

      {/* Card */}
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-red-100">
            {foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={foto} alt="Siswa" className="h-full w-full object-cover" />
            ) : (
              <Image
                src="/image/mage.png"
                alt="placeholder"
                fill
                className="object-contain p-2 opacity-40"
              />
            )}
          </div>

          <div>
            <p className="text-base font-extrabold text-slate-900">Ringkasan Profil</p>
            <p className="text-xs font-semibold text-slate-500">
              Data diambil dari <b>get_profile</b>
            </p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-600">
            Mengambil data profil siswa...
          </div>
        ) : err ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
            {err}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoRow icon={<User className="h-5 w-5" />} label="Nama Siswa" value={nama} />
            <InfoRow icon={<AtSign className="h-5 w-5" />} label="Username" value={username} />
            <InfoRow icon={<Phone className="h-5 w-5" />} label="Telepon" value={telp} />
            <InfoRow icon={<MapPin className="h-5 w-5" />} label="Alamat" value={alamat} />
            <InfoRow icon={<IdCard className="h-5 w-5" />} label="ID Siswa" value={idSiswa} />

            <div className="md:col-span-2 mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs font-semibold text-slate-600">
              Jika data tidak muncul: pastikan kamu login sebagai <b>siswa</b> dan token tersimpan di session.
            </div>

            {/* Optional: tombol edit juga di bawah card */}
            <div className="md:col-span-2 mt-2 flex justify-end">
              <Link
                href="/siswa/dashboard/profil/edit"
                className="inline-flex items-center gap-2 rounded-2xl bg-red-500 px-5 py-3 text-sm font-extrabold text-white hover:bg-red-600"
              >
                ✏️ Edit Profil
              </Link>
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