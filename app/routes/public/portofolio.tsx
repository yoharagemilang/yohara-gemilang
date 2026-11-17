// app/routes/public/portofolio.tsx
import { Container, PageHeader } from '~/components/public/shared/section';
import { publicHeaders } from '~/lib/public-headers';

export const headers = publicHeaders;

export function meta() {
  return [{ title: 'Portofolio | Yohara Gemilang Management' }];
}

export default function Page() {
  return (
    <>
      <PageHeader eyebrow="Portofolio" title="Portofolio" description="Acara yang pernah kami kerjakan." />
      <Container className="py-16 text-mute">Isi halaman ini sedang disiapkan.</Container>
    </>
  );
}
