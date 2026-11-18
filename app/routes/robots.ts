// app/routes/robots.ts
// /robots.txt: semua boleh diindeks kecuali admin dan API.
import { getSiteUrl } from "~/lib/site-url.server";

export function loader() {
  const body = ["User-agent: *", "Allow: /", "Disallow: /admin", "", `Sitemap: ${getSiteUrl()}/sitemap.xml`, ""].join("\n");
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=86400",
    },
  });
}
