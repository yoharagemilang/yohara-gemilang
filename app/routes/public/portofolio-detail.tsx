// app/routes/public/portofolio-detail.tsx
// Detail proyek: /portofolio/:slug. Draf atau slug tak dikenal menghasilkan 404.
import { ProjectBody } from "~/components/public/portfolio/project-body";
import { ProjectGallery } from "~/components/public/portfolio/project-gallery";
import { ProjectHeader } from "~/components/public/portfolio/project-header";
import { RelatedProjects } from "~/components/public/portfolio/related-projects";
import { CtaBanner } from "~/components/public/shared/cta-banner";
import { PublicErrorView } from "~/components/public/shared/error-view";
import { publicHeaders } from "~/lib/public-headers";
import { getProjectDetail } from "~/services/public/portfolio.server";
import type { Route } from "./+types/portofolio-detail";
import { breadcrumbLd, noindexMeta, seoMeta } from "~/lib/seo";

export function loader({ params }: Route.LoaderArgs) {
  return getProjectDetail(params.slug);
}

export const headers = publicHeaders;

export function meta({ loaderData, matches }: Route.MetaArgs) {
  if (!loaderData) return noindexMeta("Proyek tidak ditemukan | Yohara Gemilang Management");
  const { project } = loaderData;
  const path = `/portofolio/${project.slug}`;
  return seoMeta(matches, {
    title: project.title,
    description: project.summary,
    path,
    image: project.cover,
    jsonLd: [
      breadcrumbLd(matches, [
        { name: "Beranda", path: "/" },
        { name: "Portofolio", path: "/portofolio" },
        { name: project.title, path },
      ]),
    ],
  });
}

export default function PortofolioDetail({ loaderData }: Route.ComponentProps) {
  const { project, related } = loaderData;
  return (
    <>
      <ProjectHeader project={project} />
      <ProjectBody project={project} />
      <ProjectGallery images={project.gallery} title={project.title} />
      <RelatedProjects projects={related} />
      <CtaBanner soft={related.length === 0} />
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <PublicErrorView error={error} />;
}
