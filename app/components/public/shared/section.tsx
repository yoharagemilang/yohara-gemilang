// app/components/public/shared/section.tsx
import type { ComponentProps, ReactNode } from 'react';

import { cn } from '~/lib/utils';

export const h1Class = 'text-[clamp(2.2rem,5.2vw,4rem)] leading-[1.15] font-semibold tracking-[-0.02em] text-balance';
export const h2Class = 'text-[clamp(1.75rem,3.4vw,2.6rem)] leading-[1.15] font-semibold tracking-[-0.02em] text-balance';

export function Container({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('mx-auto w-full max-w-300 px-5 md:px-10', className)} {...props} />;
}

const textures = {
  grid: 'opacity-70 bg-[linear-gradient(to_right,var(--color-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-line)_1px,transparent_1px)] bg-size-[64px_64px] mask-[linear-gradient(to_bottom,black,transparent_80%)]',
  dots: 'bg-[radial-gradient(var(--color-line)_1.3px,transparent_1.4px)] bg-size-[22px_22px] mask-[radial-gradient(ellipse_at_top_right,black,transparent_62%)]',
  lines: 'bg-[repeating-linear-gradient(135deg,var(--color-line)_0,var(--color-line)_1px,transparent_1px,transparent_14px)] mask-[radial-gradient(ellipse_at_bottom_left,black,transparent_60%)]',
} as const;

export type Texture = keyof typeof textures;

export function Section({ soft, texture, className, children, ...props }: ComponentProps<'section'> & { soft?: boolean; texture?: Texture }) {
  return (
    <section className={cn('relative py-20 md:py-30', soft && 'bg-soft', texture && 'overflow-hidden', className)} {...props}>
      {texture ? <div aria-hidden className={cn('pointer-events-none absolute inset-0', textures[texture])} /> : null}
      <Container className="relative">{children}</Container>
    </section>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('mb-3.5 inline-flex items-center gap-3 text-xs font-semibold tracking-[0.14em] text-brand uppercase before:h-px before:w-6 before:bg-current', className)}>{children}</span>;
}

/** Kepala bagian: label kecil, judul, deskripsi, dan satu aksi di kanan. */
export function SectionHead({ eyebrow, title, description, action }: { eyebrow?: string; title: ReactNode; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-12 flex flex-wrap items-end justify-between gap-5">
      <div>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h2 className={h2Class}>{title}</h2>
        {description ? <p className="mt-3 max-w-[62ch] text-mute">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

/** Kepala halaman dalam. Memberi ruang untuk navbar yang menempel di atas. */
export function PageHeader({ eyebrow, title, description, children }: { eyebrow?: string; title: ReactNode; description?: string; children?: ReactNode }) {
  return (
    <header className="border-b border-line pt-32 pb-12 md:pt-44 md:pb-16">
      <Container>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h1 className={h1Class}>{title}</h1>
        {description ? <p className="mt-4 max-w-[62ch] text-mute md:text-[1.04rem]">{description}</p> : null}
        {children}
      </Container>
    </header>
  );
}
