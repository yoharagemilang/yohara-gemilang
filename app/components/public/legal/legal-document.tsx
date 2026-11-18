// app/components/public/legal/legal-document.tsx
// Tata letak dokumen hukum: daftar isi menempel di kiri (layar lebar), pasal bernomor di kanan.
import { formatDateId } from '~/lib/format';
import { Container } from '../shared/section';
import { LEGAL_UPDATED, type LegalSection } from './legal-types';

export function LegalDocument({ sections }: { sections: LegalSection[] }) {
  return (
    <Container className="py-14 md:py-20">
      <div className="grid gap-10 min-[900px]:grid-cols-[240px_1fr] min-[900px]:gap-16">
        <nav aria-label="Daftar isi" className="min-[900px]:sticky min-[900px]:top-28 min-[900px]:self-start">
          <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-mute uppercase">Daftar isi</p>
          <ol className="space-y-2 text-[0.9rem]">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="flex gap-2.5 text-mute transition-colors hover:text-brand">
                  <span aria-hidden className="w-5 shrink-0 tabular-nums">
                    {i + 1}.
                  </span>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="max-w-3xl">
          <p className="mb-10 text-[0.9rem] text-mute">
            Terakhir diperbarui <time dateTime={LEGAL_UPDATED}>{formatDateId(LEGAL_UPDATED)}</time>
          </p>
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="mb-10 scroll-mt-4 last:mb-0">
              <h2 className="mb-3 text-[1.3rem] leading-[1.25] font-semibold tracking-[-0.01em]">
                {i + 1}. {s.title}
              </h2>
              <div className="space-y-3.5 text-[1rem] leading-[1.75] text-ink/90">
                {s.body.map((b, j) =>
                  typeof b === 'string' ? (
                    <p key={j}>{b}</p>
                  ) : (
                    <ul key={j} className="list-disc space-y-1.5 pl-5 marker:text-brand">
                      {b.list.map((li) => (
                        <li key={li}>{li}</li>
                      ))}
                    </ul>
                  ),
                )}
              </div>
            </section>
          ))}
        </article>
      </div>
    </Container>
  );
}
