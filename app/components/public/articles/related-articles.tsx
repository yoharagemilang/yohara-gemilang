// app/components/public/articles/related-articles.tsx
import { Reveal } from '../shared/reveal';
import { Section, SectionHead } from '../shared/section';
import type { ArticleListItem } from '~/services/public/article.server';
import { ArticleCard } from './article-card';

export function RelatedArticles({ articles }: { articles: ArticleListItem[] }) {
  if (articles.length === 0) return null;
  return (
    <Section soft>
      <Reveal>
        <SectionHead eyebrow="Baca juga" title="Artikel lainnya" />
      </Reveal>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((a, i) => (
          <Reveal key={a.id} delay={i * 0.08}>
            <ArticleCard article={a} className="h-full" />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
