// app/routes/public/portofolio-detail.tsx
// Detail proyek: /portofolio/:slug. Draf atau slug tak dikenal menghasilkan 404.
import { ProjectBody } from '~/components/public/portfolio/project-body';
import { ProjectGallery } from '~/components/public/portfolio/project-gallery';
import { ProjectHeader } from '~/components/public/portfolio/project-header';
import { RelatedProjects } from '~/components/public/portfolio/related-projects';
import { CtaBanner } from '~/components/public/shared/cta-banner';
import { PublicErrorView } from '~/components/public/shared/error-view';
import { publicHeaders } from '~/lib/public-headers';
import { getProjectDetail } from '~/services/public/portfolio.server';
import type { Route } from './+types/portofolio-detail';

export function loader({ params }: Route.LoaderArgs) {
  return getProjectDetail(params.slug);
}

export const headers = publicHeaders;

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData) return [{ title: 'Proyek tidak ditemukan | Yohara Gemilang Management' }, { name: 'robots', content: 'noindex' }];
  return [{ title: `${loaderData.project.title} | Yohara Gemilang Management` }, { name: 'description', content: loaderData.project.summary }];
}

export default function PortofolioDetail({ loaderData }: Route.ComponentProps) {
  const { project, related } = loaderData;
  return (
    <>
      <ProjectHeader project={project} />
      <ProjectBody project={project} />
      <ProjectGallery images={project.gallery} title={project.title} />
      <RelatedProjects projects={related} />
      <CtaBanner />
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <PublicErrorView error={error} />;
}
