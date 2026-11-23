// app/components/public/home/cta-band.tsx
import { Link } from 'react-router';

import { waLink } from '~/lib/contact';
import { useSite } from '../layout/use-site';
import { cta } from '../shared/cta';
import { Reveal } from '../shared/reveal';
import { Container, Eyebrow, h2Class } from '../shared/section';

export function CtaBand() {
  const site = useSite();
  return (
    <section className="relative overflow-hidden bg-brand py-16 text-white md:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.13)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.13)_1px,transparent_1px)] bg-size-[64px_64px] mask-[linear-gradient(to_left,black,transparent_70%)]"
      />
      <Container className="relative">
        <Reveal className="grid items-end gap-8 min-[900px]:grid-cols-[1.4fr_1fr] min-[900px]:gap-20">
          <div>
            <Eyebrow className="text-white">Ketersediaan</Eyebrow>
            <h2 className={`${h2Class} max-w-[18ch]`}>Sudah punya tanggal acara?</h2>
            <p className="mt-4 max-w-[52ch] text-white/90">Kirim tanggal dan perkiraan jumlah tamu. Kami cek ketersediaan tim dan membalas dalam satu hari kerja.</p>
          </div>
          <div className="flex flex-wrap gap-2.5 min-[900px]:justify-end">
            <Link prefetch="viewport" to="/kontak" className={cta('white')}>
              Cek ketersediaan
            </Link>
            {site?.whatsapp ? (
              <a href={waLink(site.whatsapp, 'Halo Yohara Gemilang Management, saya ingin konsultasi acara.')} target="_blank" rel="noopener noreferrer" className={cta('lineWhite')}>
                Chat WhatsApp
              </a>
            ) : null}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
