"use client";

import { Clock, ChefHat, Truck, CheckCircle, ReceiptText } from "lucide-react";
import { getFotoUrl } from "@/lib/utils";

export type OrderRow = {
  id_order?: number;
  id?: number;
  ID?: number;

  status?: string;
  nama_makanan?: string;
  jumlah?: number | string;
  harga?: number | string;
  total?: number | string;

  nama_stan?: string;
  nama_kantin?: string;
  created_at?: string;
  tanggal?: string;

  // ✅ tambahan & fix typo type
  fotoUrl?: string;
  detail_trans?: any[];

  [key: string]: any;
};

function pickId(r: OrderRow) {
  return r.id_order ?? r.id ?? (r as any).ID ?? null;
}

function pickDate(r: OrderRow) {
  return r.created_at ?? r.tanggal ?? (r as any).date ?? "";
}

function pickStan(r: OrderRow) {
  return r.nama_stan || r.nama_kantin || (r as any).stan || "-";
}

function formatTanggal(input?: string) {
  if (!input) return "-";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function formatRupiah(value: any) {
  const n = Number(value ?? 0);
  if (Number.isNaN(n)) return String(value ?? "");
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

type OrderStatus = "belum dikonfirm" | "dimasak" | "diantar" | "sampai";

function toStatus(s: string): OrderStatus {
  const x = (s || "").toLowerCase();
  if (x.includes("belum")) return "belum dikonfirm";
  if (x.includes("dimasak")) return "dimasak";
  if (x.includes("diantar")) return "diantar";
  if (x.includes("sampai")) return "sampai";
  return "belum dikonfirm";
}

function getStatusInfo(status: OrderStatus) {
  switch (status) {
    case "belum dikonfirm":
      return { icon: Clock, label: "Belum Dikonfirmasi", cls: "bg-amber-100 text-amber-700" };
    case "dimasak":
      return { icon: ChefHat, label: "Dimasak", cls: "bg-blue-100 text-blue-700" };
    case "diantar":
      return { icon: Truck, label: "Diantar", cls: "bg-purple-100 text-purple-700" };
    case "sampai":
      return { icon: CheckCircle, label: "Selesai", cls: "bg-emerald-100 text-emerald-700" };
  }
}

export function OrderCardSiswa({ order }: { order: OrderRow }) {
  const id = pickId(order);
  const status = toStatus(String(order.status ?? ""));
  const info = getStatusInfo(status);
  const StatusIcon = info.icon;

  const amount =
    order.total != null ? order.total : order.harga != null ? order.harga : 0;

  return (
    <div className="rounded-3xl border border-purple-100 bg-white shadow-sm hover:shadow-lg transition">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 min-w-0">
            {/* ✅ THUMBNAIL */}
            <div className="h-14 w-14 overflow-hidden rounded-2xl bg-slate-100 shrink-0">
              {order.fotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={order.fotoUrl}
                  alt={order.nama_makanan ?? "Menu"}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                  🖼️
                </div>
              )}
            </div>

            <div className="min-w-0">
              <p className="text-xs text-gray-500">Order</p>
              <p className="font-semibold text-gray-900">#{id ?? "-"}</p>

              <p className="mt-1 text-sm font-semibold text-slate-900 line-clamp-1">
                {order.nama_makanan ?? "Menu"}
              </p>

              <p className="text-xs text-slate-500">
                m: <span className="font-medium text-slate-700">{pickStan(order)}</span>
              </p>
            </div>
          </div>

          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold ${info.cls}`}>
            <StatusIcon className="w-3 h-3 mr-1" strokeWidth={2} />
            {info.label}
          </span>
        </div>

        {/* Date */}
        <p className="text-xs text-gray-400 mb-3">{formatTanggal(pickDate(order))}</p>

        {/* Item rows */}
        <div className="space-y-2 mb-3 pb-3 border-b border-gray-100">
          {Array.isArray(order.detail_trans) && order.detail_trans.length > 0 ? (
            order.detail_trans.map((item: any, idx: number) => {
              const itemQty = Number(item.qty ?? item.jumlah ?? 1);

              // Backend mengirim subtotal yang sudah dikalikan qty
              // Jadi kita perlu hitung unitPrice = subtotal / qty
              const rawSubtotal = Number(
                item.subtotal ?? item.harga_beli ?? item.harga ?? item.price ?? 0
              );

              // Unit price per item
              const unitPrice = itemQty > 0 ? rawSubtotal / itemQty : rawSubtotal;

              // Total untuk item ini (seharusnya sama dengan rawSubtotal)
              const itemTotal = rawSubtotal;

              // Resolve image path for this specific item
              const rawImg =
                item.foto ??
                item.gambar ??
                item.image ??
                item.menu?.foto ??
                item.menu?.gambar ??
                item.menu?.image;
              const itemImg = getFotoUrl(rawImg);

              return (
                <div key={idx} className="flex items-center justify-between text-sm py-1">
                  <div className="flex items-center gap-3">
                    {/* Tiny thumbnail per item */}
                   

                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-700 line-clamp-1">
                        {item.nama_makanan ?? item.nama_menu ?? "Menu"}
                      </span>
                      <span className="text-xs text-slate-500">
                        <span className="font-bold text-purple-600">{itemQty}x</span> @ {formatRupiah(unitPrice)}
                      </span>
                    </div>
                  </div>

                  <span className="font-bold text-slate-900 ml-2">
                    {formatRupiah(itemTotal)}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                <span className="font-medium text-purple-600">
                  {order.jumlah ?? 1}x
                </span>
                <span className="ml-1">{order.nama_makanan ?? "Menu"}</span>
              </span>
              <span className="text-gray-900">{formatRupiah(amount)}</span>
            </div>
          )}
        </div>

      </div>

      {/* Action */}
      <div className="p-4 pt-0">
        <button
          className="w-full inline-flex items-center justify-center rounded-2xl bg-purple-600 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-purple-700 transition"
          onClick={() => {
            if (!id) return alert("ID order tidak ditemukan dari backend.");
            window.location.href = `/siswa/dashboard/nota/${id}`;
          }}
        >
          <ReceiptText className="w-4 h-4 mr-2" />
          Cetak Nota 
        </button>
      </div>
    </div>
  );
}