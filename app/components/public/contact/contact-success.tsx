// app/components/public/contact/contact-success.tsx
// Layar setelah pesan terkirim: konfirmasi, lanjut ke WhatsApp, atau kirim pesan lain.
import { CircleCheck } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { waLink } from '~/lib/contact';
import { cta } from '../shared/cta';
import type { SiteInfo } from '~/services/site.server';

export function ContactSuccess({ site, name, eventType, confirmed, onReset }: { site: SiteInfo; name: string; eventType: string; confirmed: boolean; onReset: () => void }) {
  return (
    <div role="status" className="py-4 text-center md:py-10">
      <span className="mx-auto mb-6 grid size-14 place-items-center rounded-full bg-soft text-brand">
        <CircleCheck aria-hidden className="size-7" strokeWidth={1.5} />
      </span>
      <h2 className="text-[1.6rem] leading-[1.2] font-semibold tracking-[-0.02em]">Pesan terkirim</h2>
      <p className="mx-auto mt-3 max-w-[46ch] text-mute">
        Terima kasih, {name}. Tim kami akan menghubungi Anda lewat WhatsApp
        {site.openingHours ? ` pada jam kerja (${site.openingHours})` : ''}.{confirmed ? ' Kami juga mengirim konfirmasi ke email Anda.' : ''}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-2.5">
        {site.whatsapp ? (
          <a href={waLink(site.whatsapp, `Halo ${site.companyName}, saya ${name}. Saya sudah mengirim pesan lewat website untuk acara ${eventType}.`)} target="_blank" rel="noopener noreferrer" className={cta('dark')}>
            Lanjut ke WhatsApp
            <span className="sr-only"> (tab baru)</span>
          </a>
        ) : null}
        <Button type="button" onClick={onReset} className={cta('line')}>
          Kirim pesan lain
        </Button>
      </div>
    </div>
  );
}
