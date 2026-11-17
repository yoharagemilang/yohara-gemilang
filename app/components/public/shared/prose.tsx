// app/components/public/shared/prose.tsx
// Isi rich text dari admin (sudah dibersihkan di server saat disimpan). Dipakai Tentang, artikel, portofolio.
import { richContentClass } from '~/lib/rich-content';
import { cn } from '~/lib/utils';

export function Prose({ html, className }: { html: string; className?: string }) {
  return <div className={cn(richContentClass, 'text-base leading-[1.75] text-ink/90 md:text-[1.05rem] [&_h2]:text-2xl', className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
