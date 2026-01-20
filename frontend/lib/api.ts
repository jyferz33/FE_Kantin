import { getRoleToken } from "@/lib/auth";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://ukk-p2.smktelkom-mlg.sch.id/api/";
const MAKER_ID = process.env.NEXT_PUBLIC_MAKER_ID ?? "1";

function joinUrl(base: string, path: string) {
  return `${base.replace(/\/+$/, "/")}${path.replace(/^\/+/, "")}`;
}

async function safeJson(text: string) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("makerID", MAKER_ID);

  // ✅ token STAND -> Bearer (sesuai login response)
  if (typeof window !== "undefined") {
    const token = getRoleToken("stand");
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  if (!isFormData && options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(joinUrl(BASE_URL, path), { ...options, headers });

  const text = await res.text();
  const data: any = await safeJson(text);

  if (!res.ok) {
    throw new Error(data?.message || data?.error || data?.msg || `HTTP ${res.status}`);
  }
  return data as T;
}

export async function postForm<T>(path: string, fields: Record<string, any>): Promise<T> {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined || v === null) continue;
    fd.append(k, v as any);
  }
  return api<T>(path, { method: "POST", body: fd });
}