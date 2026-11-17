// app/components/public/services/services-list-section.tsx
// Isi halaman Layanan: seluruh layanan terbit, atau pesan singkat bila belum ada.
import { Link } from 'react-router';

import { cta } from '../shared/cta';
import { Reveal } from '../shared/reveal';
import { Section } from '../shared/section';
import { ServiceGrid } from './service-grid';
import type { ServiceView } from '~/services/public/services.server';

export function ServicesListSection({ services }: { services: ServiceView[] }) {
  return (
    <Section>
      {services.length === 0 ? (
        <div className="rounded-xl border border-line p-10 text-center">
          <p className="text-mute">Daftar layanan sedang kami siapkan. Ceritakan kebutuhan acara Anda langsung kepada kami.</p>
          <Link to="/kontak" className={cta('red', 'mt-6')}>
            Hubungi kami
          </Link>
        </div>
      ) : (
        <Reveal>
          <ServiceGrid services={services} />
        </Reveal>
      )}
    </Section>
  );
}
