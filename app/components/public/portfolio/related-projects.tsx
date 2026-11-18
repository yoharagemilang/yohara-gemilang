// app/components/public/portfolio/related-projects.tsx
import { Reveal } from '../shared/reveal';
import { Section, SectionHead } from '../shared/section';
import type { PortfolioListItem } from '~/services/public/portfolio.server';
import { PortfolioCard } from './portfolio-card';

export function RelatedProjects({ projects }: { projects: PortfolioListItem[] }) {
  if (projects.length === 0) return null;
  return (
    <Section soft>
      <Reveal>
        <SectionHead eyebrow="Proyek lain" title="Acara serupa yang pernah kami kerjakan" />
      </Reveal>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.08}>
            <PortfolioCard project={p} sizes="(min-width: 1024px) 380px, (min-width: 768px) 50vw, 100vw" className="h-full min-h-85 md:min-h-95" />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
