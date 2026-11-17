// app/components/public/home/hero-carousel.tsx
// Carousel hero: gambar dan video pendek tanpa suara. Slide pertama selalu gambar dan dimuat lebih dulu.
// Berhenti sendiri saat kursor/fokus di atasnya, saat tombol jeda ditekan, atau untuk pengguna reduced-motion.
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { CldImage } from '~/components/cld-image';
import { Button } from '~/components/ui/button';
import { cldUrl, cldVideoSources, useCloudName } from '~/lib/cloudinary-url';
import { cn } from '~/lib/utils';
import type { HeroSlideView } from '~/services/public/home.server';

const IMAGE_MS = 5500;
const ctrl = 'size-9 rounded-lg bg-white/15 text-white backdrop-blur-sm hover:bg-white/30 hover:text-white';

function SlideVideo({ slide, active, playing, loop, onEnded }: { slide: HeroSlideView; active: boolean; playing: boolean; loop: boolean; onEnded: () => void }) {
  const cloud = useCloudName();
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (active && playing) v.play().catch(() => {});
    else {
      v.pause();
      if (!active) v.currentTime = 0;
    }
  }, [active, playing]);

  if (!cloud) return null;
  return (
    <video
      ref={ref}
      muted
      playsInline
      loop={loop}
      preload={active ? 'auto' : 'none'}
      poster={cldUrl(cloud, slide.publicId, { w: 1280, kind: 'VIDEO' })}
      aria-label={slide.alt || undefined}
      onEnded={onEnded}
      className="absolute inset-0 size-full object-cover"
    >
      {cldVideoSources(cloud, slide.publicId).map((s) => (
        <source key={s.src} src={s.src} type={s.type} />
      ))}
    </video>
  );
}

export function HeroCarousel({ slides }: { slides: HeroSlideView[] }) {
  const n = slides.length;
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  // Hanya slide yang sedang dan akan tampil yang dimuat, supaya hemat data
  const [seen, setSeen] = useState<Set<number>>(() => new Set(n > 1 ? [0, 1] : [0]));

  const playing = n > 1 && !userPaused && !interacting && !reduced;
  const go = useCallback((i: number) => setIndex(((i % n) + n) % n), [n]);

  useEffect(() => {
    setSeen((prev) => {
      const next = new Set(prev).add(index).add((index + 1) % n);
      return next.size === prev.size ? prev : next;
    });
  }, [index, n]);

  useEffect(() => {
    if (!playing) return;
    const s = slides[index];
    // Video lanjut saat selesai diputar (onEnded). Pewaktu ini hanya cadangan kalau video gagal dimuat.
    const ms = s?.kind === 'VIDEO' ? Math.max(8000, ((s.duration ?? 15) + 2) * 1000) : IMAGE_MS;
    const t = setTimeout(() => go(index + 1), ms);
    return () => clearTimeout(t);
  }, [playing, index, slides, go]);

  const caption = slides[index];

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Foto dan video acara"
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setInteracting(true)}
      onBlurCapture={() => setInteracting(false)}
      className="relative aspect-4/3 overflow-hidden rounded-xl bg-linear-to-br from-[#2b2b2b] to-[#141414] md:aspect-21/9"
    >
      {slides.map((s, i) =>
        seen.has(i) ? (
          <div
            key={s.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} dari ${n}`}
            aria-hidden={i !== index}
            className={cn('absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none', i === index ? 'opacity-100' : 'pointer-events-none opacity-0')}
          >
            {s.kind === 'VIDEO' ? (
              <SlideVideo slide={s} active={i === index} playing={playing || (n === 1 && !reduced)} loop={n === 1} onEnded={() => n > 1 && go(index + 1)} />
            ) : (
              <CldImage media={s} priority={i === 0} widths={[640, 960, 1280, 1800]} sizes="(min-width: 1280px) 1120px, 100vw" className="size-full object-cover" />
            )}
          </div>
        ) : null,
      )}

      {caption && (caption.captionTitle || caption.captionMeta || n > 1) ? <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-black/55 to-transparent" /> : null}

      {caption && (caption.captionTitle || caption.captionMeta) ? (
        <div className="absolute right-5 bottom-5 left-5 flex flex-col text-[0.84rem] text-white md:right-auto md:max-w-[60%]">
          {caption.captionTitle ? <b className="text-[0.95rem] font-semibold">{caption.captionTitle}</b> : null}
          {caption.captionMeta ? <span className="opacity-85">{caption.captionMeta}</span> : null}
        </div>
      ) : null}

      {n > 1 ? (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 md:top-auto md:right-5 md:bottom-5">
          <Button variant="ghost" size="icon" aria-label="Slide sebelumnya" onClick={() => go(index - 1)} className={ctrl}>
            <ChevronLeft className="size-4" />
          </Button>
          <div className="flex items-center gap-1.5 px-1">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={`Ke slide ${i + 1}`}
                aria-current={i === index || undefined}
                onClick={() => go(i)}
                className={cn('h-1.5 rounded-full bg-white transition-all motion-reduce:transition-none', i === index ? 'w-5 opacity-100' : 'w-1.5 opacity-50 hover:opacity-80')}
              />
            ))}
          </div>
          <Button variant="ghost" size="icon" aria-label="Slide berikutnya" onClick={() => go(index + 1)} className={ctrl}>
            <ChevronRight className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label={userPaused ? 'Putar otomatis' : 'Jeda otomatis'} onClick={() => setUserPaused((v) => !v)} className={ctrl}>
            {userPaused ? <Play className="size-4" /> : <Pause className="size-4" />}
          </Button>
        </div>
      ) : null}

      <p aria-live={playing ? 'off' : 'polite'} className="sr-only">
        Slide {index + 1} dari {n}
      </p>
    </div>
  );
}
