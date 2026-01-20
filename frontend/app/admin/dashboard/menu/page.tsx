"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { api, postForm } from "@/lib/api";

type MenuItem = {
  id_menu?: number;
  id?: number;
  nama_makanan?: string;
  jenis?: "makanan" | "minuman" | string;
  harga?: string | number;
  deskripsi?: string;
  foto?: string;
  gambar?: string;
  [key: string]: any;
};

function formatRupiah(value: string | number | undefined) {
  const n = Number(value ?? 0);
  if (Number.isNaN(n)) return String(value ?? "");
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

function getId(item: MenuItem) {
  return item.id_menu ?? item.id ?? item.ID ?? item.Id;
}

function getFotoUrl(item: MenuItem) {
  const url = item.foto || item.gambar || item.image;
  if (!url) return "";

  // ✅ kalau absolute -> langsung pakai
  if (typeof url === "string" && url.startsWith("http")) return url;

  // ✅ kalau path sudah mengarah ke /images/... atau images/...
  const cleaned = String(url).replace(/^\/+/, "");

  // base domain (bukan /api)
  const base =
    process.env.NEXT_PUBLIC_API_URL ?? "https://ukk-p2.smktelkom-mlg.sch.id/api/";
  const root = base.replace(/\/api\/?$/, "/");

  return root + cleaned;
}


// ✅ ambil gambar lama dari URL dan ubah jadi File
async function urlToFile(url: string, filename = "foto.jpg") {
  const res = await fetch(url);
  const blob = await res.blob();

  const contentType = blob.type || "image/jpeg";
  const ext = contentType.includes("png")
    ? "png"
    : contentType.includes("webp")
    ? "webp"
    : contentType.includes("jpg") || contentType.includes("jpeg")
    ? "jpg"
    : "jpg";

  const finalName = filename.includes(".") ? filename : `${filename}.${ext}`;
  return new File([blob], finalName, { type: contentType });
}

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // search backend
  const [query, setQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  // modal/form state
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);

  const [nama, setNama] = useState("");
  const [jenis, setJenis] = useState<"makanan" | "minuman">("makanan");
  const [harga, setHarga] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [foto, setFoto] = useState<File | null>(null);

  // ✅ simpan foto lama saat edit
  const [existingFotoUrl, setExistingFotoUrl] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function fetchList(search = "") {
  setLoading(true);
  setError("");

  try {
    const res: any = await postForm<any>("showmenu", { search });

    // ✅ samakan seperti temanmu
    const list = res?.data || res?.result || res || [];
    setItems(Array.isArray(list) ? list : []);

    setActiveSearch(search);
  } catch (e: any) {
    setItems([]);
    setError(e?.message || "Gagal load daftar menu (showmenu).");
  } finally {
    setLoading(false);
  }
}


  useEffect(() => {
    fetchList("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resetForm() {
    setNama("");
    setJenis("makanan");
    setHarga("");
    setDeskripsi("");
    setFoto(null);
    setEditingId(null);
    setExistingFotoUrl("");
  }

  function openCreate() {
    setMode("create");
    resetForm();
    setOpen(true);
  }

  async function openEdit(item: MenuItem) {
    const id = getId(item);
    if (!id) {
      alert("ID menu tidak ditemukan di item ini.");
      return;
    }

    setMode("edit");
    setEditingId(id);
    setOpen(true);

    // isi cepat dari row dulu
    setNama(String(item.nama_makanan ?? ""));
    setJenis(
      (String(item.jenis ?? "makanan") as any) === "minuman" ? "minuman" : "makanan"
    );
    setHarga(String(item.harga ?? ""));
    setDeskripsi(String(item.deskripsi ?? ""));
    setFoto(null);

    // ✅ simpan url foto lama dari list
    setExistingFotoUrl(getFotoUrl(item));

    // optional: ambil detail lengkap
    try {
      const detail: any = await api<any>(`detail_menu/${id}`, { method: "GET" });
      const d = detail?.data ?? detail;
      if (d) {
        setNama(String(d.nama_makanan ?? item.nama_makanan ?? ""));
        setJenis(
          (String(d.jenis ?? item.jenis ?? "makanan") as any) === "minuman"
            ? "minuman"
            : "makanan"
        );
        setHarga(String(d.harga ?? item.harga ?? ""));
        setDeskripsi(String(d.deskripsi ?? item.deskripsi ?? ""));

        // ✅ kalau detail punya foto, pakai itu (lebih akurat)
        const urlDetail = getFotoUrl(d);
        if (urlDetail) setExistingFotoUrl(urlDetail);
      }
    } catch {
      // kalau gagal tidak masalah
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    if (!nama || !harga || !jenis) {
      alert("Nama, jenis, dan harga wajib diisi.");
      return;
    }

    setSaving(true);
    try {
      if (mode === "create") {
        if (!foto) {
          alert("Foto wajib diupload untuk tambah menu.");
          return;
        }

        await postForm("tambahmenu", {
          nama_makanan: nama,
          jenis,
          harga,
          deskripsi,
          foto,
        });
        alert("Menu berhasil ditambahkan!");
      } else {
        if (!editingId) {
          alert("ID menu tidak ditemukan.");
          return;
        }

        // ✅ Kalau user tidak upload foto baru, kirim foto lama (backend minta foto)
        let fotoToSend: File | undefined = foto ?? undefined;

        if (!fotoToSend && existingFotoUrl) {
          try {
            fotoToSend = await urlToFile(existingFotoUrl, `menu-${editingId}`);
          } catch {
            // jika gagal download, biarkan undefined => kemungkinan backend 400
          }
        }

        await postForm(`updatemenu/${editingId}`, {
          nama_makanan: nama,
          jenis,
          harga,
          deskripsi,
          foto: fotoToSend ?? undefined,
        });

        alert("Menu berhasil diupdate!");
      }

      setOpen(false);
      resetForm();
      await fetchList(activeSearch);
    } catch (e: any) {
      alert(`Gagal menyimpan menu: ${e?.message ?? "Unknown error"}`);
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    const ok = confirm("Yakin hapus menu ini?");
    if (!ok) return;

    setDeletingId(id);
    try {
      await api(`hapus_menu/${id}`, { method: "DELETE" });
      alert("Menu berhasil dihapus!");
      await fetchList(activeSearch);
    } catch (e: any) {
      alert(`Gagal hapus: ${e?.message ?? "Unknown error"}`);
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Data Makanan & Minuman
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Kelola menu stan: tambah, edit, hapus, dan upload foto.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari menu (backend)..."
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 sm:w-64"
          />

          <button
            type="button"
            onClick={() => fetchList(query)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cari
          </button>

          <button
            type="button"
            onClick={() => {
              setQuery("");
              fetchList("");
            }}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={openCreate}
            className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
          >
            + Tambah Menu
          </button>
        </div>
      </div>

      {/* Error */}
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <div className="font-semibold">Gagal memuat data.</div>
          <div className="mt-1">{error}</div>
          <div className="mt-3">
            <button
              onClick={() => fetchList(activeSearch)}
              className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700"
            >
              Coba lagi
            </button>
          </div>
        </div>
      ) : null}

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="text-sm font-semibold text-slate-900">Daftar Menu</div>
          <div className="text-xs text-slate-500">
            {loading ? "Loading..." : `${items.length} item`}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold text-slate-600">
              <tr>
                <th className="px-6 py-3">Foto</th>
                <th className="px-6 py-3">Nama</th>
                <th className="px-6 py-3">Jenis</th>
                <th className="px-6 py-3">Harga</th>
                <th className="px-6 py-3">Deskripsi</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td className="px-6 py-6 text-slate-500" colSpan={6}>
                    Memuat data...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td className="px-6 py-6 text-slate-500" colSpan={6}>
                    Data kosong.
                  </td>
                </tr>
              ) : (
                items.map((it, idx) => {
                  const id = getId(it);
                  const fotoUrl = getFotoUrl(it);
                  return (
                    <tr key={id ?? idx} className="border-t border-slate-100">
                      <td className="px-6 py-4">
                        <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                          {fotoUrl ? (
                            <Image
                              src={fotoUrl}
                              alt="foto"
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                              —
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {it.nama_makanan ?? "-"}
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
                          {it.jenis ?? "-"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-700">
                        {formatRupiah(it.harga)}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        <div className="max-w-[420px] truncate">
                          {it.deskripsi ?? "-"}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(it)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            disabled={!id || deletingId === id}
                            onClick={() => id && handleDelete(id)}
                            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                          >
                            {deletingId === id ? "Menghapus..." : "Hapus"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <div className="text-lg font-extrabold text-slate-900">
                  {mode === "create" ? "Tambah Menu" : "Edit Menu"}
                </div>
                <div className="text-sm text-slate-500">
                  Isi data menu makanan / minuman.
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  resetForm();
                }}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 px-6 py-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Nama Makanan/Minuman
                  </label>
                  <input
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="contoh: rujak"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Jenis
                  </label>
                  <select
                    value={jenis}
                    onChange={(e) => setJenis(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                  >
                    <option value="makanan">makanan</option>
                    <option value="minuman">minuman</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Harga
                  </label>
                  <input
                    value={harga}
                    onChange={(e) => setHarga(e.target.value)}
                    placeholder="contoh: 10000"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Foto (opsional saat edit)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
                    className="block w-full rounded-xl border border-slate-200 px-4 py-2 text-xs text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-600 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-violet-700"
                  />

                  {mode === "edit" && existingFotoUrl ? (
                    <div className="mt-2 flex items-center gap-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-slate-200">
                        <img
                          src={existingFotoUrl}
                          alt="foto lama"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="text-xs text-slate-500">
                        Foto lama akan tetap dipakai jika kamu tidak upload foto baru.
                      </div>
                    </div>
                  ) : null}

                  {mode === "create" ? (
                    <div className="mt-1 text-[11px] text-slate-400">
                      Foto wajib saat tambah menu.
                    </div>
                  ) : null}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Deskripsi
                </label>
                <textarea
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="contoh: makanan khas Indonesia..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    resetForm();
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
                >
                  {saving ? "Menyimpan..." : mode === "create" ? "Tambah" : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
