// app/lib/seo.ts
// Satu tempat untuk title, description, canonical, Open Graph, Twitter, dan JSON-LD.
// Dipakai di meta() setiap route publik; berjalan di server dan browser.
import type { SiteInfo } from "~/services/site.server";
import type { PublicMedia } from "~/services/public/media";
import { cldUrl } from "./cloudinary-url";

type MatchLike = { id: string; loaderData?: unknown } | undefined;
type Matches = readonly MatchLike[];

export type MetaTag = Record<string, unknown>;

export type SeoOptions = {
  /** Judul halaman. Akhiran nama perusahaan ditambahkan otomatis. */
  title: string;
  /** Pakai judul apa adanya, tanpa akhiran (beranda). */
  rawTitle?: boolean;
  description: string;
  /** Jalur halaman, mis. "/portofolio/pesta-x". Query tidak ikut (halaman filter menunjuk ke induknya). */
  path: string;
  image?: PublicMedia | null;
  type?: "website" | "article";
  noindex?: boolean;
  publishedTime?: string | null;
  jsonLd?: object[];
};

function context(matches: Matches) {
  const root = matches.find((m) => m?.id === "root")?.loaderData as { cloudName?: string } | undefined;
  const layout = matches.find((m) => m?.id === "routes/public/layout")?.loaderData as
    | { site?: SiteInfo }
    | undefined;
  return { cloudName: root?.cloudName ?? "", site: layout?.site };
}

/** Potong deskripsi ke ±160 karakter di batas kata. */
export function clip(text: string, max = 160) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 80 ? cut.lastIndexOf(" ") : cut.length)}…`;
}

export function seoMeta(matches: Matches, o: SeoOptions): MetaTag[] {
  const { cloudName, site } = context(matches);
  const name = site?.companyName ?? "Yohara Gemilang Management";
  const base = site?.siteUrl ?? "";
  const title = o.rawTitle ? o.title : `${o.title} | ${name}`;
  const description = clip(o.description);
  const url = `${base}${o.path === "/" ? "" : o.path}` || "/";
  const canonical = o.path === "/" ? `${base}/` : url;

  const img = o.image ?? site?.ogImage ?? null;
  const imgUrl =
    img && cloudName ? cldUrl(cloudName, img.publicId, { w: 1200, h: 630, crop: "fill", gravity: "auto" }) : null;

  const tags: MetaTag[] = [
    { title },
    { name: "description", content: description },
    ...(o.noindex ? [{ name: "robots", content: "noindex" }] : []),
    ...(base ? [{ tagName: "link", rel: "canonical", href: canonical }] : []),
    { property: "og:site_name", content: name },
    { property: "og:locale", content: "id_ID" },
    { property: "og:type", content: o.type ?? "website" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    ...(base ? [{ property: "og:url", content: canonical }] : []),
    ...(imgUrl
      ? [
          { property: "og:image", content: imgUrl },
          { property: "og:image:width", content: "1200" },
          { property: "og:image:height", content: "630" },
          ...(img?.alt ? [{ property: "og:image:alt", content: img.alt }] : []),
        ]
      : []),
    ...(o.type === "article" && o.publishedTime
      ? [{ property: "article:published_time", content: o.publishedTime }]
      : []),
    { name: "twitter:card", content: imgUrl ? "summary_large_image" : "summary" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    ...(imgUrl ? [{ name: "twitter:image", content: imgUrl }] : []),
  ];

  for (const ld of o.jsonLd ?? []) tags.push({ "script:ld+json": ld });
  return tags;
}

/** Meta untuk halaman yang tidak boleh diindeks (404, data tidak ada). */
export function noindexMeta(title: string): MetaTag[] {
  return [{ title }, { name: "robots", content: "noindex" }];
}

/* ---------- JSON-LD ---------- */

export function absoluteUrl(matches: Matches, path: string) {
  const { site } = context(matches);
  return `${site?.siteUrl ?? ""}${path}`;
}

export function organizationLd(matches: Matches): object | null {
  const { cloudName, site } = context(matches);
  if (!site) return null;
  const logo = site.ogImage && cloudName ? cldUrl(cloudName, site.ogImage.publicId, { w: 1200, h: 630, crop: "fill" }) : undefined;
  const sameAs = [site.instagramUrl, site.linkedinUrl, site.youtubeUrl].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${site.siteUrl}/#organization`,
    name: site.companyName,
    description: site.seoDescription || site.tagline || undefined,
    url: `${site.siteUrl}/`,
    image: logo,
    telephone: site.phone || undefined,
    email: site.email || undefined,
    address: site.address
      ? { "@type": "PostalAddress", streetAddress: site.address, addressCountry: "ID" }
      : undefined,
    openingHours: site.openingHours || undefined,
    sameAs: sameAs.length ? sameAs : undefined,
  };
}

export function breadcrumbLd(matches: Matches, items: { name: string; path: string }[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(matches, it.path || "/"),
    })),
  };
}

export function articleLd(
  matches: Matches,
  a: { title: string; excerpt: string; path: string; publishedAt: string | null; cover: PublicMedia | null },
): object {
  const { cloudName, site } = context(matches);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.excerpt,
    mainEntityOfPage: absoluteUrl(matches, a.path),
    datePublished: a.publishedAt ?? undefined,
    image:
      a.cover && cloudName ? [cldUrl(cloudName, a.cover.publicId, { w: 1200, h: 630, crop: "fill", gravity: "auto" })] : undefined,
    author: site ? { "@type": "Organization", name: site.companyName } : undefined,
    publisher: site ? { "@type": "Organization", "@id": `${site.siteUrl}/#organization`, name: site.companyName } : undefined,
  };
}

export function faqLd(faqs: { question: string; answer: string }[]): object | null {
  if (faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}
