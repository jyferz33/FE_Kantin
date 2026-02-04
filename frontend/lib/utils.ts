import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getFotoUrl(path?: string) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const origin = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "")
    : "https://ukk-p2.smktelkom-mlg.sch.id";

  // Clean clean leading slashes
  const p = String(path).replace(/^\/+/, "");
  return `${origin.replace(/\/+$/, "")}/${p}`;
}