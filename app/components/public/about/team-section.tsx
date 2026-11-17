// app/components/public/about/team-section.tsx
import { Reveal } from '../shared/reveal';
import { Section, SectionHead } from '../shared/section';
import type { AboutData } from '~/services/public/about.server';
import { TeamCard } from './team-card';

export function TeamSection({ team }: { team: AboutData['team'] }) {
  if (team.length === 0) return null;
  return (
    <Section>
      <Reveal>
        <SectionHead eyebrow="Tim" title="Orang di balik setiap acara" description="Tim yang mendampingi Anda dari perencanaan sampai hari pelaksanaan." />
      </Reveal>
      <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {team.map((m, i) => (
          <Reveal key={m.id} delay={(i % 4) * 0.08}>
            <TeamCard member={m} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
