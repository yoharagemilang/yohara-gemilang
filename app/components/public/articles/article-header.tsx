// app/components/public/articles/article-header.tsx
// Kepala halaman detail: tautan kembali, kategori, judul, ringkasan, tanggal, dan waktu baca.
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';

import { formatDateId } from '~/lib/format';
import { Container, Eyebrow, h1Class } from '../shared/section';
import type { ArticleDetail } from '~/services/public/article.server';

export function ArticleHeader({ article }: { article: ArticleDetail }) {
  return (
    <header className="border-b border-line pt-32 pb-12 md:pt-44 md:pb-16">
      <Container>
        <Link to="/artikel" className="mb-8 flex w-fit items-center gap-2 text-[0.9rem] font-medium text-mute transition-colors hover:text-brand">
          <ArrowLeft aria-hidden className="size-4" strokeWidth={1.6} />
          Semua artikel
        </Link>
        <Eyebrow>{article.category}</Eyebrow>
        <h1 className={`${h1Class} max-w-[22ch]`}>{article.title}</h1>
        <p className="mt-5 max-w-[62ch] text-[1.05rem] text-mute">{article.excerpt}</p>
        <p className="mt-6 flex flex-wrap items-center gap-x-3 text-[0.88rem] text-mute">
          {article.publishedAt ? <time dateTime={article.publishedAt}>{formatDateId(article.publishedAt)}</time> : null}
          {article.publishedAt ? <span aria-hidden>·</span> : null}
          <span>{article.readingMinutes} menit baca</span>
        </p>
      </Container>
    </header>
  );
}
