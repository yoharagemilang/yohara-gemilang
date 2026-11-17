// app/routes/public/layanan.tsx
import { Container, PageHeader } from '~/components/public/shared/section';
import { publicHeaders } from '~/lib/public-headers';

export const headers = publicHeaders;

export function meta() {
  return [{ title: 'Layanan kami | Yohara Gemilang Management' }];
}

export default function Page() {
  return (
    <>
      <PageHeader eyebrow="Layanan" title="Layanan kami" description="Jenis acara yang kami tangani." />
      <Container className="py-16 text-mute">Isi halaman ini sedang disiapkan.</Container>
    </>
  );
}
