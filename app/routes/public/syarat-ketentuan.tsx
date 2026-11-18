// app/routes/public/syarat-ketentuan.tsx
// Teks ketentuan ada di components/public/legal/terms-content.ts.
import { useSite } from "~/components/public/layout/use-site";
import { LegalDocument } from "~/components/public/legal/legal-document";
import { termsSections } from "~/components/public/legal/terms-content";
import { PageHeader } from "~/components/public/shared/section";
import { publicHeaders } from "~/lib/public-headers";
import { breadcrumbLd, seoMeta } from "~/lib/seo";
import type { Route } from "./+types/syarat-ketentuan";

export const headers = publicHeaders;

export function meta({ matches }: Route.MetaArgs) {
  return seoMeta(matches, {
    title: "Syarat dan Ketentuan",
    description:
      "Ketentuan penggunaan situs dan permintaan layanan Yohara Gemilang Management.",
    path: "/syarat-ketentuan",
    jsonLd: [breadcrumbLd(matches, [{ name: "Beranda", path: "/" }, { name: "Syarat dan Ketentuan", path: "/syarat-ketentuan" }])],
  });
}

export default function SyaratKetentuan() {
  const site = useSite();
  return (
    <>
      <PageHeader eyebrow="Legal" title="Syarat dan Ketentuan" description="Ketentuan penggunaan situs dan layanan." />
      {site ? <LegalDocument sections={termsSections(site)} /> : null}
    </>
  );
}
