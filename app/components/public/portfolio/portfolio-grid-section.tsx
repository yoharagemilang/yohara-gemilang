// app/components/public/portfolio/portfolio-grid-section.tsx
// Daftar proyek: filter, grid 1/2/3 kolom, penomoran halaman, atau pesan bila kosong.
import { Link } from "react-router";

import { cta } from "../shared/cta";
import { Pagination } from "../shared/pagination";
import { Reveal } from "../shared/reveal";
import { Container } from "../shared/section";
import type { getPortfolioList } from "~/services/public/portfolio.server";
import { PortfolioCard } from "./portfolio-card";
import { PortfolioFilter } from "./portfolio-filter";

type Data = Awaited<ReturnType<typeof getPortfolioList>>;

export function PortfolioGridSection({ data }: { data: Data }) {
  const hrefFor = (page: number) => {
    const qs = new URLSearchParams();
    if (data.activeId) qs.set("layanan", data.activeId);
    if (page > 1) qs.set("halaman", String(page));
    const s = qs.toString();
    return s ? `/portofolio?${s}` : "/portofolio";
  };

  return (
    <Container className="py-14 md:py-20">
      <PortfolioFilter filters={data.filters} activeId={data.activeId} />
      {data.projects.length === 0 ? (
        <div className="mt-10 rounded-xl border border-line p-10 text-center">
          <p className="text-mute">Belum ada proyek untuk ditampilkan. Ceritakan acara Anda, kami siap membantu.</p>
          <Link prefetch="viewport" to="/kontak" className={cta("red", "mt-6")}>
            Hubungi kami
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {data.projects.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 0.08}>
              <PortfolioCard
                project={p}
                sizes="(min-width: 1024px) 380px, (min-width: 768px) 50vw, 100vw"
                headingLevel="h2"
                className="h-full min-h-85 md:min-h-95"
              />
            </Reveal>
          ))}
        </div>
      )}
      <Pagination page={data.page} pages={data.pages} hrefFor={hrefFor} />
    </Container>
  );
}
