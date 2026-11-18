// app/services/public/sitemap.server.ts
// Daftar URL untuk sitemap.xml: halaman tetap + proyek dan artikel yang sudah terbit.
import { db } from "~/lib/db.server";

export type SitemapEntry = { path: string; lastmod?: Date; changefreq: string; priority: string };

const staticPages: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/tentang", changefreq: "monthly", priority: "0.7" },
  { path: "/layanan", changefreq: "monthly", priority: "0.8" },
  { path: "/portofolio", changefreq: "weekly", priority: "0.8" },
  { path: "/artikel", changefreq: "weekly", priority: "0.7" },
  { path: "/faq", changefreq: "monthly", priority: "0.6" },
  { path: "/kontak", changefreq: "yearly", priority: "0.7" },
  { path: "/kebijakan-privasi", changefreq: "yearly", priority: "0.2" },
  { path: "/syarat-ketentuan", changefreq: "yearly", priority: "0.2" },
];

export async function getSitemapEntries(): Promise<SitemapEntry[]> {
  const [projects, articles] = await Promise.all([
    db.portfolioProject.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
    db.article.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);
  return [
    ...staticPages,
    ...projects.map((p: { slug: string; updatedAt: Date }) => ({
      path: `/portofolio/${p.slug}`,
      lastmod: p.updatedAt,
      changefreq: "monthly",
      priority: "0.6",
    })),
    ...articles.map((a: { slug: string; updatedAt: Date }) => ({
      path: `/artikel/${a.slug}`,
      lastmod: a.updatedAt,
      changefreq: "monthly",
      priority: "0.5",
    })),
  ];
}
