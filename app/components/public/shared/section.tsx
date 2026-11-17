// app/components/public/shared/section.tsx
import type { ComponentProps, ReactNode } from 'react';

import { cn } from '~/lib/utils';

export const h1Class = 'text-[clamp(2.2rem,5.2vw,4rem)] leading-[1.15] font-semibold tracking-[-0.02em] text-balance';
export const h2Class = 'text-[clamp(1.75rem,3.4vw,2.6rem)] leading-[1.15] font-semibold tracking-[-0.02em] text-balance';

export function Container({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('mx-auto w-full max-w-300 px-5 md:px-10', className)} {...props} />;
}

export function Section({ soft, className, children, ...props }: ComponentProps<'section'> & { soft?: boolean }) {
  return (
    <section className={cn('py-20 md:py-30', soft && 'bg-soft', className)} {...props}>
      <Container>{children}</Container>
    </section>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('mb-3.5 inline-block text-xs font-semibold tracking-[0.14em] text-brand uppercase', className)}>{children}</span>;
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
