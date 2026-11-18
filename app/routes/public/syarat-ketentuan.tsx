// app/routes/public/syarat-ketentuan.tsx
// Teks ketentuan ada di components/public/legal/terms-content.ts.
import { useSite } from '~/components/public/layout/use-site';
import { LegalDocument } from '~/components/public/legal/legal-document';
import { termsSections } from '~/components/public/legal/terms-content';
import { PageHeader } from '~/components/public/shared/section';
import { publicHeaders } from '~/lib/public-headers';

export const headers = publicHeaders;

export function meta() {
  return [{ title: 'Syarat dan Ketentuan | Yohara Gemilang Management' }, { name: 'description', content: 'Ketentuan penggunaan situs dan permintaan layanan Yohara Gemilang Management.' }];
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
