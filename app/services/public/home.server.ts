// app/services/public/home.server.ts
// Semua data beranda dalam satu panggilan. Hanya konten berstatus terbit yang diambil.
import { db } from '~/lib/db.server';
import { mediaSelect } from '../helpers.server';
import { getHero } from '../hero.server';

const byOrder = [{ sortOrder: 'asc' }, { createdAt: 'asc' }] as const;

export type PublicMedia = {
  publicId: string;
  width: number;
  height: number;
  alt: string;
  kind: 'IMAGE' | 'VIDEO';
};

export type HeroSlideView = PublicMedia & {
  id: string;
  duration: number | null;
  captionTitle: string | null;
  captionMeta: string | null;
};

const fallbackHero = {
  eyebrow: 'Event Organizer',
  heading: 'Acara korporat, pernikahan, dan konser yang',
  headingAccent: 'berjalan sesuai rencana.',
  description: 'Kami mengurus konsep, anggaran, vendor, dan pelaksanaan di lokasi. Anda cukup menentukan tanggal dan tujuan acaranya.',
  primaryLabel: 'Konsultasi gratis',
  primaryHref: '/kontak',
  secondaryLabel: 'Lihat portofolio' as string | null,
  secondaryHref: '/portofolio' as string | null,
};

function pickMedia(m: PublicMedia | null | undefined): PublicMedia | null {
  return m ? { publicId: m.publicId, width: m.width, height: m.height, alt: m.alt, kind: m.kind } : null;
}

export async function getHomeData() {
  const [hero, services, partners, projects, articles, faqs] = await Promise.all([
    getHero(),
    db.service.findMany({
      where: { isPublished: true },
      orderBy: [...byOrder],
      select: { id: true, title: true, description: true, iconKey: true },
    }),
    db.partner.findMany({
      where: { isPublished: true },
      orderBy: [...byOrder],
      select: { id: true, name: true, logo: { select: mediaSelect } },
    }),
    db.portfolioProject.findMany({
      where: { status: 'PUBLISHED', isFeatured: true },
      orderBy: [{ sortOrder: 'asc' }, { publishedAt: 'desc' }],
      take: 4,
      select: {
        id: true,
        slug: true,
        title: true,
        city: true,
        year: true,
        guestCount: true,
        cover: { select: mediaSelect },
        service: { select: { title: true } },
      },
    }),
    db.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 3,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        category: true,
        readingMinutes: true,
        publishedAt: true,
        cover: { select: mediaSelect },
      },
    }),
    db.faq.findMany({
      where: { isPublished: true },
      orderBy: [...byOrder],
      take: 6,
      select: { id: true, question: true, answer: true },
    }),
  ]);

  return {
    hero: {
      eyebrow: hero?.eyebrow ?? fallbackHero.eyebrow,
      heading: hero?.heading ?? fallbackHero.heading,
      headingAccent: hero?.headingAccent ?? fallbackHero.headingAccent,
      description: hero?.description ?? fallbackHero.description,
      primaryLabel: hero?.primaryLabel ?? fallbackHero.primaryLabel,
      primaryHref: hero?.primaryHref ?? fallbackHero.primaryHref,
      secondaryLabel: hero ? hero.secondaryLabel : fallbackHero.secondaryLabel,
      secondaryHref: hero ? hero.secondaryHref : fallbackHero.secondaryHref,
      slides: (hero?.slides ?? []).map(
        (s: { id: string; captionTitle: string | null; captionMeta: string | null; media: PublicMedia & { duration: number | null } }): HeroSlideView => ({
          id: s.id,
          ...pickMedia(s.media)!,
          duration: s.media.duration,
          captionTitle: s.captionTitle,
          captionMeta: s.captionMeta,
        }),
      ),
    },
    services: services as { id: string; title: string; description: string; iconKey: string }[],
    partners: partners.map((p: { id: string; name: string; logo: PublicMedia | null }) => ({
      id: p.id,
      name: p.name,
      logo: pickMedia(p.logo),
    })),
    projects: projects.map((p: { id: string; slug: string; title: string; city: string; year: number; guestCount: number | null; cover: PublicMedia | null; service: { title: string } | null }) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      city: p.city,
      year: p.year,
      guestCount: p.guestCount,
      serviceTitle: p.service?.title ?? null,
      cover: pickMedia(p.cover),
    })),
    articles: articles.map((a: { id: string; slug: string; title: string; excerpt: string; category: string; readingMinutes: number; publishedAt: Date | null; cover: PublicMedia | null }) => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      category: a.category,
      readingMinutes: a.readingMinutes,
      publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
      cover: pickMedia(a.cover),
    })),
    faqs: faqs as { id: string; question: string; answer: string }[],
  };
}

export type HomeData = Awaited<ReturnType<typeof getHomeData>>;
