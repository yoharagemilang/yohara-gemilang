// app/components/public/home/hero-section.tsx
import { SmartLink } from '../shared/smart-link';
import { cta } from '../shared/cta';
import { Container, Eyebrow, h1Class } from '../shared/section';
import type { HomeData } from '~/services/public/home.server';
import { HeroCarousel } from './hero-carousel';

export function HeroSection({ hero }: { hero: HomeData['hero'] }) {
  return (
    <section className="pt-28 pb-18 md:pt-38 md:pb-28">
      <Container>
        <div className="mb-12 grid items-end gap-7 md:mb-16 min-[900px]:grid-cols-[1.4fr_1fr] min-[900px]:gap-20">
          <div>
            <Eyebrow>{hero.eyebrow}</Eyebrow>
            <h1 className={h1Class}>
              {hero.heading} <span className="text-brand">{hero.headingAccent}</span>
            </h1>
          </div>
          <div>
            <p className="text-[1.04rem] text-mute">{hero.description}</p>
            <div className="mt-6.5 flex flex-wrap gap-2.5">
              <SmartLink href={hero.primaryHref} className={cta('red')}>
                {hero.primaryLabel}
              </SmartLink>
              {hero.secondaryLabel && hero.secondaryHref ? (
                <SmartLink href={hero.secondaryHref} className={cta('line')}>
                  {hero.secondaryLabel}
                </SmartLink>
              ) : null}
            </div>
          </div>
        </div>
        <HeroCarousel slides={hero.slides} />
      </Container>
    </section>
  );
}
