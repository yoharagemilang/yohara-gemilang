// app/components/public/portfolio/gallery-lightbox.tsx
// Modal foto galeri: panah, keyboard, geser di layar sentuh, dan penanda posisi.
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '~/components/ui/dialog';
import { cldSrcSet, cldUrl, useCloudName } from '~/lib/cloudinary-url';
import { cn } from '~/lib/utils';
import type { PublicMedia } from '~/services/public/media';

const roundBtn =
  'grid size-11 shrink-0 place-items-center rounded-full border border-white/25 bg-white/10 text-white transition-colors hover:bg-white hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-95 disabled:pointer-events-none disabled:opacity-30';

export function GalleryLightbox({ images, title, index, onIndexChange }: { images: PublicMedia[]; title: string; index: number | null; onIndexChange: (i: number | null) => void }) {
  const cloud = useCloudName();
  const open = index !== null;
  const count = images.length;
  const start = useRef<number | null>(null);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (index === null) return;
      onIndexChange((index + dir + count) % count);
    },
    [index, count, onIndexChange],
  );

  useEffect(() => {
    if (index === null || !cloud) return;
    for (const i of [index + 1, index - 1]) {
      const img = images[(i + count) % count];
      if (img) new Image().src = cldUrl(cloud, img.publicId, { w: 1600, crop: 'limit' });
    }
  }, [index, images, count, cloud]);

  const current = index === null ? null : images[index];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onIndexChange(null)}>
      <DialogContent
        showCloseButton={false}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') go(1);
          else if (e.key === 'ArrowLeft') go(-1);
        }}
        className="fixed inset-0 top-0 left-0 grid h-dvh w-screen max-w-none! translate-x-0 translate-y-0 grid-rows-[auto_1fr_auto] gap-0 rounded-none! border-0 bg-ink/98! p-0! text-white shadow-none! ring-0!"
      >
        <DialogTitle className="sr-only">{`Foto ${title}`}</DialogTitle>
        <DialogDescription className="sr-only">Gunakan tombol panah untuk berpindah foto dan Escape untuk menutup.</DialogDescription>

        <div className="flex items-center justify-between px-5 py-4 md:px-8">
          <p className="font-mono text-[0.85rem] tracking-[0.08em] text-white/80" aria-live="polite">
            {index === null ? '' : `${index + 1} / ${count}`}
          </p>
          <DialogClose className={roundBtn} aria-label="Tutup">
            <X className="size-5" strokeWidth={1.6} />
          </DialogClose>
        </div>

        <div
          className="relative flex min-h-0 items-center justify-center px-5 [touch-action:pan-y] md:px-24"
          onClick={(e) => e.target === e.currentTarget && onIndexChange(null)}
          onPointerDown={(e) => {
            start.current = e.clientX;
          }}
          onPointerUp={(e) => {
            if (start.current === null) return;
            const dx = e.clientX - start.current;
            start.current = null;
            if (Math.abs(dx) > 56) go(dx < 0 ? 1 : -1);
          }}
        >
          {count > 1 ? (
            <button type="button" onClick={() => go(-1)} aria-label="Foto sebelumnya" className={cn(roundBtn, 'absolute left-3 z-10 md:left-8')}>
              <ChevronLeft className="size-5" strokeWidth={1.6} />
            </button>
          ) : null}
          {current && cloud ? (
            <img
              key={current.publicId}
              src={cldUrl(cloud, current.publicId, { w: 1280, crop: 'limit' })}
              srcSet={cldSrcSet(cloud, current.publicId, [800, 1280, 1920])}
              sizes="100vw"
              alt={current.alt || `${title}, foto ${index! + 1}`}
              draggable={false}
              className="max-h-full max-w-full rounded-lg object-contain select-none animate-in fade-in duration-300 motion-reduce:animate-none"
            />
          ) : null}
          {count > 1 ? (
            <button type="button" onClick={() => go(1)} aria-label="Foto berikutnya" className={cn(roundBtn, 'absolute right-3 z-10 md:right-8')}>
              <ChevronRight className="size-5" strokeWidth={1.6} />
            </button>
          ) : null}
        </div>

        <p className="min-h-16 px-5 py-4 text-center text-[0.9rem] text-white/75 md:px-8">{current?.alt ?? ''}</p>
      </DialogContent>
    </Dialog>
  );
}
