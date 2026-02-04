"use client";

import { useMemo, useState } from "react";
import { useOrders } from "@/lib/queries/orders";
import { OrderCardSiswa } from "@/components/siswa/OrderCardSiswa";
import { Button } from "@/components/ui/button";

export default function PesananSayaPage() {
  const tabs = useMemo(
    () => [
      { key: "belum dikonfirm", label: "Belum" },
      { key: "dimasak", label: "Dimasak" },
      { key: "diantar", label: "Diantar" },
      { key: "sampai", label: "Sampai" },
    ],
    []
  );

  const [active, setActive] = useState(tabs[0].key);

  // ✅ React Query hook
  const { data: rows = [], isLoading: loading, error, refetch } = useOrders(active);

  const TabBtn = ({
    active: isActive,
    children,
    onClick,
  }: {
    active: boolean;
    children: React.ReactNode;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-2xl px-4 py-2 text-sm font-extrabold transition",
        "ring-1 ring-inset",
        isActive
          ? "bg-purple-600 text-white ring-purple-600 shadow-sm"
          : "bg-white/90 text-slate-700 ring-slate-200 hover:bg-purple-50 hover:ring-purple-200",
      ].join(" ")}
    >
      {children}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,#ef4444_1px,transparent_0)] bg-size-[18px_18px] opacity-[0.06]" />
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-purple-500/10 blur-2xl" />

        <div className="relative p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1 text-xs font-extrabold text-purple-700 ring-1 ring-purple-100">
                🧾 Pesanan Siswa
              </div>
              <h1 className="mt-3 text-2xl font-extrabold text-slate-900">
                Pesanan Saya
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Pantau status pesanan kamu secara real-time.
              </p>
            </div>


          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {tabs.map((t) => (
              <TabBtn
                key={t.key}
                active={t.key === active}
                onClick={() => setActive(t.key)}
              >
                {t.label}
              </TabBtn>
            ))}
          </div>

          <div className="mt-3 text-xs text-slate-500">
            {loading ? "Memuat..." : `Total: ${rows.length} pesanan`}
          </div>
        </div>
      </div>

      {/* Error */}
      {error ? (
        <div className="rounded-3xl border border-purple-200 bg-purple-50 p-5 text-sm text-purple-700">
          <div className="font-extrabold">Gagal memuat pesanan</div>
          <div className="mt-1">{(error as Error)?.message || "Terjadi kesalahan"}</div>
          <Button
            type="button"
            onClick={() => refetch()}
            className="mt-3 rounded-2xl bg-purple-600 hover:bg-purple-700"
          >
            Coba Lagi
          </Button>
        </div>
      ) : null}

      {/* Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <div className="rounded-3xl border border-purple-100 bg-white p-6 text-sm text-slate-500">
            Memuat data...
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-3xl border border-purple-100 bg-white p-6 text-sm text-slate-500">
            Belum ada pesanan pada status ini.
          </div>
        ) : (
          rows.map((r, idx) => (
            <OrderCardSiswa key={(r.id_order ?? r.id ?? idx) as any} order={r} />
          ))
        )}
      </div>
    </div>
  );
}