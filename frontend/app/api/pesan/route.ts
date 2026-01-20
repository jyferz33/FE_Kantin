import { NextResponse } from "next/server";
import https from "https";

const BACKEND_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "https://ukk-p2.smktelkom-mlg.sch.id/api/";

function joinUrl(base: string, path: string) {
  return `${base.replace(/\/+$/, "/")}${path.replace(/^\/+/, "")}`;
}

export async function POST(req: Request) {
  try {
    const { token, makerID, payload } = await req.json();

    if (!token) return NextResponse.json({ message: "Token kosong" }, { status: 401 });
    if (!makerID) return NextResponse.json({ message: "makerID kosong" }, { status: 400 });

    const url = joinUrl(BACKEND_BASE, "pesan");
    const body = JSON.stringify(payload ?? {});

    const resText: string = await new Promise((resolve, reject) => {
      const u = new URL(url);

      const r = https.request(
        {
          hostname: u.hostname,
          path: u.pathname + u.search,
          method: "GET", // 🔥 ini penting: backend hanya allow GET
          headers: {
            makerID: String(makerID),
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(body),
          },
        },
        (resp) => {
          let data = "";
          resp.on("data", (chunk) => (data += chunk));
          resp.on("end", () => {
            // backend kadang kosong body → tetap resolve
            resolve(data || "");
          });
        }
      );

      r.on("error", reject);
      r.write(body); // ✅ kirim body walau GET (server-side)
      r.end();
    });

    return NextResponse.json({ ok: true, raw: resText });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, message: e?.message ?? "Proxy error" },
      { status: 500 }
    );
  }
}
