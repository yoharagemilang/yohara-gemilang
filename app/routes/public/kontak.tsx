// app/routes/public/kontak.tsx
// Halaman Kontak: data situs sudah dimuat layout, jadi route ini tidak punya loader sendiri.
import { ContactSection } from '~/components/public/contact/contact-section';
import { useSite } from '~/components/public/layout/use-site';
import { PageHeader } from '~/components/public/shared/section';
import { publicHeaders } from '~/lib/public-headers';

export const headers = publicHeaders;

export function meta() {
  return [{ title: 'Hubungi kami | Yohara Gemilang Management' }];
}

export default function Kontak() {
  const site = useSite();
  return (
    <>
      <PageHeader eyebrow="Kontak" title="Hubungi kami" description="Ceritakan rencana acara Anda, kami bantu dari sini." />
      {site ? <ContactSection site={site} /> : null}
    </>
  );
}
