// app/routes/public/faq.tsx
import { Container, PageHeader } from '~/components/public/shared/section';
import { publicHeaders } from '~/lib/public-headers';

export const headers = publicHeaders;

export function meta() {
  return [{ title: 'Pertanyaan umum | Yohara Gemilang Management' }];
}

export default function Page() {
  return (
    <>
      <PageHeader eyebrow="FAQ" title="Pertanyaan umum" description="Jawaban untuk hal yang paling sering ditanyakan." />
      <Container className="py-16 text-mute">Isi halaman ini sedang disiapkan.</Container>
    </>
  );
}
