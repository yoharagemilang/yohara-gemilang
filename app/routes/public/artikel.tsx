// app/routes/public/artikel.tsx
import { Container, PageHeader } from '~/components/public/shared/section';
import { publicHeaders } from '~/lib/public-headers';

export const headers = publicHeaders;

export function meta() {
  return [{ title: 'Artikel | Yohara Gemilang Management' }];
}

export default function Page() {
  return (
    <>
      <PageHeader eyebrow="Artikel" title="Artikel" description="Tips dan cerita seputar penyelenggaraan acara." />
      <Container className="py-16 text-mute">Isi halaman ini sedang disiapkan.</Container>
    </>
  );
}
