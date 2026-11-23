// app/components/public/services/service-card.tsx
import * as m from 'motion/react-m';

import { getServiceIcon } from '~/lib/icons';
import { cn } from '~/lib/utils';

export type ServiceItem = { id: string; title: string; description: string; iconKey: string };

export const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 20 } },
};

export function ServiceCard({
  service,
  index,
  className,
  headingLevel: H = 'h3',
}: {
  service: ServiceItem;
  index: number;
  className?: string;
  /** h2 dipakai di halaman yang tidak punya h2 di atas daftar, agar urutan judul tidak melompat. */
  headingLevel?: 'h2' | 'h3';
}) {
  const Icon = getServiceIcon(service.iconKey);
  return (
    <m.article data-reveal variants={cardVariants} className={cn('relative overflow-hidden border-t border-l border-line px-8 pt-9 pb-10 md:px-11 md:pt-11 md:pb-12', className)}>
      <span
        aria-hidden
        data-n={String(index + 1).padStart(2, '0')}
        className="pointer-events-none absolute right-7 -bottom-9 text-[9rem] leading-none font-semibold tracking-[-0.06em] text-ink/5 select-none before:content-[attr(data-n)] md:text-[12rem]"
      />
      <Icon aria-hidden className="relative mb-7 size-8 text-brand" strokeWidth={1.3} />
      <H className="relative mb-2.5 text-[1.3rem] leading-[1.15] font-semibold tracking-[-0.02em]">{service.title}</H>
      <p className="relative text-[0.95rem] text-mute">{service.description}</p>
    </m.article>
  );
}
