// app/components/public/portfolio/project-gallery.tsx
// Galeri foto proyek: grid landscape seragam 1/2/3 kolom.
import { CldImage } from '~/components/cld-image';
import type { PublicMedia } from '~/services/public/media';
import { Reveal } from '../shared/reveal';
import { Section, SectionHead } from '../shared/section';

export function ProjectGallery({ images, title }: { images: PublicMedia[]; title: string }) {
  if (images.length === 0) return null;
  return (
    <Section>
      <Reveal>
        <SectionHead eyebrow="Galeri" title="Dokumentasi acara" />
      </Reveal>
      <div className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
        {images.map((img, i) => (
          <Reveal key={img.publicId} delay={(i % 3) * 0.06}>
            <div className="relative aspect-3/2 overflow-hidden rounded-xl bg-soft">
              <CldImage media={img} aspect={3 / 2} alt={img.alt || `${title}, foto ${i + 1}`} widths={[480, 800, 1200]} sizes="(min-width: 1024px) 370px, (min-width: 640px) 50vw, 100vw" className="absolute inset-0 size-full object-cover" />
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
