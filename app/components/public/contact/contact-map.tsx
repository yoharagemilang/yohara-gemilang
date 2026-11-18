// app/components/public/contact/contact-map.tsx
// Satu kartu: peta Google Maps (embed tanpa API key) di atas, bar lokasi dengan tombol rute di bawah.
// Peta dimuat malas agar halaman tetap ringan.
import { ArrowUpRight, MapPin } from 'lucide-react';

import { cta } from '../shared/cta';

export function ContactMap({ query, title, address }: { query: string; title: string; address?: string }) {
  if (!query.trim()) return null;
  const q = encodeURIComponent(query);
  const src = `https://www.google.com/maps?q=${q}&output=embed`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${q}`;
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white">
      <div className="aspect-4/3 bg-soft md:aspect-16/10">
        <iframe src={src} title={`Peta lokasi ${title}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="size-full border-0" />
      </div>
      <div className="flex flex-col gap-4 border-t border-line p-5 sm:flex-row sm:items-center sm:justify-between md:px-7">
        <div className="flex min-w-0 items-start gap-3.5">
          <span aria-hidden className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-lg bg-soft text-brand">
            <MapPin className="size-5" strokeWidth={1.5} />
          </span>
          <div className="min-w-0">
            <p className="text-[0.95rem] font-semibold">Lokasi kami</p>
            {address ? <p className="mt-0.5 text-[0.88rem] text-mute">{address}</p> : null}
          </div>
        </div>
        <a href={directions} target="_blank" rel="noopener noreferrer" className={cta('dark', 'shrink-0 gap-1.5 px-5 py-3 text-[0.88rem]')}>
          Petunjuk arah
          <ArrowUpRight aria-hidden className="size-4" strokeWidth={1.8} />
          <span className="sr-only">(buka di Google Maps, tab baru)</span>
        </a>
      </div>
    </div>
  );
}
