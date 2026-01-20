import Link from "next/link";

export default function LoginPortalPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-600 to-indigo-600 px-4">
      {/* Card putih */}
      <div className="w-full max-w-2xl rounded-3xl bg-white p-10 shadow-2xl lg:p-14">
        {/* Brand */}
        <div className="mb-10 flex items-center gap-3">
          <span className="h-3 w-3 rounded-full bg-violet-600" />
          <span className="text-base font-semibold text-slate-700">
            KantinKu
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-extrabold leading-tight text-slate-900 lg:text-5xl">
          Selamat Datang <br />
          <span className="text-violet-600">Di Kantin Online</span>
        </h1>

        <p className="mt-4 text-base text-slate-500">
          Silakan pilih peran untuk melanjutkan login.
        </p>

        {/* Role options */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Siswa */}
          <Link
            href="/siswa/login"
            className="group rounded-2xl border border-slate-200 p-6 transition hover:border-violet-300 hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600 text-lg font-bold text-white">
                S
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Login sebagai Siswa
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Pesan makanan, lihat status & histori.
                </p>
              </div>
            </div>

            <div className="mt-4 text-sm font-semibold text-violet-600 group-hover:underline">
              Lanjutkan →
            </div>
          </Link>

          {/* Admin */}
          <Link
            href="/admin/login"
            className="group rounded-2xl border border-slate-200 p-6 transition hover:border-violet-300 hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-white">
                A
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Login sebagai Admin Stan
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Kelola menu, pelanggan & pesanan.
                </p>
              </div>
            </div>

            <div className="mt-4 text-sm font-semibold text-violet-600 group-hover:underline">
              Lanjutkan →
            </div>
          </Link>
        </div>

        {/* Register */}
        <p className="mt-10 text-sm text-slate-500">
          Belum punya akun?{" "}
          <Link
            href="/siswa/register"
            className="font-semibold text-violet-600 hover:underline"
          >
            Daftar sebagai Siswa
          </Link>{" "}
          atau{" "}
          <Link
            href="/admin/register"
            className="font-semibold text-violet-600 hover:underline"
          >
            Daftar sebagai Admin
          </Link>
        </p>
      </div>
    </main>
  );
}
