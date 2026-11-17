// app/components/public/shared/cta-banner.tsx
// Penutup halaman: ajakan konsultasi. Dipakai beranda, Tentang, dan halaman lain. Formulir lengkapnya ada di Kontak.
import { Link } from 'react-router';

import { waLink } from '~/lib/contact';
import { useSite } from '../layout/use-site';
import { cta } from '../shared/cta';
import { Reveal } from '../shared/reveal';
import { Eyebrow, Section, h2Class } from '../shared/section';

export function CtaBanner() {
  const site = useSite();
  return (
    <Section soft>
      <Reveal className="grid items-end gap-8 min-[900px]:grid-cols-[1.3fr_1fr] min-[900px]:gap-20">
        <div>
          <Eyebrow>Konsultasi</Eyebrow>
          <h2 className={h2Class}>Rencanakan acara Anda bersama kami</h2>
          <p className="mt-3.5 text-mute">Ceritakan tanggal, jumlah tamu, dan tujuan acaranya. Kami balas dengan gambaran konsep dan anggaran.</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link to="/kontak" className={cta('red')}>
            Konsultasi gratis
          </Link>
          {site?.whatsapp ? (
            <a href={waLink(site.whatsapp, 'Halo Yohara Gemilang Management, saya ingin konsultasi acara.')} target="_blank" rel="noopener noreferrer" className={cta('line')}>
              Chat WhatsApp
            </a>
          ) : null}
        </div>
      </Reveal>
    </Section>
  );
}
