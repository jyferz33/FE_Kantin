import Link from "next/link";

function CardLink({
  title,
  desc,
  href,
  badge,
}: {
  title: string;
  desc: string;
  href: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-violet-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-lg font-extrabold text-slate-900">{title}</div>
          <p className="mt-2 text-sm text-slate-500">{desc}</p>
        </div>

        {badge ? (
          <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
            {badge}
          </span>
        ) : null}
      </div>

      <div className="mt-5 text-sm font-semibold text-violet-700 group-hover:underline">
        Buka →
      </div>
    </Link>
  );
}

export default function AdminDashboardPage() {
  return (
    <div>
      {/* Header content */}
      <div className="rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-600 p-8 text-white shadow-sm">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-extrabold md:text-4xl">
            Dashboard Admin Stan
          </h1>
          <p className="mt-2 text-sm text-white/80 md:text-base">
            Kelola menu, pelanggan, pesanan, rekap bulanan, dan pengaturan stan
            kamu dari sini.
          </p>
        </div>
      </div>

      {/* Quick stats dummy (UI only) */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-semibold text-slate-500">
            Total Pesanan (bulan ini)
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">—</div>
          <div className="mt-1 text-xs text-slate-400">
            (nanti diisi dari API)
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-semibold text-slate-500">
            Total Pemasukan (bulan ini)
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">—</div>
          <div className="mt-1 text-xs text-slate-400">
            (nanti diisi dari API)
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-semibold text-slate-500">
            Jumlah Menu Aktif
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">—</div>
          <div className="mt-1 text-xs text-slate-400">
            (nanti diisi dari API)
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-semibold text-slate-500">
            Pelanggan Terdaftar
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">—</div>
          <div className="mt-1 text-xs text-slate-400">
            (nanti diisi dari API)
          </div>
        </div>
      </div>

      {/* Menu cards */}
      <h2 className="mt-10 text-xl font-extrabold text-slate-900">
        Menu Pengelolaan
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Pilih modul yang ingin kamu kelola.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        <CardLink
          title="Data Siswa"
          desc="Kelola pelanggan (CRUD) yang terdaftar sebagai siswa."
          href="/admin/dashboard/data-siswa"
          badge="CRUD"
        />
        <CardLink
          title="Data Makanan & Minuman"
          desc="Tambah, ubah, dan hapus menu kantin yang dijual."
          href="/admin/dashboard/menu"
          badge="CRUD"
        />
        <CardLink
  title="Order"
  desc="Kelola pesanan masuk dan ubah status (dimasak/diantar/sampai)."
  href="/admin/dashboard/order"
  badge="Status"
 />

        <CardLink
          title="Rekap Pemesanan per Bulan"
          desc="Lihat semua data pemesanan berdasarkan bulan."
          href="/admin/dashboard/rekap-pemesanan"
          badge="Bulanan"
        />
        <CardLink
          title="Rekap Pemasukan per Bulan"
          desc="Lihat total pemasukan per bulan dari pesanan."
          href="/admin/dashboard/rekap-pemasukan"
          badge="Bulanan"
        />
        <CardLink
          title="Profil Stan"
          desc="Ubah data stan kamu (nama stan, kontak, dll)."
          href="/admin/dashboard/profil-stan"
          badge="Edit"
        />
        <CardLink
          title="Diskon Bulanan"
          desc="Atur diskon berdasarkan bulan/momen tertentu."
          href="/admin/dashboard/diskon"
          badge="Promo"
        />
      </div>

      {/* Footer hint */}
      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="text-sm font-semibold text-slate-900">
          Catatan
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Halaman ini baru UI. Setelah ini kita lanjut buat halaman masing-masing
          (CRUD, rekap, profil, diskon) dan baru sambungkan ke API.
        </p>
      </div>
    </div>
  );
}
