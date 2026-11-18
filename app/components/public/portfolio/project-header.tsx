// app/components/public/portfolio/project-header.tsx
// Kepala halaman detail: tautan kembali, judul, ringkasan, dan fakta singkat proyek.
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';

import { formatNumberId } from '~/lib/format';
import { Container, Eyebrow, h1Class } from '../shared/section';
import type { ProjectDetail } from '~/services/public/portfolio.server';

export function ProjectHeader({ project }: { project: ProjectDetail }) {
  const facts = [
    { label: 'Layanan', value: project.serviceTitle },
    { label: 'Kota', value: project.city },
    { label: 'Tahun', value: String(project.year) },
    { label: 'Jumlah tamu', value: project.guestCount ? formatNumberId(project.guestCount) : null },
  ].filter((f): f is { label: string; value: string } => !!f.value);

  return (
    <header className="border-b border-line pt-32 pb-12 md:pt-44 md:pb-16">
      <Container>
        <Link to="/portofolio" className="mb-8 flex w-fit items-center gap-2 text-[0.9rem] font-medium text-mute transition-colors hover:text-brand">
          <ArrowLeft aria-hidden className="size-4" strokeWidth={1.6} />
          Semua portofolio
        </Link>
        <Eyebrow>{project.serviceTitle ?? 'Portofolio'}</Eyebrow>
        <h1 className={h1Class}>{project.title}</h1>
        <p className="mt-5 max-w-[62ch] text-[1.05rem] text-mute">{project.summary}</p>
        <dl className="mt-10 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-6 border-t border-line pt-6 sm:grid-cols-4">
          {facts.map((f) => (
            <div key={f.label}>
              <dt className="text-[0.8rem] text-mute">{f.label}</dt>
              <dd className="mt-1 font-semibold">{f.value}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </header>
  );
}
