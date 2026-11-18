// app/components/public/partners/partner-marquee.tsx
// Daftar klien berjalan pelan, berhenti saat kursor di atasnya. Reduced-motion: tampil diam dan rapi.
import { CldImage } from '~/components/cld-image';
import type { PublicMedia } from '~/services/public/media';

export type PartnerItem = { id: string; name: string; logo: PublicMedia | null };

function Item({ partner }: { partner: PartnerItem }) {
  return (
    <span className="flex items-center px-10 text-xl font-bold tracking-[-0.01em] whitespace-nowrap text-[#767570]">
      {partner.logo ? <CldImage media={partner.logo} alt={partner.name} widths={[160, 320]} sizes="150px" className="h-9 w-auto max-w-37.5 object-contain opacity-60 grayscale" /> : partner.name}
    </span>
  );
}

export function PartnerMarquee({ partners }: { partners: PartnerItem[] }) {
  // Ulangi isi sampai satu set cukup lebar, supaya tidak ada celah kosong saat berjalan
  const reps = Math.max(1, Math.ceil(8 / partners.length));
  const set = Array.from({ length: reps }, () => partners).flat();

  return (
    <div className="group overflow-hidden">
      <div className="flex w-max animate-marquee group-hover:paused motion-reduce:w-auto motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:justify-center">
        {[0, 1].map((copy) => (
          <div key={copy} aria-hidden={copy === 1 || undefined} className={copy === 1 ? 'flex flex-none items-center motion-reduce:hidden' : 'flex flex-none items-center motion-reduce:flex-wrap motion-reduce:justify-center'}>
            {set.map((p, i) => (
              <Item key={`${p.id}-${i}`} partner={p} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
