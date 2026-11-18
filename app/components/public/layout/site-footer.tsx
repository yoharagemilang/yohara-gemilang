// app/components/public/layout/site-footer.tsx
import { Link } from "react-router";

import type { SiteInfo } from "~/services/site.server";
import { DEFAULT_TAGLINE, legalNav, publicNav } from "./nav";
import { Container } from "../shared/section";
import { LogoMark } from "./site-header";

const linkClass = "transition-colors hover:text-white";
const colTitle = "mb-5 text-xs font-semibold tracking-[0.14em] text-white uppercase";

export function SiteFooter({ site }: { site: SiteInfo }) {
  const social = [
    { label: "Instagram", href: site.instagramUrl },
    { label: "LinkedIn", href: site.linkedinUrl },
    { label: "YouTube", href: site.youtubeUrl },
  ].filter((s): s is { label: string; href: string } => !!s.href);

  return (
    <footer className="bg-ink pt-20 pb-24 text-white/70 md:pb-8">
      <Container>
        <div className="grid gap-12 border-b border-white/15 pb-14 md:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          <div>
            <LogoMark name={site.companyName} className="size-12 bg-brand text-[1.3rem] md:size-12 md:text-[1.3rem] [&>span]:bg-white" />
            <p className="mt-5 mb-2.5 text-[1.3rem] font-semibold text-white">{site.companyName}</p>
            <p className="max-w-[34ch] text-[0.92rem]">{site.tagline || DEFAULT_TAGLINE}</p>
            {social.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {social.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md border border-white/20 px-3.5 py-2 text-[0.84rem] transition-colors hover:bg-white hover:text-ink"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <h2 className={colTitle}>Navigasi</h2>
            <ul className="grid gap-3 text-[0.92rem]">
              {publicNav.map((item) => (
                <li key={item.to}>
                  <Link prefetch="intent" to={item.to} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className={colTitle}>Layanan</h2>
            <ul className="grid gap-3 text-[0.92rem]">
              {site.serviceNames.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className={colTitle}>Kontak</h2>
            <ul className="grid gap-3 text-[0.92rem]">
              {site.address ? <li>{site.address}</li> : null}
              {site.phone ? (
                <li>
                  <a href={`tel:${site.phone.replace(/[^\d+]/g, "")}`} className={linkClass}>
                    {site.phone}
                  </a>
                </li>
              ) : null}
              {site.email ? (
                <li>
                  <a href={`mailto:${site.email}`} className={linkClass}>
                    {site.email}
                  </a>
                </li>
              ) : null}
              {site.openingHours ? <li>{site.openingHours}</li> : null}
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-4 pt-7 text-[0.84rem]">
          <span>
            &copy; {new Date().getFullYear()} {site.companyName}. Hak cipta dilindungi.
          </span>
          <nav aria-label="Legal" className="flex flex-wrap gap-6">
            {legalNav.map((item) => (
              <Link prefetch="intent" key={item.to} to={item.to} className={linkClass}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </Container>
    </footer>
  );
}
