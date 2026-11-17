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
    <Section soft>
      <Reveal>
        <SectionHead
          eyebrow="Layanan"
          title="Jenis acara yang kami tangani"
          description="Dari acara 50 orang sampai festival ribuan pengunjung."
          action={
            <Link to="/layanan" className={cta('line')}>
              Semua layanan
            </Link>
          }
        />
      </Reveal>
      <Reveal delay={0.1}>
        <ServiceGrid services={services} />
      </Reveal>
    </Section>
  );
}
