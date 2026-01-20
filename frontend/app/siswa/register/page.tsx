"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterSiswaPage() {
    const router = useRouter();

    const [namaSiswa, setNamaSiswa] = useState("");
    const [alamat, setAlamat] = useState("");
    const [telp, setTelp] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [foto, setFoto] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!namaSiswa || !alamat || !telp || !username || !password) {
            alert("Semua field wajib diisi.");
            return;
        }

        if (!foto) {
            alert("Foto wajib diupload.");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("nama_siswa", namaSiswa);
            formData.append("alamat", alamat);
            formData.append("telp", telp);
            formData.append("username", username);
            formData.append("password", password);
            formData.append("foto", foto); // penting: key harus "foto" sesuai curl

            const res = await fetch(
                "https://ukk-p2.smktelkom-mlg.sch.id/api/register_siswa",
                {
                    method: "POST",
                    headers: {
                        makerID: "1",
                    },
                    body: formData,
                }
            );

            const raw = await res.text();
            let data: any = null;

            try {
                data = JSON.parse(raw);
            } catch {
                data = raw;
            }

            // deteksi sukses fleksibel (karena format response bisa berbeda)
            const isSuccess =
                res.ok &&
                (data?.status === true ||
                    data?.success === true ||
                    data?.code === 200 ||
                    data?.message?.toLowerCase?.().includes("berhasil") ||
                    data?.msg?.toLowerCase?.().includes("berhasil") ||
                    (typeof data === "object" && data !== null));

            if (isSuccess) {
                alert("Register berhasil! Silakan login.");
                router.push("/siswa/login");
            } else {
                alert("Register gagal!");
                console.log("Register gagal response:", data);
            }
        } catch (err) {
            alert("Register gagal! (Network / CORS / Server error)");
            console.error("Error register:", err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-white">
            <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
                {/* LEFT - IMAGE */}
                <section className="relative hidden lg:block h-screen w-full">
                    <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-violet-500 to-indigo-500">
                        {/* Clouds */}
                        <div className="absolute -left-20 top-10 h-28 w-72 rounded-full bg-white/30 blur-sm" />
                        <div className="absolute -right-24 top-16 h-32 w-80 rounded-full bg-white/30 blur-sm" />
                        <div className="absolute left-10 bottom-14 h-28 w-72 rounded-full bg-white/25 blur-sm" />
                        <div className="absolute right-10 bottom-8 h-24 w-60 rounded-full bg-white/20 blur-sm" />

                        {/* Image */}
                        <div className="absolute inset-0 flex items-center justify-center px-10">
                            <div
                                className="relative"
                                style={{ width: "1400px", height: "700px" }}
                            >
                                <Image
                                    src="/image/3dKantin.png"
                                    alt="Kantin Illustration"
                                    fill
                                    priority
                                    className="object-contain"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* RIGHT - FORM */}
                <section className="flex items-center justify-start px-8 py-12 lg:px-20 lg:pr-20">
                    <div className="w-full max-w-xl">
                        {/* Brand */}
                        <div className="mb-10 flex items-center gap-3">
  <span className="h-3 w-3 rounded-sm bg-violet-600" />
  <span className="text-base font-semibold text-slate-700">

                                KantinKu
                            </span>
                        </div>

                        <h1 className="text-4xl font-extrabold text-slate-900 lg:text-5xl">
                            Daftar
                        </h1>
                        <h2 className="text-4xl font-extrabold text-purple-600 lg:text-5xl">
                            Akun Siswa
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Lengkapi data untuk membuat akun siswa.
                        </p>

                        <form onSubmit={handleRegister} className="mt-8 space-y-4">
                            <input
                                type="text"
                                placeholder="Nama Siswa"
                                value={namaSiswa}
                                onChange={(e) => setNamaSiswa(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                            />

                            <input
                                type="text"
                                placeholder="Alamat"
                                value={alamat}
                                onChange={(e) => setAlamat(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                            />

                            <input
                                type="tel"
                                placeholder="No. Telepon"
                                value={telp}
                                onChange={(e) => setTelp(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                            />

                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                            />

                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                            />

                            {/* Upload */}
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">
                                    Upload Foto
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
                                    className="block w-full rounded-lg border border-slate-200 px-4 py-2 text-xs file:mr-3 file:rounded-md file:border-0 file:bg-violet-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-violet-700"
                                />
                                <p className="mt-1 text-xs text-slate-400">
                                    JPG / PNG / WebP
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-4 w-48 rounded-lg bg-violet-600 px-6 py-4 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
                            >
                                {loading ? "Loading..." : "Daftar"}
                            </button>

                            <p className="pt-4 text-xs text-slate-500">
                                Sudah punya akun?{" "}
                                <Link
                                    href="/siswa/login"
                                    className="font-semibold text-violet-600 hover:underline"
                                >
                                    Login di sini
                                </Link>
                            </p>
                        </form>
                    </div>

                </section>
            </div>
        </main>
    );
}
