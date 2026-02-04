"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveRoleSession } from "@/lib/auth";

export default function AdminLoginPage() {
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
        "https://ukk-p2.smktelkom-mlg.sch.id/api/login_stan",
        {
          method: "POST",
          headers: { makerID: "1" },
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

      // ✅ ambil token dari berbagai kemungkinan response
      let token =
        data?.access_token ||
        data?.token ||
        data?.data?.access_token ||
        data?.data?.token ||
        data?.result?.access_token ||
        data?.result?.token ||
        "";

      if (typeof token === "string" && token.startsWith("Bearer ")) {
        token = token.replace(/^Bearer\s+/i, "");
      }

      if (res.ok && token) {
        // ✅ penting: role harus "stan" (bukan "stand")
        // supaya tersimpan ke: stan_token, stan_session (sesuai lib/auth kamu)
        saveRoleSession("stand", data);


        alert("Login admin stan berhasil!");
        router.push("/admin/dashboard");
      } else {
        alert(data?.message || "Login gagal (token tidak ditemukan).");
        console.log("Login admin gagal response:", data);
      }
    } catch (err) {
      alert("Login gagal! (Network / CORS / Server error)");
      console.error("Error login admin:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
        {/* LEFT - FORM */}
        <section className="flex items-center justify-center px-8 py-12 lg:px-20">
          <div className="w-full max-w-xl">
            {/* Brand */}
            <div className="-ml-6 mb-3">
              <img
                src="/image/kantinlogo.png"
                alt="KantinKu"
                className="h-28 w-auto object-contain lg:h-32"
              />
            </div>

            <h1 className="text-5xl font-extrabold leading-tight text-slate-900 lg:text-6xl">
              Login
            </h1>
            <h2 className="text-5xl font-extrabold leading-tight text-purple-600 lg:text-6xl">
              Admin Stan
            </h2>

            <p className="mt-4 text-base text-slate-500 lg:text-lg">
              Silakan masukkan username dan password admin.
            </p>

            <form onSubmit={handleLogin} className="mt-12 space-y-5">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-5 py-4 text-base text-slate-800 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-5 py-4 text-base text-slate-800 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              />

              <button
                type="submit"
                disabled={loading}
                className="whitespace-nowrap mt-3 inline-flex w-44 items-center justify-center rounded-xl bg-violet-600 px-72 py-4 text-center text-base font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Loading..." : "Sign In"}
              </button>

              <p className="pt-1 text-sm text-slate-500">
                Don&apos;t have an account?{" "}
                <Link
                  href="/admin/register"
                  className="font-semibold text-violet-600 hover:underline"
                >
                  Sign Up
                </Link>
              </p>
            </form>
          </div>
        </section>

        {/* RIGHT - IMAGE */}
        <section className="relative hidden h-screen w-full lg:block">
          <div className="absolute inset-0 overflow-hidden bg-linear-to-br from-violet-500 to-indigo-500">
            <div className="absolute -left-20 top-10 h-28 w-72 rounded-full bg-white/30 blur-sm" />
            <div className="absolute -right-24 top-16 h-32 w-80 rounded-full bg-white/30 blur-sm" />
            <div className="absolute left-10 bottom-14 h-28 w-72 rounded-full bg-white/25 blur-sm" />
            <div className="absolute right-10 bottom-8 h-24 w-60 rounded-full bg-white/20 blur-sm" />

            <div className="absolute inset-0 flex items-center justify-center px-10">
              <div
                className="relative"
                style={{ width: "1500px", height: "700px" }}
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
