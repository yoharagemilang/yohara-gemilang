// app/components/public/articles/article-body.tsx
// Foto sampul dan isi artikel. Jarak bawah dibuat sendiri karena bagian berikutnya berlatar abu.
import { CldImage } from '~/components/cld-image';
import { Prose } from '../shared/prose';
import { Container } from '../shared/section';
import type { ArticleDetail } from '~/services/public/article.server';

export function ArticleBody({ article }: { article: ArticleDetail }) {
  return (
    <Container className="pt-10 pb-20 md:pt-14 md:pb-30">
      {article.cover ? (
        <div className="relative aspect-video overflow-hidden rounded-xl bg-soft md:aspect-21/9">
          <CldImage media={article.cover} priority widths={[640, 960, 1280, 1800]} sizes="(min-width: 1280px) 1120px, 100vw" className="absolute inset-0 size-full object-cover" />
        </div>
      ) : null}
      {article.contentHtml ? (
        <div className="mt-12 max-w-3xl">
          <Prose html={article.contentHtml} />
        </div>
      ) : null}
    </Container>
  );
}
