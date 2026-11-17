// app/components/public/cta.ts
// Gaya tombol situs publik di atas buttonVariants milik shadcn: radius kecil, satu aksen merah.
import { buttonVariants } from '~/components/ui/button';
import { cn } from '~/lib/utils';

const base = 'h-auto gap-2 rounded-lg px-6.5 py-3.5 text-[0.92rem] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand';

const tone = {
  red: 'border-0 bg-brand text-white hover:bg-brand-dark',
  dark: 'border-0 bg-ink text-white hover:bg-[#2c2c2c]',
  line: 'border border-ink bg-transparent text-ink hover:bg-ink hover:text-white',
} as const;

export function cta(kind: keyof typeof tone = 'red', className?: string) {
  return cn(buttonVariants({ variant: 'default', size: 'default' }), base, tone[kind], className);
}
