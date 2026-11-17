// app/components/public/home/partners-section.tsx
import { Container } from '../shared/section';
import { PartnerMarquee } from '../partners/partner-marquee';
import type { HomeData } from '~/services/public/home.server';

export function PartnersSection({ partners }: { partners: HomeData['partners'] }) {
  if (partners.length === 0) return null;
  return (
    <section aria-label="Klien dan mitra" className="border-y border-line py-14">
      <Container>
        <h2 className="mb-7 text-center text-[0.9rem] font-semibold text-mute">Dipercaya oleh perusahaan dan institusi di berbagai kota</h2>
      </Container>
      <PartnerMarquee partners={partners} />
    </section>
  );
}
