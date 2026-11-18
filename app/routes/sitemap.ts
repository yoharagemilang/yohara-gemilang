// app/routes/sitemap.ts
// /sitemap.xml: dibuat dari database, di-cache CDN 1 jam.
import { getSiteUrl } from "~/lib/site-url.server";
import { getSitemapEntries } from "~/services/public/sitemap.server";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function loader() {
  const base = getSiteUrl();
  const entries = await getSitemapEntries();
  const body = entries
    .map(
      (e) =>
        `  <url>\n    <loc>${esc(base + (e.path === "/" ? "/" : e.path))}</loc>\n` +
        (e.lastmod ? `    <lastmod>${e.lastmod.toISOString()}</lastmod>\n` : "") +
        `    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`,
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
