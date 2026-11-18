// app/routes/public/faq.tsx
// Halaman FAQ: mengambil data dan menyusun komponen di components/public/faq.
import { FaqListSection } from "~/components/public/faq/faq-list-section";
import { CtaBanner } from "~/components/public/shared/cta-banner";
import { PageHeader } from "~/components/public/shared/section";
import { publicHeaders } from "~/lib/public-headers";
import { getFaqData } from "~/services/public/faq.server";
import type { Route } from "./+types/faq";
import { breadcrumbLd, faqLd, seoMeta } from "~/lib/seo";

export function loader() {
  return getFaqData();
}

export const headers = publicHeaders;

export function meta({ loaderData, matches }: Route.MetaArgs) {
  const faq = faqLd(loaderData?.faqs ?? []);
  return seoMeta(matches, {
    title: "Pertanyaan umum",
    description: "Jawaban untuk pertanyaan yang paling sering ditanyakan tentang layanan, anggaran, dan proses kerja kami.",
    path: "/faq",
    jsonLd: [
      breadcrumbLd(matches, [{ name: "Beranda", path: "/" }, { name: "Pertanyaan umum", path: "/faq" }]),
      ...(faq ? [faq] : []),
    ],
  });
}

export default function Faq({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <PageHeader eyebrow="FAQ" title="Pertanyaan umum" description="Jawaban untuk hal yang paling sering ditanyakan." />
      <FaqListSection faqs={loaderData.faqs} />
      <CtaBanner />
    </>
  );
}
