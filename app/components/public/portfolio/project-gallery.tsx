// app/components/public/portfolio/project-gallery.tsx
// Galeri foto proyek: grid landscape seragam 1/2/3 kolom. Klik foto membuka modal.
import { Maximize2 } from 'lucide-react';
import { useState } from 'react';

import { CldImage } from '~/components/cld-image';
import type { PublicMedia } from '~/services/public/media';
import { Reveal } from '../shared/reveal';
import { Section, SectionHead } from '../shared/section';
import { GalleryLightbox } from './gallery-lightbox';

export function ProjectGallery({ images, title }: { images: PublicMedia[]; title: string }) {
  const [active, setActive] = useState<number | null>(null);
  if (images.length === 0) return null;
  return (
    <Section>
      <Reveal>
        <SectionHead eyebrow="Galeri" title="Dokumentasi acara" />
      </Reveal>
      <div className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
        {images.map((img, i) => (
          <Reveal key={img.publicId} delay={(i % 3) * 0.06}>
            <button
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Perbesar foto ${i + 1} dari ${images.length}`}
              className="group relative block aspect-3/2 w-full cursor-zoom-in overflow-hidden rounded-xl bg-soft focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand"
            >
              <CldImage
                media={img}
                aspect={3 / 2}
                alt=""
                widths={[480, 800, 1200]}
                sizes="(min-width: 1024px) 370px, (min-width: 640px) 50vw, 100vw"
                className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
              />
              <span
                aria-hidden
                className="absolute right-3 bottom-3 grid size-9 place-items-center rounded-full bg-white text-ink opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 pointer-coarse:opacity-100"
              >
                <Maximize2 className="size-4" strokeWidth={1.7} />
              </span>
            </button>
          </Reveal>
        ))}
      </div>
      <GalleryLightbox images={images} title={title} index={active} onIndexChange={setActive} />
    </Section>
  );
}
