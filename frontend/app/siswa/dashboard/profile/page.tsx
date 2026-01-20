export default function ProfilePage() {
  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-extrabold text-slate-900">Profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          Nanti diisi dari endpoint Get Profile (GET).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="text-xs font-bold text-slate-500">Nama</div>
          <div className="mt-1 text-sm font-semibold text-slate-900">—</div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="text-xs font-bold text-slate-500">Username</div>
          <div className="mt-1 text-sm font-semibold text-slate-900">—</div>
        </div>
      </div>
    </div>
  );
}
