"use client";

import { useEffect, useMemo, useState } from "react";
import { api, postForm } from "@/lib/api";

type Siswa = any;

function pickId(r: any) {
  return r?.id_siswa ?? r?.id ?? r?.id_user ?? null;
}

export default function CrudSiswaStandPage() {
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<Siswa[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // modal edit
  const [openEdit, setOpenEdit] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // form (dipakai untuk tambah & edit)
  const [nama_siswa, setNama] = useState("");
  const [alamat, setAlamat] = useState("");
  const [telp, setTelp] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [foto, setFoto] = useState<File | null>(null);

  const canSubmit = useMemo(() => {
    return nama_siswa.trim() && alamat.trim() && telp.trim() && username.trim();
  }, [nama_siswa, alamat, telp, username]);

  function resetForm() {
    setNama("");
    setAlamat("");
    setTelp("");
    setUsername("");
    setPassword("");
    setFoto(null);
    setEditingId(null);
  }

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const res = await postForm<any>("get_siswa", { search });
      const list = res?.data || res?.result || res || [];
      setRows(Array.isArray(list) ? list : []);
    } catch (e: any) {
      setErr(e.message);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  async function tambah() {
    setErr("");
    if (!canSubmit || !password.trim()) {
      setErr("Form belum lengkap (password wajib untuk tambah).");
      return;
    }
    setLoading(true);
    try {
      await postForm<any>("tambah_siswa", {
        nama_siswa,
        alamat,
        telp,
        username,
        password,
        foto: foto ?? undefined,
      });
      resetForm();
      await load();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(r: any) {
    const id = Number(pickId(r));
    if (!id) return;

    setEditingId(id);
    setNama(r?.nama_siswa ?? r?.nama ?? "");
    setAlamat(r?.alamat ?? "");
    setTelp(r?.telp ?? r?.telepon ?? "");
    setUsername(r?.username ?? "");
    setPassword(""); // edit: password opsional (kalau backend mendukung)
    setFoto(null);
    setOpenEdit(true);
  }

  async function simpanEdit() {
    setErr("");
    if (!editingId) return;
    if (!canSubmit) {
      setErr("Form edit belum lengkap.");
      return;
    }

    setLoading(true);
    try {
      // ubah_siswa/:id dari dokumentasi kamu
      await postForm<any>(`ubah_siswa/${editingId}`, {
        nama_siswa,
        alamat,
        telp,
        username,
        // password tidak ada di contoh edit; jadi kita kirim kalau diisi saja
        password: password.trim() ? password : undefined,
        foto: foto ?? undefined,
      });
      setOpenEdit(false);
      resetForm();
      await load();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function hapus(id: number) {
    setErr("");
    const ok = confirm(`Hapus siswa ID ${id}?`);
    if (!ok) return;

    setLoading(true);
    try {
      await api<any>(`hapus_siswa/${id}`, { method: "DELETE" });
      await load();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-500">Stand / Admin</div>
            <h1 className="mt-2 text-2xl font-extrabold text-slate-900">CRUD Siswa</h1>
            <p className="mt-1 text-sm text-slate-500">
              Search, tambah, edit, hapus data siswa (termasuk foto).
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 shadow-sm" />
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
            placeholder='Search (contoh: "iwan")'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            onClick={load}
            className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-200"
          >
            {loading ? "Loading..." : "Cari"}
          </button>
        </div>

        {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
      </div>

      {/* Form tambah */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900">Tambah Siswa</div>
            <div className="text-xs text-slate-500">Password wajib saat tambah</div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100 text-black"
            placeholder="nama_siswa"
            value={nama_siswa}
            onChange={(e) => setNama(e.target.value)}
          />
          <input
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100 text-black"
            placeholder="alamat"
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
          />
          <input
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100 text-black"
            placeholder="telp"
            value={telp}
            onChange={(e) => setTelp(e.target.value)}
          />
          <input
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100 text-black"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100 text-black"
            placeholder="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100 text-black"
            type="file"
            accept="image/*"
            onChange={(e) => setFoto(e.target.files?.[0] || null)}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={tambah}
            className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-200 disabled:opacity-60"
            disabled={loading}
          >
            Tambah
          </button>
          <button
            onClick={() => {
              resetForm();
              setErr("");
            }}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-violet-100"
            disabled={loading}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="text-sm font-semibold text-slate-900">Daftar Siswa</div>
          <div className="text-xs text-slate-500">
            Klik Edit untuk ubah data. Klik Hapus untuk delete.
          </div>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-slate-600">
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Nama</th>
                <th className="px-5 py-3">Username</th>
                <th className="px-5 py-3">Telp</th>
                <th className="px-5 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r: any) => {
                const id = Number(pickId(r));
                return (
                  <tr key={id || Math.random()} className="border-t border-slate-100">
                    <td className="px-5 py-3 text-slate-700">{id || "-"}</td>
                    <td className="px-5 py-3 font-semibold text-slate-900">
                      {r?.nama_siswa ?? r?.nama ?? "-"}
                    </td>
                    <td className="px-5 py-3 text-slate-700">{r?.username ?? "-"}</td>
                    <td className="px-5 py-3 text-slate-700">{r?.telp ?? "-"}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => startEdit(r)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-violet-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => hapus(id)}
                          className="rounded-lg bg-red-600 px-3 py-1.5 font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-200"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                    Tidak ada data. Coba search kosong atau tambah siswa dulu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit */}
      {openEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Edit Siswa</div>
                <div className="text-xs text-slate-500">ID: {editingId}</div>
              </div>
              <button
                onClick={() => {
                  setOpenEdit(false);
                  setErr("");
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Tutup
              </button>
            </div>

            <div className="p-5">
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  placeholder="nama_siswa"
                  value={nama_siswa}
                  onChange={(e) => setNama(e.target.value)}
                />
                <input
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  placeholder="alamat"
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                />
                <input
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  placeholder="telp"
                  value={telp}
                  onChange={(e) => setTelp(e.target.value)}
                />
                <input
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <input
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  placeholder="password (opsional)"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <input
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFoto(e.target.files?.[0] || null)}
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={simpanEdit}
                  className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-200 disabled:opacity-60"
                  disabled={loading}
                >
                  Simpan
                </button>
                <button
                  onClick={() => {
                    setOpenEdit(false);
                    resetForm();
                    setErr("");
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-violet-100"
                  disabled={loading}
                >
                  Batal
                </button>
              </div>

              {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}