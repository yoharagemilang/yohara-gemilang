// app/routes/public/artikel.tsx
// Daftar artikel: ?kategori=<nama> memfilter, ?halaman=<n> memilih halaman.
import { ArticleGridSection } from "~/components/public/articles/article-grid-section";
import { PageHeader } from "~/components/public/shared/section";
import { publicHeaders } from "~/lib/public-headers";
import { getArticleList } from "~/services/public/article.server";
import type { Route } from "./+types/artikel";
import { breadcrumbLd, seoMeta } from "~/lib/seo";

export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const page = Number.parseInt(url.searchParams.get("halaman") ?? "1", 10);
  return getArticleList({
    category: url.searchParams.get("kategori"),
    page: Number.isFinite(page) ? page : 1,
  });
}

export const headers = publicHeaders;

export function meta({ matches }: Route.MetaArgs) {
  return seoMeta(matches, {
    title: "Artikel",
    description:
      "Tips dan cerita seputar perencanaan acara dari tim Yohara Gemilang Management.",
    path: "/artikel",
    jsonLd: [breadcrumbLd(matches, [{ name: "Beranda", path: "/" }, { name: "Artikel", path: "/artikel" }])],
  });
}

export default function Artikel({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <PageHeader eyebrow="Artikel" title="Tips dan cerita seputar acara" description="Panduan praktis dari tim kami untuk merencanakan acara." />
      <ArticleGridSection data={loaderData} />
    </>
  );
}
