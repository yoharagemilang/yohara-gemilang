// app/routes/public/layanan.tsx
// Halaman Layanan: mengambil data dan menyusun komponen di components/public/services.
import { ServicesListSection } from "~/components/public/services/services-list-section";
import { CtaBanner } from "~/components/public/shared/cta-banner";
import { PageHeader } from "~/components/public/shared/section";
import { publicHeaders } from "~/lib/public-headers";
import { getServicesData } from "~/services/public/services.server";
import type { Route } from "./+types/layanan";
import { breadcrumbLd, seoMeta } from "~/lib/seo";

export function loader() {
  return getServicesData();
}

export const headers = publicHeaders;

export function meta({ matches }: Route.MetaArgs) {
  return seoMeta(matches, {
    title: "Layanan",
    description:
      "Layanan event organizer kami: acara korporat, pernikahan, konser, dan lainnya, dari konsep sampai pelaksanaan di lokasi.",
    path: "/layanan",
    jsonLd: [breadcrumbLd(matches, [{ name: "Beranda", path: "/" }, { name: "Layanan", path: "/layanan" }])],
  });
}

export default function Layanan({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <PageHeader
        eyebrow="Layanan"
        title="Jenis acara yang kami tangani"
        description="Dari acara 50 orang sampai festival ribuan pengunjung."
      />
      <ServicesListSection services={loaderData.services} />
      <CtaBanner />
    </>
  );
}
