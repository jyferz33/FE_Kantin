import { useQuery } from "@tanstack/react-query";
import { getRoleToken } from "@/lib/auth";

const API_BASE =
    process.env.NEXT_PUBLIC_API_URL ?? "https://ukk-p2.smktelkom-mlg.sch.id/api/";
const MAKER_ID = process.env.NEXT_PUBLIC_MAKER_ID ?? "1";

function joinUrl(base: string, path: string) {
    const b = base.endsWith("/") ? base : base + "/";
    const p = path.startsWith("/") ? path.slice(1) : path;
    return b + p;
}

async function safeJson(text: string) {
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

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
    fotoUrl?: string;
    detail_trans?: any[];
    [key: string]: any;
};

function pickId(r: any) {
    return r?.id_order ?? r?.id ?? r?.ID ?? null;
}

async function fetchOrdersByStatus(statusPath: string): Promise<OrderRow[]> {
    const token = getRoleToken("siswa");
    if (!token) throw new Error("Token siswa tidak ada. Login siswa dulu.");

    const res = await fetch(joinUrl(API_BASE, `showorder/${statusPath}`), {
        method: "GET",
        headers: {
            makerID: MAKER_ID,
            Authorization: `Bearer ${token}`,
        } as any,
    });

    const raw = await res.text();
    const data: any = await safeJson(raw);

    if (!res.ok) {
        throw new Error(data?.message || data?.msg || `HTTP ${res.status}`);
    }

    const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.result)
                ? data.result
                : Array.isArray(data?.items)
                    ? data.items
                    : [];

    return Array.isArray(list) ? (list as OrderRow[]) : [];
}

function pickDetailItems(order: any) {
    const items =
        order?.detail_trans ??
        order?.detail ??
        order?.items ??
        order?.result ??
        [];

    return Array.isArray(items) ? items : [];
}

function calcTotal(items: any[]) {
    let total = 0;
    for (const it of items) {
        const sub = Number(it?.subtotal ?? 0);
        if (Number.isFinite(sub) && sub > 0) {
            total += sub;
            continue;
        }

        const qty = Number(it?.qty ?? it?.jumlah ?? 0);
        const harga = Number(it?.harga_beli ?? it?.harga ?? it?.price ?? 0);
        if (!Number.isNaN(qty) && !Number.isNaN(harga)) total += qty * harga;
    }
    return total;
}

// ✅ Fetch ALL menus (food + drink)
async function fetchAllMenus(): Promise<any[]> {
    const token = getRoleToken("siswa");
    if (!token) {
        console.error("❌ No token for fetching menus");
        return [];
    }

    try {
        console.log("🔄 Fetching menus from getmenufood and getmenudrink...");

        // Fetch makanan
        const fdFood = new FormData();
        fdFood.append("search", "");

        const resFood = await fetch(joinUrl(API_BASE, "getmenufood"), {
            method: "POST",
            headers: {
                makerID: MAKER_ID,
                Authorization: `Bearer ${token}`,
            } as any,
            body: fdFood,
        });

        const rawFood = await resFood.text();
        const dataFood: any = await safeJson(rawFood);

        const listFood = Array.isArray(dataFood)
            ? dataFood
            : Array.isArray(dataFood?.data)
                ? dataFood.data
                : Array.isArray(dataFood?.menu)
                    ? dataFood.menu
                    : Array.isArray(dataFood?.result)
                        ? dataFood.result
                        : [];

        console.log(`✅ Fetched ${listFood.length} food items`);

        // Fetch minuman
        const fdDrink = new FormData();
        fdDrink.append("search", "");

        const resDrink = await fetch(joinUrl(API_BASE, "getmenudrink"), {
            method: "POST",
            headers: {
                makerID: MAKER_ID,
                Authorization: `Bearer ${token}`,
            } as any,
            body: fdDrink,
        });

        const rawDrink = await resDrink.text();
        const dataDrink: any = await safeJson(rawDrink);

        const listDrink = Array.isArray(dataDrink)
            ? dataDrink
            : Array.isArray(dataDrink?.data)
                ? dataDrink.data
                : Array.isArray(dataDrink?.menu)
                    ? dataDrink.menu
                    : Array.isArray(dataDrink?.result)
                        ? dataDrink.result
                        : [];

        console.log(`✅ Fetched ${listDrink.length} drink items`);

        const allMenus = [...listFood, ...listDrink];
        console.log(`✅ Total menus: ${allMenus.length}`);

        return allMenus;
    } catch (err) {
        console.error("❌ Error fetching menus:", err);
        return [];
    }
}

function getMenuById(menus: any[], idMenu: number) {
    if (!idMenu || !menus || menus.length === 0) {
        return null;
    }

    const found = menus.find((m) => {
        const menuId =
            m.id_menu ??
            m.idMenu ??
            m.id ??
            m.ID ??
            m.menu_id ??
            m.menuId;

        const numMenuId = Number(menuId);
        return numMenuId === idMenu;
    });

    return found;
}

function getMenuFotoUrl(menu: any) {
    if (!menu) return "";
    const foto = menu.foto || menu.gambar || menu.image;
    if (!foto) return "";
    if (foto.startsWith("http")) return foto;
    const origin = "https://ukk-p2.smktelkom-mlg.sch.id/";
    return origin + String(foto).replace(/^\/+/, "");
}

export function useOrders(status: string) {
    return useQuery({
        queryKey: ["orders", status],
        queryFn: async () => {
            console.log(`🔄 Fetching orders for status: ${status}`);

            const statusPath = encodeURIComponent(status);
            const list = await fetchOrdersByStatus(statusPath);
            console.log(`📦 Got ${list.length} orders`);

            // ✅ Fetch semua menu dulu
            const allMenus = await fetchAllMenus();
            console.log(`📋 Menu cache ready with ${allMenus.length} items`);

            // ✅ Enrich orders - TANPA fetch detail (karena detail_trans sudah ada di showorder)
            const enriched = list.map((o) => {
                const oid = pickId(o);

                // ✅ Ambil detail_trans langsung dari order
                const items = pickDetailItems(o);
                console.log(`📦 Order #${oid} has ${items.length} items from showorder response`);

                const total = calcTotal(items);

                // ✅ Enrich setiap item dengan data menu yang benar
                const enrichedItems = items.map((item: any) => {
                    const idMenu = Number(item.id_menu ?? item.idMenu ?? 0);
                    const menuData = getMenuById(allMenus, idMenu);

                    return {
                        ...item,
                        nama_makanan: menuData?.nama_makanan || item.nama_makanan || "Menu",
                        nama_menu: menuData?.nama_makanan || item.nama_menu,
                        foto: menuData?.foto || item.foto,
                        gambar: menuData?.gambar || item.gambar,
                        image: menuData?.image || item.image,
                        menu: menuData,
                    };
                });

                const first = enrichedItems[0];

                const namaMenu =
                    first?.nama_makanan ||
                    first?.nama_menu ||
                    o?.nama_makanan ||
                    "Menu";

                const namaStan =
                    o?.nama_stan ||
                    o?.nama_kantin ||
                    o?.stan?.nama_stan ||
                    "-";

                return {
                    ...o,
                    nama_makanan: namaMenu,
                    nama_stan: namaStan,
                    total: total,
                    jumlah:
                        enrichedItems.reduce(
                            (acc, it) => acc + Number(it?.qty ?? it?.jumlah ?? 0),
                            0
                        ) || o?.jumlah,
                    fotoUrl: getMenuFotoUrl(first?.menu) || getMenuFotoUrl(first),
                    detail_trans: enrichedItems,
                } as OrderRow;
            });

            console.log(`✅ All ${enriched.length} orders enriched`);
            return enriched;
        },
        staleTime: 30000,
        refetchOnWindowFocus: false,
    });
}