// components/siswa/HeaderSiswa.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useCart } from "@/components/siswa/cart-provider";
import { getRoleSession } from "@/lib/auth";

const BASE_URL = "https://ukk-p2.smktelkom-mlg.sch.id/api/";
const MAKER_ID = "1";

type ProfileResponse = any;

function pickProfilePayload(data: any) {
  return data?.data ?? data?.profile ?? data?.siswa ?? data;
}

function getField(obj: any, keys: string[], fallback = "Siswa") {
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

export default function HeaderSiswa() {
  const { totalQty, open } = useCart();

  const session = useMemo(() => getRoleSession("siswa"), []);
  const token =
    session?.token ??
    session?.access_token ??
    session?.data?.token ??
    session?.data?.access_token;

  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    let alive = true;

    async function loadProfile() {
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
          throw new Error(
            data?.message ?? `Gagal mengambil profil (HTTP ${res.status})`
          );
        }

        if (!alive) return;
        setProfile(pickProfilePayload(data));
      } catch (e) {
        // kalau gagal, biar header tetap tampil tanpa error ngeblok
        if (!alive) return;
        setProfile(null);
      }
    }

    loadProfile();
    return () => {
      alive = false;
    };
  }, [token]);

  // ✅ ambil nama & foto persis seperti halaman profil
  const nama = getField(profile, ["nama_siswa", "nama", "name", "username"], "Siswa");
  const foto = imgUrl(profile?.foto ?? profile?.photo ?? profile?.avatar);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="flex items-center justify-between px-6 py-4">
        {/* LEFT: Hello, Name */}
        <div className="min-w-0">
          <div className="text-3xl font-extrabold text-slate-900">
            Hello, <span className="text-purple-700">{nama}</span>
            <span className="text-black"> Selamat Datang</span>
          </div>
        </div>

        {/* RIGHT: Cart + Avatar */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={open}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-800 hover:bg-purple-50"
          >
            Keranjang ({totalQty})
          </button>

          {/* Avatar bulat */}
          <div className="relative h-11 w-11 overflow-hidden rounded-full ring-2 ring-purple-200 bg-slate-100">
            {foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={foto}
                alt="Foto Profil"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/image/user.png";
                }}
              />
            ) : (
              <Image
                src="/image/user.png"
                alt="User"
                fill
                className="object-contain p-1 opacity-80"
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
