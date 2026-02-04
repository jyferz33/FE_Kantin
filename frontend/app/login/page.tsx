// app/login/page.tsx
import Link from "next/link";

export default function LoginPortalPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-4">
      {/* ✅ BACKGROUND IMAGE (ganti src sesuai gambar kamu) */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/image/background.jpg" // <-- taruh background kamu di /public/image/, lalu ganti nama file ini
          alt="bg"
          className="h-full w-full object-cover"
        />
        {/* blur + gelap tipis biar teks kebaca */}
        <div className="absolute inset-0 bg-black/35 backdrop-blur-3xl" />
      </div>

      {/* ✅ GLASS CARD */}
      <div className="relative w-full max-w-3xl rounded-[2.25rem] border border-white/25 bg-white/10 p-8 shadow-2xl backdrop-blur-2xl sm:p-12">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Sebelum Login Pilih Dulu Role Anda Sebagai sebagai:
          </h1>
        </div>

        {/* ✅ ROLE PICK */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
          {/* MEMBER */}
          <Link
            href="/siswa/login"
            className={[
              "group flex items-center justify-center rounded-3xl",
              "border border-white/25 bg-white/10 px-8 py-10",
              "text-white transition",
              "hover:bg-white/15 hover:border-white/35 hover:shadow-xl",
              "focus:outline-none focus:ring-4 focus:ring-white/20",
            ].join(" ")}
          >
            <div className="text-4xl font-black tracking-wider sm:text-5xl">
              MEMBER
            </div>
          </Link>

          {/* ADMIN */}
          <Link
            href="/admin/login"
            className={[
              "group flex items-center justify-center rounded-3xl",
              "border border-white/25 bg-white/10 px-8 py-10",
              "text-white transition",
              "hover:bg-white/15 hover:border-white/35 hover:shadow-xl",
              "focus:outline-none focus:ring-4 focus:ring-white/20",
            ].join(" ")}
          >
            <div className="text-4xl font-black tracking-wider sm:text-5xl">
              ADMIN
            </div>
          </Link>
        </div>

        {/* ✅ REGISTER */}
        <p className="mt-10 text-center text-sm font-semibold text-white/85">
          Belum punya akun?{" "}
          <Link
            href="/siswa/register"
            className="font-extrabold text-white underline decoration-white/50 underline-offset-4 hover:decoration-white"
          >
            Daftar sebagai Siswa
          </Link>{" "}
          atau{" "}
          <Link
            href="/admin/register"
            className="font-extrabold text-white underline decoration-white/50 underline-offset-4 hover:decoration-white"
          >
            Daftar sebagai Admin
          </Link>
        </p>
      </div>
    </main>
  );
}
