// app/components/public/about/about-cover.tsx
import { CldImage } from '~/components/cld-image';
import type { PublicMedia } from '~/services/public/media';
import { Container } from '../shared/section';

export function AboutCover({ cover }: { cover: PublicMedia | null }) {
  if (!cover) return null;
  return (
    <Container className="pt-10 md:pt-14">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-soft md:aspect-21/9">
        <CldImage media={cover} priority widths={[640, 960, 1280, 1800]} sizes="(min-width: 1280px) 1120px, 100vw" className="absolute inset-0 size-full object-cover" />
      </div>
    </Container>
  );
}
