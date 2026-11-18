// app/components/public/contact/contact-section.tsx
// Dua kolom: kontak + media sosial di kiri, peta di kanan. Formulir (Grup 6) akan masuk di antara keduanya.
import { Reveal } from '../shared/reveal';
import { Container } from '../shared/section';
import type { SiteInfo } from '~/services/site.server';
import { ContactInfo } from './contact-info';
import { ContactMap } from './contact-map';
import { ContactSocials } from './contact-socials';

export function ContactSection({ site }: { site: SiteInfo }) {
  return (
    <Container className="py-14 md:py-20">
      <div className="grid gap-10 min-[900px]:grid-cols-2 min-[900px]:gap-14">
        <Reveal>
          <ContactInfo site={site} />
          <ContactSocials site={site} />
        </Reveal>
        <Reveal delay={0.1}>
          <ContactMap query={site.mapQuery} title={site.companyName} />
        </Reveal>
      </div>
    </Container>
  );
}
