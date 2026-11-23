// app/components/public/services/service-grid.tsx
// Panel layanan: kartu masuk satu per satu saat panel terlihat. Jumlah ganjil, kartu terakhir memenuhi baris.
import * as m from 'motion/react-m';

import { cn } from '~/lib/utils';
import { ServiceCard, type ServiceItem } from './service-card';

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11, delayChildren: 0.05 } },
};

export function ServiceGrid({ services, headingLevel }: { services: ServiceItem[]; headingLevel?: 'h2' | 'h3' }) {
  const odd = services.length % 2 === 1;
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white">
      <m.div variants={gridVariants} initial="hidden" whileInView="show" viewport={{ once: true, margin: '0px 0px -80px 0px' }} className="-mt-px -ml-px grid md:grid-cols-2">
        {services.map((s, i) => (
          <ServiceCard key={s.id} service={s} index={i} headingLevel={headingLevel} className={cn(odd && i === services.length - 1 && 'md:col-span-2')} />
        ))}
      </m.div>
    </div>
  );
}
