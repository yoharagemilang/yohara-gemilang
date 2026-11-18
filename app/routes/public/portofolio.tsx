// app/routes/public/portofolio.tsx
// Daftar portofolio: ?layanan=<id> memfilter, ?halaman=<n> memilih halaman.
import { PortfolioGridSection } from '~/components/public/portfolio/portfolio-grid-section';
import { PageHeader } from '~/components/public/shared/section';
import { publicHeaders } from '~/lib/public-headers';
import { getPortfolioList } from '~/services/public/portfolio.server';
import type { Route } from './+types/portofolio';

export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const page = Number.parseInt(url.searchParams.get('halaman') ?? '1', 10);
  return getPortfolioList({
    serviceId: url.searchParams.get('layanan'),
    page: Number.isFinite(page) ? page : 1,
  });
}

export const headers = publicHeaders;

export function meta() {
  return [{ title: 'Portofolio | Yohara Gemilang Management' }];
}

export default function Portofolio({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <PageHeader eyebrow="Portofolio" title="Acara yang pernah kami kerjakan" description="Pilih jenis layanan untuk menyaring proyek." />
      <PortfolioGridSection data={loaderData} />
    </>
  );
}
