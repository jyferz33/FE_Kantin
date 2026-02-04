"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterAdminPage() {
  const router = useRouter();

  const [namaStan, setNamaStan] = useState("");
  const [namaPemilik, setNamaPemilik] = useState("");
  const [telp, setTelp] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!namaStan || !namaPemilik || !telp || !username || !password) {
      alert("Semua field wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("nama_stan", namaStan);
      formData.append("nama_pemilik", namaPemilik);
      formData.append("telp", telp);
      formData.append("username", username);
      formData.append("password", password);

      const res = await fetch(
        "https://ukk-p2.smktelkom-mlg.sch.id/api/register_stan",
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
        router.push("/admin/login");
      } else {
        alert("Register gagal!");
        console.log("Register admin gagal response:", data);
      }
    } catch (err) {
      alert("Register gagal! (Network / CORS / Server error)");
      console.error("Error register admin:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
        {/* LEFT - IMAGE */}
        <section className="relative hidden lg:block h-screen w-full">
          <div className="absolute inset-0 overflow-hidden bg-linear-to-br from-violet-500 to-indigo-500">
            {/* Clouds */}
            <div className="absolute -left-20 top-10 h-28 w-72 rounded-full bg-white/30 blur-sm" />
            <div className="absolute -right-24 top-16 h-32 w-80 rounded-full bg-white/30 blur-sm" />
            <div className="absolute left-10 bottom-14 h-28 w-72 rounded-full bg-white/25 blur-sm" />
            <div className="absolute right-10 bottom-8 h-24 w-60 rounded-full bg-white/20 blur-sm" />

            {/* Image */}
            <div className="absolute inset-0 flex items-center justify-center px-10">
              <div className="relative" style={{ width: "1400px", height: "700px" }}>
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
              Admin Stan
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Lengkapi data untuk membuat akun admin stan.
            </p>

            <form onSubmit={handleRegister} className="mt-8 space-y-4">
              <input
                type="text"
                placeholder="Nama Stan"
                value={namaStan}
                onChange={(e) => setNamaStan(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />

              <input
                type="text"
                placeholder="Nama Pemilik"
                value={namaPemilik}
                onChange={(e) => setNamaPemilik(e.target.value)}
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
                  href="/admin/login"
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
