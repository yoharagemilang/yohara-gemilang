// app/components/public/contact/contact-socials.tsx
import type { SiteInfo } from '~/services/site.server';

export function ContactSocials({ site }: { site: SiteInfo }) {
  const socials = [
    { label: 'Instagram', href: site.instagramUrl },
    { label: 'LinkedIn', href: site.linkedinUrl },
    { label: 'YouTube', href: site.youtubeUrl },
  ].filter((s): s is { label: string; href: string } => !!s.href);
  if (socials.length === 0) return null;
  return (
    <div className="mt-6">
      <p className="text-[0.8rem] text-mute">Ikuti kami</p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {socials.map((s) => (
          <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="rounded-md border border-line px-3.5 py-2 text-[0.85rem] transition-colors hover:border-ink hover:bg-ink hover:text-white">
            {s.label}
          </a>
        ))}
      </div>
    </div>
  );
}
