"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveRoleSession } from "@/lib/auth";

export default function Home() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!username || !password) {
      alert("Username dan password wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      const res = await fetch(
        "https://ukk-p2.smktelkom-mlg.sch.id/api/login_siswa",
        {
          method: "POST",
          headers: {
            makerID: "1",
          },
          body: formData,
        }
      );

      // kadang API balikin text biasa, jadi aman pakai text dulu
      const raw = await res.text();
      let data: any = null;

      try {
        data = JSON.parse(raw);
      } catch {
        data = raw;
      }

      // ====== Deteksi sukses yang fleksibel (karena kita belum tahu format response pasti) ======
      const isSuccess =
        res.ok &&
        (data?.status === true ||
          data?.success === true ||
          data?.code === 200 ||
          data?.message?.toLowerCase?.().includes("berhasil") ||
          data?.msg?.toLowerCase?.().includes("berhasil") ||
          // fallback: kalau res.ok tapi tidak ada status field
          (typeof data === "object" && data !== null));

      if (isSuccess) {
  // ✅ simpan session + token siswa
  saveRoleSession("siswa", data);

  alert("Login berhasil!");
  router.push("/siswa/dashboard");
} else {
  alert("Login gagal!");
  console.log("Login gagal response:", data);
}

    } catch (err) {
      alert("Login gagal! (Network / CORS / Server error)");
      console.error("Error login:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
        <section className="flex items-center justify-center px-8 py-12 lg:px-20">
          <div className="w-full max-w-xl">
            <div className="mb-14 flex items-center gap-3">
              <span className="h-3 w-3 rounded-sm bg-violet-600" />
              <span className="text-base font-semibold text-slate-700">
                KantinKu
              </span>
            </div>

            <h1 className="text-5xl font-extrabold leading-tight text-slate-900 lg:text-6xl">
              Selamat Datang
            </h1>
            <h1 className="text-5xl font-extrabold leading-tight text-purple-600 lg:text-6xl">
              Di Kantin Online
            </h1>

            <p className="mt-4 text-base text-slate-500 lg:text-lg">
              Silakan masukkan username dan password anda
            </p>

            {/* ✅ pakai onSubmit */}
            <form onSubmit={handleLogin} className="mt-12 space-y-5">
              <div>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-5 py-4 text-base text-slate-800 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                />
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-5 py-4 text-base text-slate-800 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-3 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                    defaultChecked
                  />
                  Remember me
                </label>

                <button
                  type="button"
                  className="text-sm font-medium text-slate-500 hover:text-violet-600"
                >
                  Forgot Password?
                </button>
              </div>

              {/* ✅ tombol submit untuk login */}
              <button
                type="submit"
                disabled={loading}
                className="mt-3 inline-flex w-44 items-center justify-center rounded-xl bg-violet-600 px-6 py-4 text-center text-base font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Loading..." : "Sign In"}
              </button>

              <p className="pt-10 text-sm text-slate-500">
                Don&apos;t have an account?{" "}
                <Link
                  href="/siswa/register"
                  className="font-semibold text-violet-600 hover:underline"
                >
                  Sign Up
                </Link>
              </p>
            </form>
          </div>
        </section>

        <section className="relative hidden lg:block h-screen w-full">
          <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-violet-500 to-indigo-500">
            <div className="absolute -left-20 top-10 h-28 w-72 rounded-full bg-white/30 blur-sm" />
            <div className="absolute -right-24 top-16 h-32 w-80 rounded-full bg-white/30 blur-sm" />
            <div className="absolute left-10 bottom-14 h-28 w-72 rounded-full bg-white/25 blur-sm" />
            <div className="absolute right-10 bottom-8 h-24 w-60 rounded-full bg-white/20 blur-sm" />

            <div className="absolute inset-0 flex items-center justify-center px-10">
              <div
                className="relative"
                style={{
                  width: "1500px",
                  height: "700px",
                }}
              >
                <Image
                  src="/image/3dKantin.png"
                  alt="Illustration"
                  fill
                  priority
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
