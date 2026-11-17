// app/routes/public/tentang.tsx
import { Container, PageHeader } from '~/components/public/shared/section';
import { publicHeaders } from '~/lib/public-headers';

export const headers = publicHeaders;

export function meta() {
  return [{ title: 'Tentang kami | Yohara Gemilang Management' }];
}

export default function Page() {
  return (
    <>
      <PageHeader eyebrow="Tentang" title="Tentang kami" description="Cerita, nilai, dan tim di balik setiap acara." />
      <Container className="py-16 text-mute">Isi halaman ini sedang disiapkan.</Container>
    </>
  );
}
