export default function HistoriPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-extrabold text-slate-900">Histori</h1>
        <p className="mt-1 text-sm text-slate-500">
          Rekap order bulanan (nanti dari endpoint show order by month).
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="text-sm font-extrabold text-slate-900">Filter Bulan</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"].map((m) => (
            <button
              key={m}
              type="button"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-700"
            >
              {m}
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm text-slate-500">
          List order bulanan akan muncul di sini (placeholder).
        </div>
      </div>
    </div>
  );
}
