// app/routes/public/kebijakan-privasi.tsx
// Teks kebijakan ada di components/public/legal/privacy-content.ts.
import { useSite } from "~/components/public/layout/use-site";
import { LegalDocument } from "~/components/public/legal/legal-document";
import { privacySections } from "~/components/public/legal/privacy-content";
import { PageHeader } from "~/components/public/shared/section";
import { publicHeaders } from "~/lib/public-headers";
import { breadcrumbLd, seoMeta } from "~/lib/seo";
import type { Route } from "./+types/kebijakan-privasi";

export const headers = publicHeaders;

export function meta({ matches }: Route.MetaArgs) {
  return seoMeta(matches, {
    title: "Kebijakan Privasi",
    description:
      "Cara Yohara Gemilang Management mengelola dan melindungi data pribadi yang Anda berikan.",
    path: "/kebijakan-privasi",
    jsonLd: [breadcrumbLd(matches, [{ name: "Beranda", path: "/" }, { name: "Kebijakan Privasi", path: "/kebijakan-privasi" }])],
  });
}

export default function KebijakanPrivasi() {
  const site = useSite();
  return (
    <>
      <PageHeader eyebrow="Legal" title="Kebijakan Privasi" description="Cara kami mengelola data yang Anda berikan." />
      {site ? <LegalDocument sections={privacySections(site)} /> : null}
    </>
  );
}
