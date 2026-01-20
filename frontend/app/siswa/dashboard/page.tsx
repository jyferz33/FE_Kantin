import Link from "next/link";

const cards = [
  {
    title: "Profile",
    desc: "Lihat informasi akun siswa.",
    href: "/siswa/dashboard/profile",
  },
  {
    title: "Menu",
    desc: "Pilih Makanan atau Minuman. Nanti klik item → Order → Cetak Nota.",
    href: "/siswa/dashboard/menu",
  },
  {
    title: "Diskon",
    desc: "Menu diskon bulanan (slide terpisah). Klik item → Order → Nota.",
    href: "/siswa/dashboard/diskon",
  },
  {
    title: "Histori",
    desc: "Lihat rekap order bulanan.",
    href: "/siswa/dashboard/histori",
  },
];

export default function SiswaDashboardHome() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Selamat datang 👋</h1>
        <p className="mt-1 text-sm text-slate-500">
          Pilih menu di atas, atau gunakan shortcut di bawah.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group rounded-3xl border border-slate-200 bg-white p-5 transition hover:border-purple-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-extrabold text-slate-900 group-hover:text-purple-700">
                  {c.title}
                </div>
                <div className="mt-1 text-sm text-slate-500">{c.desc}</div>
              </div>
              <div className="rounded-2xl bg-purple-50 px-3 py-2 text-xs font-bold text-purple-700">
                Buka
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="rounded-3xl border border-purple-100 bg-purple-50 p-6 text-sm text-purple-800">
        UI dashboard sudah sesuai alur: pilih menu/diskon → (nanti) masuk order → cetak nota.
        Isi tiap halaman akan kita kerjakan setelah UI beres.
      </div>
    </div>
  );
}
