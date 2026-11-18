// app/components/public/contact/contact-section.tsx
// Atas: formulir di kiri, kontak dan media sosial di kanan. Bawah: peta selebar halaman.
import { Reveal } from '../shared/reveal';
import { Container } from '../shared/section';
import type { SiteInfo } from '~/services/site.server';
import { ContactForm } from './contact-form';
import { ContactInfo } from './contact-info';
import { ContactMap } from './contact-map';
import { ContactSocials } from './contact-socials';

export function ContactSection({ site, eventTypes }: { site: SiteInfo; eventTypes: string[] }) {
  return (
    <>
      <Container className="pt-14 md:pt-20">
        <div className="grid gap-10 min-[960px]:grid-cols-[1.15fr_0.85fr] min-[960px]:gap-12">
          <Reveal>
            <div className="rounded-xl border border-line bg-white p-7 md:p-10">
              <h2 className="text-[1.5rem] leading-[1.2] font-semibold tracking-[-0.02em]">Kirim pesan</h2>
              <p className="mt-2 mb-8 text-[0.95rem] text-mute">Isi formulir ini dan kami hubungi Anda lewat WhatsApp.</p>
              <ContactForm site={site} eventTypes={eventTypes} />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <ContactInfo site={site} />
            <ContactSocials site={site} />
          </Reveal>
        </div>
      </Container>
      <Container className="py-14 md:py-20">
        <Reveal>
          <ContactMap query={site.mapQuery} title={site.companyName} address={site.address} />
        </Reveal>
      </Container>
    </>
  );
}
