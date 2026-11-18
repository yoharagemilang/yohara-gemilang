// app/lib/site-url.server.ts
// Alamat resmi situs. Isi SITE_URL di Vercel (mis. https://yoharagemilang.com); tanpa itu dipakai nilai bawaan.
const DEFAULT_URL = "https://yoharagemilang.com";

export function getSiteUrl() {
  const raw = process.env.SITE_URL?.trim() || DEFAULT_URL;
  return raw.replace(/\/+$/, "");
}
