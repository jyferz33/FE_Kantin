"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api, postForm } from "@/lib/api";
import { ArrowLeft, Save } from "lucide-react";

const STAN_ID = 2;

type StanResponse = any;

function pickStanPayload(data: any) {
  return data?.data ?? data?.stan ?? data;
}

function getField(obj: any, keys: string[], fallback = "") {
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === "string" && v.trim() !== "") return v;
    if (typeof v === "number") return String(v);
  }
  return fallback;
}

export default function ProfilStanEditPage() {
  const router = useRouter();

  const [namaStan, setNamaStan] = useState("");
  const [namaPemilik, setNamaPemilik] = useState("");
  const [telp, setTelp] = useState("");
  const [username, setUsername] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const canSave = useMemo(() => {
    return (
      !saving &&
      namaStan.trim() &&
      namaPemilik.trim() &&
      telp.trim() &&
      username.trim()
    );
  }, [saving, namaStan, namaPemilik, telp, username]);

  useEffect(() => {
    let alive = true;

    async function loadStan() {
      setLoading(true);
      try {
        const data = await api<StanResponse>("get_stan", { method: "GET" });
        if (!alive) return;

        const stan = pickStanPayload(data);
        setNamaStan(getField(stan, ["nama_stan", "namaStan"], ""));
        setNamaPemilik(getField(stan, ["nama_pemilik", "namaPemilik"], ""));
        setTelp(getField(stan, ["telp", "telepon", "phone"], ""));
        setUsername(getField(stan, ["username", "user"], ""));
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

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!namaStan.trim() || !namaPemilik.trim() || !telp.trim() || !username.trim()) {
      alert("Semua field wajib diisi 😊");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        nama_stan: namaStan.trim(),
        nama_pemilik: namaPemilik.trim(),
        telp: telp.trim(),
        username: username.trim(),
      };

      const res = await postForm<any>(`update_stan/${STAN_ID}`, payload);

      const ok =
        res?.status === true ||
        res?.success === true ||
        res?.code === 200 ||
        res?.message?.toLowerCase?.().includes("berhasil");

      alert(ok ? "Berhasil update profil stan ✅" : "Update berhasil ✅");
      router.push("/admin/dashboard/profil-stan"); // balik ke VIEW
    } catch (err: any) {
      console.error("update_stan error:", err);
      alert(err?.message || "Gagal update profil stan 😢");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">Admin Panel</p>
          <h1 className="text-2xl font-extrabold text-slate-900">Edit Profil Stan</h1>
          <p className="mt-1 text-sm text-slate-500">
            Data diambil dari <b>get_stan</b> dan disimpan lewat <b>update_stan/{STAN_ID}</b>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/dashboard/profil-stan"
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
            <Image src="/image/areng.jpeg" alt="Admin" fill className="object-cover" />
          </div>
          <div>
            <p className="text-base font-extrabold text-slate-900">Form Edit</p>
            <p className="text-xs font-semibold text-slate-500">
              Update: nama stan, pemilik, telp, username
            </p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-600">
            Mengambil data stan...
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-5">
            <Field
              label="Nama Stan"
              value={namaStan}
              onChange={setNamaStan}
              placeholder='contoh: "pecel madiun"'
              disabled={saving}
            />

            <Field
              label="Nama Pemilik"
              value={namaPemilik}
              onChange={setNamaPemilik}
              placeholder='contoh: "pecel agung jaya"'
              disabled={saving}
            />

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field
                label="Telepon"
                value={telp}
                onChange={setTelp}
                placeholder='contoh: "098765678"'
                disabled={saving}
              />
              <Field
                label="Username"
                value={username}
                onChange={setUsername}
                placeholder='contoh: "pecel"'
                disabled={saving}
              />
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
              <button
                type="submit"
                disabled={!canSave}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-500 px-6 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-red-600 disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>

              <Link
                href="/admin/dashboard/profil-stan"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Batal
              </Link>

              <p className="text-xs font-semibold text-slate-500 sm:ml-auto">
                Data: <span className="font-bold">get_stan</span> • Update:{" "}
                <span className="font-bold">update_stan/{STAN_ID}</span>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {props.label}
      </label>
      <input
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-red-300 focus:ring-4 focus:ring-red-100"
        disabled={props.disabled}
      />
    </div>
  );
}