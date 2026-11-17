// app/services/hero.server.ts
import { db } from '~/lib/db.server';
import { isLandscape } from '~/lib/image-rules';
import type { HeroInput } from '~/schemas/hero';
import { deleteMediaIfUnused } from './media.server';

const mediaSelect = {
  id: true,
  publicId: true,
  width: true,
  height: true,
  bytes: true,
  alt: true,
  kind: true,
  duration: true,
} as const;

export function getHero() {
  return db.hero.findUnique({
    where: { id: 'main' },
    include: {
      slides: { orderBy: { sortOrder: 'asc' }, include: { media: { select: mediaSelect } } },
    },
  });
}

type SaveResult = { ok: true } | { ok: false; field: string; message: string };

export async function saveHero(input: HeroInput): Promise<SaveResult> {
  const { slides, ...fields } = input;
  const ids = slides.map((s) => s.mediaId);

  if (ids.length > 0) {
    const media = await db.media.findMany({
      where: { id: { in: ids } },
      select: { id: true, kind: true, width: true, height: true },
    });
    if (media.length !== ids.length) {
      return { ok: false, field: 'slides', message: 'Ada file slide yang tidak ditemukan' };
    }
    const byId = new Map(media.map((m) => [m.id, m]));
    if (byId.get(ids[0]!)!.kind !== 'IMAGE') {
      return { ok: false, field: 'slides', message: 'Slide pertama harus gambar, bukan video' };
    }
    if (media.some((m) => !isLandscape(m.width, m.height))) {
      return { ok: false, field: 'slides', message: 'Semua slide harus landscape' };
    }
  }

  const before = await db.heroSlide.findMany({
    where: { heroId: 'main' },
    select: { mediaId: true },
  });

  await db.$transaction([
    db.hero.upsert({
      where: { id: 'main' },
      create: { id: 'main', ...fields },
      update: fields,
    }),
    db.heroSlide.deleteMany({ where: { heroId: 'main' } }),
    db.heroSlide.createMany({
      data: slides.map((s, i) => ({
        heroId: 'main',
        mediaId: s.mediaId,
        captionTitle: s.captionTitle,
        captionMeta: s.captionMeta,
        sortOrder: i,
      })),
    }),
  ]);

  // Slide yang dibuang: hapus filenya dari Cloudinary kalau tidak dipakai di tempat lain
  const kept = new Set(ids);
  for (const { mediaId } of before) {
    if (!kept.has(mediaId)) await deleteMediaIfUnused(mediaId);
  }
  return { ok: true };
}
