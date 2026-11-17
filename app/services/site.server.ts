// app/services/site.server.ts
// Data yang dipakai semua halaman publik: header, footer, tombol WhatsApp.
import { db } from '~/lib/db.server';
import { getSettings } from './settings.server';

export type SiteInfo = {
  companyName: string;
  tagline: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  openingHours: string;
  mapQuery: string;
  instagramUrl: string | null;
  linkedinUrl: string | null;
  youtubeUrl: string | null;
  serviceNames: string[];
};

export async function getSiteInfo(): Promise<SiteInfo> {
  const [s, services] = await Promise.all([
    getSettings(),
    db.service.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: { title: true },
      take: 6,
    }),
  ]);

  return {
    companyName: s?.companyName ?? 'Yohara Gemilang Management',
    tagline: s?.tagline ?? '',
    address: s?.address ?? '',
    phone: s?.phone ?? '',
    whatsapp: s?.whatsapp ?? '',
    email: s?.email ?? '',
    openingHours: s?.openingHours ?? '',
    mapQuery: s?.mapQuery ?? '',
    instagramUrl: s?.instagramUrl ?? null,
    linkedinUrl: s?.linkedinUrl ?? null,
    youtubeUrl: s?.youtubeUrl ?? null,
    serviceNames: services.map((x: { title: string }) => x.title),
  };
}
