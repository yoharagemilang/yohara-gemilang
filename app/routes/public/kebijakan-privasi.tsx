// app/routes/public/kebijakan-privasi.tsx
// Teks kebijakan ada di components/public/legal/privacy-content.ts.
import { useSite } from '~/components/public/layout/use-site';
import { LegalDocument } from '~/components/public/legal/legal-document';
import { privacySections } from '~/components/public/legal/privacy-content';
import { PageHeader } from '~/components/public/shared/section';
import { publicHeaders } from '~/lib/public-headers';

export const headers = publicHeaders;

export function meta() {
  return [{ title: 'Kebijakan Privasi | Yohara Gemilang Management' }, { name: 'description', content: 'Cara Yohara Gemilang Management mengelola dan melindungi data pribadi yang Anda berikan.' }];
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
