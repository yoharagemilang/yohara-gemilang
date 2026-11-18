// app/routes/public/artikel-detail.tsx
// Detail artikel: /artikel/:slug. Draf atau slug tak dikenal menghasilkan 404.
import { ArticleBody } from '~/components/public/articles/article-body';
import { ArticleHeader } from '~/components/public/articles/article-header';
import { RelatedArticles } from '~/components/public/articles/related-articles';
import { CtaBanner } from '~/components/public/shared/cta-banner';
import { PublicErrorView } from '~/components/public/shared/error-view';
import { publicHeaders } from '~/lib/public-headers';
import { getArticleDetail } from '~/services/public/article.server';
import type { Route } from './+types/artikel-detail';

export function loader({ params }: Route.LoaderArgs) {
  return getArticleDetail(params.slug);
}

export const headers = publicHeaders;

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData) return [{ title: 'Artikel tidak ditemukan | Yohara Gemilang Management' }, { name: 'robots', content: 'noindex' }];
  return [{ title: `${loaderData.article.title} | Yohara Gemilang Management` }, { name: 'description', content: loaderData.article.excerpt }];
}

export default function ArtikelDetail({ loaderData }: Route.ComponentProps) {
  const { article, related } = loaderData;
  return (
    <>
      <ArticleHeader article={article} />
      <ArticleBody article={article} />
      <RelatedArticles articles={related} />
      <CtaBanner soft={related.length === 0} />
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <PublicErrorView error={error} />;
}
