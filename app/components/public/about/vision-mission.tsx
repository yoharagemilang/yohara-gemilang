// app/components/public/about/vision-mission.tsx
import { Reveal } from '../shared/reveal';
import { Eyebrow, Section } from '../shared/section';
import type { AboutData } from '~/services/public/about.server';

function Card({ label, text }: { label: string; text: string }) {
  return (
    <div className="h-full rounded-xl border border-line bg-white p-8 md:p-10">
      <Eyebrow>{label}</Eyebrow>
      <p className="max-w-none text-[1.05rem] leading-[1.7] whitespace-pre-line text-ink/90">{text}</p>
    </div>
  );
}

export function VisionMission({ about }: { about: AboutData['about'] }) {
  const items = [
    { label: 'Visi', text: about.vision },
    { label: 'Misi', text: about.mission },
  ].filter((i) => i.text.trim() !== '');
  if (items.length === 0) return null;
  return (
    <Section soft>
      <div className={items.length === 2 ? 'grid gap-6 md:grid-cols-2 md:gap-8' : 'grid gap-6'}>
        {items.map((item, i) => (
          <Reveal key={item.label} delay={i * 0.1}>
            <Card {...item} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
