// app/components/public/home/articles-section.tsx
import { Link } from "react-router";

import { Reveal } from "../shared/reveal";
import { cta } from "../shared/cta";
import { Section, SectionHead } from "../shared/section";
import { ArticleCard } from "../articles/article-card";
import type { HomeData } from "~/services/public/home.server";

export function ArticlesSection({ articles }: { articles: HomeData["articles"] }) {
  if (articles.length === 0) return null;
  const [main, ...side] = articles;
  return (
    <Section soft>
      <Reveal>
        <SectionHead
          eyebrow="Artikel"
          title="Artikel terbaru"
          action={
            <Link prefetch="viewport" to="/artikel" className={cta("line")}>
              Semua artikel
            </Link>
          }
        />
      </Reveal>
      <div className={side.length > 0 ? "grid gap-6 min-[900px]:grid-cols-[1.2fr_1fr] min-[900px]:gap-8" : "grid gap-6"}>
        <Reveal>
          <ArticleCard article={main!} variant="main" className="h-full" />
        </Reveal>
        {side.length > 0 ? (
          <div className="grid content-start gap-6">
            {side.map((a, i) => (
              <Reveal key={a.id} delay={0.1 + i * 0.1}>
                <ArticleCard article={a} variant="side" />
              </Reveal>
            ))}
          </div>
        ) : null}
      </div>
    </Section>
  );
}
