// app/components/public/articles/article-card.tsx
import { Link } from "react-router";

import { CldImage } from "~/components/cld-image";
import { formatDateId } from "~/lib/format";
import { cn } from "~/lib/utils";
import type { PublicMedia } from "~/services/public/media";

export type ArticleCardItem = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string | null;
  cover: PublicMedia | null;
};

function Meta({ article }: { article: ArticleCardItem }) {
  return (
    <div className="mb-2 text-[0.8rem] text-mute">
      <b className="mr-2.5 font-semibold text-brand">{article.category}</b>
      {article.publishedAt ? formatDateId(article.publishedAt) : null}
    </div>
  );
}

/** main: kartu besar dengan ringkasan. side: kartu ringkas, gambar di kiri. */
export function ArticleCard({
  article,
  variant = "main",
  className,
  headingLevel: H = "h3",
}: {
  article: ArticleCardItem;
  variant?: "main" | "side";
  className?: string;
  /** h2 dipakai di halaman daftar yang tidak punya h2 di atasnya. */
  headingLevel?: "h2" | "h3";
}) {
  const main = variant === "main";
  return (
    <Link
      prefetch="intent"
      to={`/artikel/${article.slug}`}
      className={cn(
        "group block overflow-hidden rounded-xl border border-line bg-white",
        !main && "grid min-[520px]:grid-cols-[150px_1fr]",
        className,
      )}
    >
      <div className={cn("relative overflow-hidden bg-[#d9d8d4]", main ? "aspect-video" : "aspect-video min-[520px]:aspect-auto min-[520px]:min-h-40")}>
        {article.cover ? (
          <CldImage
            media={article.cover}
            widths={main ? [480, 720, 1200] : [320, 480, 720]}
            sizes={main ? "(min-width: 900px) 55vw, 100vw" : "(min-width: 520px) 150px, 100vw"}
            className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none"
          />
        ) : null}
      </div>
      <div className={main ? "px-7 pt-6 pb-7.5" : "self-center px-5.5 py-5"}>
        <Meta article={article} />
        <H className={cn("leading-[1.15] font-semibold tracking-[-0.02em] group-hover:text-brand", main ? "text-[1.65rem]" : "text-[1.05rem]")}>
          {article.title}
        </H>
        {main ? <p className="mt-3 max-w-[62ch] text-[0.94rem] text-mute">{article.excerpt}</p> : null}
      </div>
    </Link>
  );
}
