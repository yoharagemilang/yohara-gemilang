// app/components/public/services/service-card.tsx
import { getServiceIcon } from '~/lib/icons';
import { cn } from '~/lib/utils';

export type ServiceItem = { id: string; title: string; description: string; iconKey: string };

export function ServiceCard({
  service,
  className,
  headingLevel: H = 'h3',
}: {
  service: ServiceItem;
  className?: string;
  /** h2 dipakai di halaman yang tidak punya h2 di atas daftar, agar urutan judul tidak melompat. */
  headingLevel?: 'h2' | 'h3';
}) {
  const Icon = getServiceIcon(service.iconKey);
  return (
    <article className={cn('bg-white px-8 pt-9 pb-10 md:px-11 md:pt-11 md:pb-12', className)}>
      <Icon aria-hidden className="mb-7 size-8 text-brand" strokeWidth={1.3} />
      <H className="mb-2.5 text-[1.3rem] leading-[1.15] font-semibold tracking-[-0.02em]">{service.title}</H>
      <p className="text-[0.95rem] text-mute">{service.description}</p>
    </article>
  );
}
