// app/components/public/about/team-card.tsx
import { CldImage } from '~/components/cld-image';
import type { TeamMemberView } from '~/services/public/about.server';

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

const socialClass = 'rounded-md border border-line px-3 py-1.5 text-[0.8rem] transition-colors hover:border-ink hover:bg-ink hover:text-white';

export function TeamCard({ member }: { member: TeamMemberView }) {
  const socials = [
    { label: 'Instagram', href: member.instagramUrl },
    { label: 'LinkedIn', href: member.linkedinUrl },
  ].filter((s): s is { label: string; href: string } => !!s.href);

  return (
    <article>
      <div className="relative aspect-4/5 overflow-hidden rounded-xl bg-soft">
        {member.photo ? (
          <CldImage media={member.photo} aspect={4 / 5} gravity="face" widths={[320, 480, 640]} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" alt={member.name} className="absolute inset-0 size-full object-cover" />
        ) : (
          <span aria-hidden className="absolute inset-0 grid place-items-center text-4xl font-semibold tracking-tight text-[#a3a29d]">
            {initials(member.name)}
          </span>
        )}
      </div>
      <h3 className="mt-4 text-[1.1rem] leading-[1.2] font-semibold tracking-[-0.01em]">{member.name}</h3>
      <p className="mt-1 text-[0.9rem] font-medium text-brand">{member.position}</p>
      {member.bio ? <p className="mt-3 text-[0.92rem] text-mute">{member.bio}</p> : null}
      {socials.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {socials.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={`${s.label} ${member.name}`} className={socialClass}>
              {s.label}
            </a>
          ))}
        </div>
      ) : null}
    </article>
  );
}
