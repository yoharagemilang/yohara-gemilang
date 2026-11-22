// app/components/public/home/portfolio-section.tsx
import { Link } from "react-router";

import { Reveal } from "../shared/reveal";
import { cta } from "../shared/cta";
import { Section, SectionHead } from "../shared/section";
import { PortfolioCard } from "../portfolio/portfolio-card";
import type { HomeData } from "~/services/public/home.server";

// Tata letak bento 7/5 lalu 5/7. Kelas ditulis utuh supaya terbaca Tailwind.
const spans: Record<number, string[]> = {
  1: ["md:col-span-12"],
  2: ["md:col-span-7", "md:col-span-5"],
  3: ["md:col-span-7", "md:col-span-5", "md:col-span-12"],
  4: ["md:col-span-7", "md:col-span-5", "md:col-span-5", "md:col-span-7"],
};

export function PortfolioSection({ projects }: { projects: HomeData["projects"] }) {
  if (projects.length === 0) return null;
  const layout = spans[projects.length] ?? spans[4]!;
  return (
    <Section>
      <Reveal>
        <SectionHead
          eyebrow="Portofolio"
          title="Proyek pilihan"
          action={
            <Link prefetch="viewport" to="/portofolio" className={cta("line")}>
              Lihat semua portofolio
            </Link>
          }
        />
      </Reveal>
      <div className="grid gap-5 md:grid-cols-12 md:gap-6">
        {projects.map((p, i) => (
          <Reveal key={p.id} delay={(i % 2) * 0.1} className={layout[i]}>
            <PortfolioCard project={p} className="h-full" />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
