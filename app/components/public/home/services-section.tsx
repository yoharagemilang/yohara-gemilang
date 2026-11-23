// app/components/public/home/services-section.tsx
import { Link } from 'react-router';

import { Reveal } from '../shared/reveal';
import { cta } from '../shared/cta';
import { Section, SectionHead } from '../shared/section';
import { ServiceGrid } from '../services/service-grid';
import type { HomeData } from '~/services/public/home.server';

export function ServicesSection({ services }: { services: HomeData['services'] }) {
  if (services.length === 0) return null;
  return (
    <Section soft texture="grid">
      <Reveal>
        <SectionHead
          eyebrow="Layanan"
          title="Jenis acara yang kami tangani"
          description="Dari acara 50 orang sampai festival ribuan pengunjung."
          action={
            <Link prefetch="viewport" to="/layanan" className={cta('line')}>
              Semua layanan
            </Link>
          }
        />
      </Reveal>
      <ServiceGrid services={services} />
    </Section>
  );
}
