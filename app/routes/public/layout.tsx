// app/routes/public/layout.tsx
// Bingkai semua halaman publik: navbar, isi halaman, footer, tombol WhatsApp.
import type { CSSProperties } from 'react';
import { Outlet } from 'react-router';

import { Toaster } from '~/components/ui/sonner';
import { SiteFooter } from '~/components/public/layout/site-footer';
import { SiteHeader } from '~/components/public/layout/site-header';
import { WhatsAppButton } from '~/components/public/layout/whatsapp-button';
import { publicHeaders } from '~/lib/public-headers';
import { getSiteInfo } from '~/services/site.server';
import type { Route } from './+types/layout';

export async function loader() {
  return { site: await getSiteInfo() };
}

export const headers = publicHeaders;

export default function PublicLayout({ loaderData }: Route.ComponentProps) {
  const { site } = loaderData;
  return (
    <>
      <a href="#konten" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-70 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-white">
        Lewati ke isi halaman
      </a>
      <SiteHeader site={site} />
      <main id="konten">
        <Outlet />
      </main>
      <SiteFooter site={site} />
      <WhatsAppButton whatsapp={site.whatsapp} />
      <Toaster richColors closeButton position="top-center" style={{ '--error-text': '#b91c1c' } as CSSProperties} />
    </>
  );
}
