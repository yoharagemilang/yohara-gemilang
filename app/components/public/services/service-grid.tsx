// app/components/public/services/service-grid.tsx
// Panel layanan: garis tipis antar kartu. Jumlah ganjil, kartu terakhir memenuhi baris.
import { cn } from '~/lib/utils';
import { ServiceCard, type ServiceItem } from './service-card';

export function ServiceGrid({ services, headingLevel }: { services: ServiceItem[]; headingLevel?: 'h2' | 'h3' }) {
  const odd = services.length % 2 === 1;
  return (
    <div className="grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-2">
      {services.map((s, i) => (
        <ServiceCard key={s.id} service={s} headingLevel={headingLevel} className={cn(odd && i === services.length - 1 && 'md:col-span-2')} />
      ))}
    </div>
  );
}
