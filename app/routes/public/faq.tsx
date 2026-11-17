// app/routes/public/faq.tsx
// Halaman FAQ: mengambil data dan menyusun komponen di components/public/faq.
import { FaqListSection } from '~/components/public/faq/faq-list-section';
import { CtaBanner } from '~/components/public/shared/cta-banner';
import { PageHeader } from '~/components/public/shared/section';
import { publicHeaders } from '~/lib/public-headers';
import { getFaqData } from '~/services/public/faq.server';
import type { Route } from './+types/faq';

export function loader() {
  return getFaqData();
}

export const headers = publicHeaders;

export function meta() {
  return [{ title: 'Pertanyaan umum | Yohara Gemilang Management' }];
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
