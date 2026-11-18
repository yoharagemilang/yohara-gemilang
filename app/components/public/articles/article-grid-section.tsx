// app/components/public/articles/article-grid-section.tsx
// Daftar artikel: filter kategori, grid 1/2/3 kolom, penomoran halaman, atau pesan bila kosong.
import { Link } from 'react-router';

import { cta } from '../shared/cta';
import { Pagination } from '../shared/pagination';
import { Reveal } from '../shared/reveal';
import { Container } from '../shared/section';
import type { getArticleList } from '~/services/public/article.server';
import { ArticleCard } from './article-card';
import { ArticleFilter } from './article-filter';

type Data = Awaited<ReturnType<typeof getArticleList>>;

export function ArticleGridSection({ data }: { data: Data }) {
  const hrefFor = (page: number) => {
    const qs = new URLSearchParams();
    if (data.active) qs.set('kategori', data.active);
    if (page > 1) qs.set('halaman', String(page));
    const s = qs.toString();
    return s ? `/artikel?${s}` : '/artikel';
  };

  return (
    <Container className="py-14 md:py-20">
      <ArticleFilter categories={data.categories} active={data.active} />
      {data.articles.length === 0 ? (
        <div className="mt-10 rounded-xl border border-line p-10 text-center">
          <p className="text-mute">Belum ada artikel yang dipublikasikan.</p>
          <Link to="/kontak" className={cta('red', 'mt-6')}>
            Hubungi kami
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.articles.map((a, i) => (
            <Reveal key={a.id} delay={(i % 3) * 0.08}>
              <ArticleCard article={a} className="h-full" />
            </Reveal>
          ))}
        </div>
      )}
      <Pagination page={data.page} pages={data.pages} hrefFor={hrefFor} />
    </Container>
  );
}
