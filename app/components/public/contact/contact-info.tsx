// app/components/public/contact/contact-info.tsx
// Kartu kontak: alamat, WhatsApp, telepon, email, jam kerja. Item kosong dilewati.
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import type { ReactNode } from 'react';

import { waLink } from '~/lib/contact';
import { WhatsAppIcon } from '../shared/whatsapp-icon';
import type { SiteInfo } from '~/services/site.server';

function Row({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex gap-4 border-b border-line py-5 first:pt-0 last:border-b-0 last:pb-0">
      <span aria-hidden className="mt-0.5 text-brand">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[0.8rem] text-mute">{label}</p>
        <div className="mt-1 text-[0.98rem] font-medium wrap-break-word whitespace-pre-line">{children}</div>
      </div>
    </div>
  );
}

const linkClass = 'underline-offset-4 transition-colors hover:text-brand hover:underline';

export function ContactInfo({ site }: { site: SiteInfo }) {
  const iconProps = { className: 'size-5', strokeWidth: 1.5 } as const;
  return (
    <div className="rounded-xl border border-line bg-white p-7 md:p-9">
      {site.address ? (
        <Row icon={<MapPin {...iconProps} />} label="Alamat">
          {site.address}
        </Row>
      ) : null}
      {site.whatsapp ? (
        <Row icon={<WhatsAppIcon className="size-5" />} label="WhatsApp">
          <a href={waLink(site.whatsapp, 'Halo Yohara Gemilang Management, saya ingin konsultasi acara.')} target="_blank" rel="noopener noreferrer" className={linkClass}>
            {site.whatsapp}
          </a>
        </Row>
      ) : null}
      {site.phone ? (
        <Row icon={<Phone {...iconProps} />} label="Telepon">
          <a href={`tel:${site.phone.replace(/[^\d+]/g, '')}`} className={linkClass}>
            {site.phone}
          </a>
        </Row>
      ) : null}
      {site.email ? (
        <Row icon={<Mail {...iconProps} />} label="Email">
          <a href={`mailto:${site.email}`} className={linkClass}>
            {site.email}
          </a>
        </Row>
      ) : null}
      {site.openingHours ? (
        <Row icon={<Clock {...iconProps} />} label="Jam kerja">
          {site.openingHours}
        </Row>
      ) : null}
    </div>
  );
}
