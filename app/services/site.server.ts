// app/services/site.server.ts
// Data yang dipakai semua halaman publik: header, footer, tombol WhatsApp.
import { db } from "~/lib/db.server";
import { getSiteUrl } from "~/lib/site-url.server";
import type { PublicMedia } from "./public/media";
import { pickMedia } from "./public/media";
import { getSettings } from "./settings.server";
import { mediaSelect } from "./helpers.server";

export type SiteInfo = {
  companyName: string;
  tagline: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  openingHours: string;
  mapQuery: string;
  instagramUrl: string | null;
  linkedinUrl: string | null;
  youtubeUrl: string | null;
  serviceNames: string[];
  /** Judul dan deskripsi SEO beranda (dari Pengaturan) */
  seoTitle: string;
  seoDescription: string;
  /** Alamat situs tanpa garis miring di akhir, untuk canonical dan sitemap */
  siteUrl: string;
  /** Gambar bawaan saat dibagikan (slide pertama beranda), null kalau belum ada */
  ogImage: PublicMedia | null;
};

export async function getSiteInfo(): Promise<SiteInfo> {
  const [s, services, firstSlide] = await Promise.all([
    getSettings(),
    db.service.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { title: true },
      take: 6,
    }),
    db.heroSlide.findFirst({
      orderBy: { sortOrder: "asc" },
      where: { media: { kind: "IMAGE" } },
      select: { media: { select: mediaSelect } },
    }),
  ]);

  return {
    companyName: s?.companyName ?? "Yohara Gemilang Management",
    tagline: s?.tagline ?? "",
    address: s?.address ?? "",
    phone: s?.phone ?? "",
    whatsapp: s?.whatsapp ?? "",
    email: s?.email ?? "",
    openingHours: s?.openingHours ?? "",
    mapQuery: s?.mapQuery ?? "",
    instagramUrl: s?.instagramUrl ?? null,
    linkedinUrl: s?.linkedinUrl ?? null,
    youtubeUrl: s?.youtubeUrl ?? null,
    serviceNames: services.map((x: { title: string }) => x.title),
    seoTitle: s?.seoTitle ?? "",
    seoDescription: s?.seoDescription ?? "",
    siteUrl: getSiteUrl(),
    ogImage: pickMedia(firstSlide?.media),
  };
}
