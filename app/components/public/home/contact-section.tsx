// app/components/public/home/contact-section.tsx
// Penutup beranda: ajakan, kontak ringkas, dan formulir (komponen yang sama dengan halaman Kontak).
// Kartu formulir mengikuti tinggi kolom kiri; area pesan yang memanjang mengisi sisanya.
import { ContactForm } from '../contact/contact-form';
import { ContactInfo } from '../contact/contact-info';
import { useSite } from '../layout/use-site';
import { Reveal } from '../shared/reveal';
import { Eyebrow, Section, h2Class } from '../shared/section';

export function ContactSection({ eventTypes }: { eventTypes: string[] }) {
  const site = useSite();
  if (!site) return null;
  return (
    <Section soft texture="dots" id="kontak">
      <div className="grid gap-10 min-[960px]:grid-cols-[0.85fr_1.15fr] min-[960px]:gap-14">
        <Reveal>
          <Eyebrow>Kontak</Eyebrow>
          <h2 className={h2Class}>Rencanakan acara Anda bersama kami</h2>
          <p className="mt-3.5 mb-8 text-mute">Ceritakan tanggal, jumlah tamu, dan tujuan acaranya. Kami balas dengan gambaran konsep dan anggaran.</p>
          <ContactInfo site={site} />
        </Reveal>
        <Reveal delay={0.1}>
          <div className="flex h-full flex-col rounded-xl border border-line bg-white p-7 md:p-10">
            <h3 className="text-[1.5rem] leading-[1.2] font-semibold tracking-[-0.02em]">Kirim pesan</h3>
            <p className="mt-2 mb-8 text-[0.95rem] text-mute">Isi formulir ini dan kami hubungi Anda lewat WhatsApp.</p>
            <ContactForm site={site} eventTypes={eventTypes} />
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
