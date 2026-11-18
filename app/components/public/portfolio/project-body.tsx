// app/components/public/portfolio/project-body.tsx
// Foto sampul dan cerita proyek. Jarak bawah mengikuti ada/tidaknya galeri.
import { CldImage } from '~/components/cld-image';
import { Prose } from '../shared/prose';
import { Container } from '../shared/section';
import { cn } from '~/lib/utils';
import type { ProjectDetail } from '~/services/public/portfolio.server';

export function ProjectBody({ project }: { project: ProjectDetail }) {
  // Tanpa galeri, bagian berikutnya (proyek lain) berlatar abu dan langsung menempel, jadi beri jarak bawah sendiri.
  const gap = project.gallery.length === 0;
  return (
    <Container className={cn('pt-10 md:pt-14', gap && 'pb-20 md:pb-30')}>
      {project.cover ? (
        <div className="relative aspect-video overflow-hidden rounded-xl bg-soft md:aspect-21/9">
          <CldImage media={project.cover} priority widths={[640, 960, 1280, 1800]} sizes="(min-width: 1280px) 1120px, 100vw" className="absolute inset-0 size-full object-cover" />
        </div>
      ) : null}
      {project.contentHtml ? (
        <div className="mt-12 max-w-3xl">
          <Prose html={project.contentHtml} />
        </div>
      ) : null}
    </Container>
  );
}
