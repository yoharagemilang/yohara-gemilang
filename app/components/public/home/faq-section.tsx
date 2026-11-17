// app/components/public/home/faq-section.tsx
import { Link } from 'react-router';

import { Reveal } from '../shared/reveal';
import { cta } from '../shared/cta';
import { Eyebrow, Section, h2Class } from '../shared/section';
import { FaqAccordion } from '../faq/faq-accordion';
import type { HomeData } from '~/services/public/home.server';

export function FaqSection({ faqs }: { faqs: HomeData['faqs'] }) {
  if (faqs.length === 0) return null;
  return (
    <Section>
      <div className="grid gap-9 min-[900px]:grid-cols-[0.8fr_1.2fr] min-[900px]:gap-22">
        <Reveal>
          <Eyebrow>FAQ</Eyebrow>
          <h2 className={h2Class}>Pertanyaan yang sering diajukan</h2>
          <p className="mt-3.5 text-mute">Tidak menemukan jawabannya? Hubungi kami, biasanya dibalas dalam satu hari kerja.</p>
          <Link to="/faq" className={cta('line', 'mt-6')}>
            Semua pertanyaan
          </Link>
        </Reveal>
        <Reveal delay={0.1}>
          <FaqAccordion items={faqs} />
        </Reveal>
      </div>
    </Section>
  );
}
