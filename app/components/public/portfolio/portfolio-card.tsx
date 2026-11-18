// app/components/public/portfolio/portfolio-card.tsx
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router';

import { CldImage } from '~/components/cld-image';
import { formatNumberId } from '~/lib/format';
import { cn } from '~/lib/utils';
import type { PublicMedia } from '~/services/public/media';

export type PortfolioCardItem = {
  slug: string;
  title: string;
  city: string;
  year: number;
  guestCount: number | null;
  serviceTitle: string | null;
  cover: PublicMedia | null;
};

export function PortfolioCard({
  project,
  sizes = '(min-width: 768px) 60vw, 100vw',
  className,
  headingLevel: H = 'h3',
}: {
  project: PortfolioCardItem;
  sizes?: string;
  className?: string;
  /** h2 dipakai di halaman daftar yang tidak punya h2 di atasnya. */
  headingLevel?: 'h2' | 'h3';
}) {
  const meta = [project.city, String(project.year), project.guestCount ? `${formatNumberId(project.guestCount)} tamu` : null].filter(Boolean) as string[];

  return (
    <Link to={`/portofolio/${project.slug}`} className={cn('group relative block min-h-85 overflow-hidden rounded-xl bg-linear-to-br from-[#2d2d2d] to-[#141414] text-white md:min-h-115', className)}>
      {project.cover ? (
        <CldImage media={project.cover} widths={[640, 960, 1400]} sizes={sizes} className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none" />
      ) : null}
      <div aria-hidden className="absolute inset-0 bg-linear-to-t from-[#0a0a0a]/80 via-[#0a0a0a]/25 to-[#0a0a0a]/10" />

      <div className="absolute inset-x-5 top-5 z-10 flex items-center justify-between">
        {project.serviceTitle ? <span className="rounded-md border border-white/20 bg-white/15 px-3 py-1.75 text-xs font-semibold tracking-widest uppercase backdrop-blur-sm">{project.serviceTitle}</span> : <span />}
        <span className="grid size-9.5 place-items-center rounded-lg bg-white text-ink">
          <ArrowUpRight aria-hidden className="size-4" strokeWidth={1.6} />
        </span>
      </div>

      <div className="absolute inset-x-6 bottom-6 z-10">
        <H className="max-w-[22ch] text-[clamp(1.3rem,2.4vw,1.75rem)] leading-[1.2] font-semibold tracking-[-0.02em]">{project.title}</H>
        <div className="mt-3.5 flex gap-3.5 border-t border-white/30 pt-3.5 text-[0.84rem] text-white/85">
          {meta.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}
