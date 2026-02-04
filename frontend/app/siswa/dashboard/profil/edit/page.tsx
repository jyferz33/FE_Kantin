"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getRoleSession } from "@/lib/auth";
import { ArrowLeft, Save, User, Phone, AtSign, MapPin, Camera } from "lucide-react";

const BASE_URL = "https://ukk-p2.smktelkom-mlg.sch.id/api/";
const MAKER_ID = "1";

type ProfileResponse = any;

function pickToken(session: any) {
  return (
    session?.token ??
    session?.access_token ??
    session?.data?.token ??
    session?.data?.access_token
  );
}

function pickProfilePayload(data: any) {
  return data?.data ?? data?.profile ?? data?.siswa ?? data;
}

function getField(obj: any, keys: string[], fallback = "") {
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

export default function ProfilSiswaEditPage() {
  const router = useRouter();
  const session = useMemo(() => getRoleSession("siswa"), []);
  const token = pickToken(session);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // data profile
  const [idSiswa, setIdSiswa] = useState<number | null>(null);
  const [namaSiswa, setNamaSiswa] = useState("");
  const [alamat, setAlamat] = useState("");
  const [telp, setTelp] = useState("");
  const [username, setUsername] = useState("");
  const [fotoOld, setFotoOld] = useState<string | null>(null);

  // foto baru
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  useEffect(() => {
    // cleanup preview url
    return () => {
      if (fotoPreview) URL.revokeObjectURL(fotoPreview);
    };
  }, [fotoPreview]);

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
          throw new Error(data?.message ?? `Gagal ambil profil (HTTP ${res.status})`);
        }

        const p = pickProfilePayload(data);

        if (!alive) return;

        const id = Number(p?.id_siswa ?? p?.id ?? 0) || null;
        setIdSiswa(id);

        setNamaSiswa(getField(p, ["nama_siswa", "nama", "name"], ""));
        setAlamat(getField(p, ["alamat", "address"], ""));
        setTelp(getField(p, ["telp", "telepon", "phone"], ""));
        setUsername(getField(p, ["username", "user"], ""));

        const foto = p?.foto ?? p?.photo ?? p?.avatar ?? null;
        setFotoOld(foto ? String(foto) : null);
      } catch (e: any) {
        console.error("get_profile error:", e);
        if (!alive) return;
        setErr(e?.message ?? "Gagal mengambil data profil 😢");
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      alive = false;
    };
  }, [token]);

  function onPickFoto(file: File | null) {
    setFotoFile(file);
    if (fotoPreview) URL.revokeObjectURL(fotoPreview);

    if (file) {
      setFotoPreview(URL.createObjectURL(file));
    } else {
      setFotoPreview(null);
    }
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setErr("");

    if (!token) return setErr("Token siswa tidak ditemukan. Login ulang dulu ya.");
    if (!idSiswa) return setErr("ID siswa tidak ditemukan dari get_profile.");
    if (!namaSiswa || !alamat || !telp || !username) {
      return setErr("Semua field wajib diisi.");
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("nama_siswa", namaSiswa);
      fd.append("alamat", alamat);
      fd.append("telp", telp);
      fd.append("username", username);
      if (fotoFile) fd.append("foto", fotoFile);

      const res = await fetch(`${BASE_URL}update_siswa/${idSiswa}`, {
        method: "POST",
        headers: {
          makerID: MAKER_ID,
          Authorization: `Bearer ${token}`,
          token: token,
          // NOTE: jangan set Content-Type manual, biar browser isi boundary form-data
        },
        body: fd,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || data?.status === false) {
        throw new Error(data?.message ?? `Gagal update profil (HTTP ${res.status})`);
      }

      alert(data?.message ?? "Profil berhasil diupdate ✅");
      router.push("/siswa/dashboard/profil");
      router.refresh?.();
    } catch (e: any) {
      console.error(e);
      setErr(e?.message ?? "Gagal update profil 😢");
    } finally {
      setSaving(false);
    }
  }

  const currentPhoto = fotoPreview ?? imgUrl(fotoOld);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">Siswa Panel</p>
          <h1 className="text-2xl font-extrabold text-slate-900">Edit Profil Siswa</h1>
          <p className="mt-1 text-sm text-slate-500">
            Update data via endpoint <b>update_siswa/{`{id}`}</b>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/siswa/dashboard/profil"
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
            {currentPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={currentPhoto} alt="Foto Siswa" className="h-full w-full object-cover" />
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
            <p className="text-base font-extrabold text-slate-900">Form Edit Profil</p>
            <p className="text-xs font-semibold text-slate-500">
              ID siswa: <b>{idSiswa ?? "—"}</b>
            </p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-600">
            Mengambil data profil...
          </div>
        ) : (
          <form onSubmit={onSave} className="space-y-4">
            {err ? (
              <div className="rounded-2xl border border-purple-200 bg-purple-50 p-4 text-sm font-semibold text-purple-700">
                {err}
              </div>
            ) : null}

            {/* Foto */}
            <div className="rounded-2xl border border-slate-200 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-purple-100 text-purple-600">
                    <Camera className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-slate-900">Foto Profil</p>
                    <p className="text-xs font-semibold text-slate-500">
                      Upload foto baru (opsional)
                    </p>
                  </div>
                </div>

                <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-extrabold text-white hover:bg-slate-800">
                  Pilih Foto
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onPickFoto(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>

              {fotoFile ? (
                <div className="mt-3 text-xs font-semibold text-slate-600">
                  File dipilih: <b>{fotoFile.name}</b>
                </div>
              ) : (
                <div className="mt-3 text-xs font-semibold text-slate-500">
                  Tidak ada file baru dipilih.
                </div>
              )}
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field
                icon={<User className="h-5 w-5" />}
                label="Nama Siswa"
                value={namaSiswa}
                onChange={setNamaSiswa}
                placeholder="Nama siswa"
              />

              <Field
                icon={<AtSign className="h-5 w-5" />}
                label="Username"
                value={username}
                onChange={setUsername}
                placeholder="Username"
              />

              <Field
                icon={<Phone className="h-5 w-5" />}
                label="Telepon"
                value={telp}
                onChange={setTelp}
                placeholder="08xxxxxxxxxx"
              />

              <Field
                icon={<MapPin className="h-5 w-5" />}
                label="Alamat"
                value={alamat}
                onChange={setAlamat}
                placeholder="Alamat"
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-purple-700 disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs font-semibold text-slate-600">
              Kalau backend menolak upload, coba simpan tanpa foto dulu untuk cek field lain.
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  icon,
  label,
  value,
  onChange,
  placeholder,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-purple-50 text-purple-600">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-slate-500">{label}</p>
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none focus:border-purple-500"
          />
        </div>
      </div>
    </div>
  );
}