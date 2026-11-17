// app/components/public/about/about-story.tsx
// Cerita perusahaan. Kolom kiri memuat tahun berdiri, kolom kanan isi dari editor teks kaya.
import { Reveal } from '../shared/reveal';
import { Prose } from '../shared/prose';
import { Eyebrow, Section, h2Class } from '../shared/section';
import type { AboutData } from '~/services/public/about.server';

export function AboutStory({ about }: { about: AboutData['about'] }) {
  if (!about.contentHtml) return null;
  return (
    <Section>
      <div className="grid gap-9 min-[900px]:grid-cols-[0.8fr_1.2fr] min-[900px]:gap-22">
        <Reveal>
          <Eyebrow>Cerita kami</Eyebrow>
          <h2 className={h2Class}>Perjalanan kami</h2>
          {about.foundedYear ? (
            <dl className="mt-8 grid max-w-xs grid-cols-2 gap-6 border-t border-line pt-6">
              <div>
                <dt className="text-[0.8rem] text-mute">Berdiri sejak</dt>
                <dd className="mt-1 text-2xl font-semibold tracking-[-0.02em]">{about.foundedYear}</dd>
              </div>
              {about.yearsActive ? (
                <div>
                  <dt className="text-[0.8rem] text-mute">Pengalaman</dt>
                  <dd className="mt-1 text-2xl font-semibold tracking-[-0.02em]">{about.yearsActive} tahun</dd>
                </div>
              ) : null}
            </dl>
          ) : null}
        </Reveal>
        <Reveal delay={0.1}>
          <Prose html={about.contentHtml} />
        </Reveal>
      </div>
    </Section>
  );
}
