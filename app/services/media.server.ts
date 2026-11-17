// app/services/media.server.ts
import { destroyAsset } from '~/lib/cloudinary.server';
import { db } from '~/lib/db.server';
import type { MediaListItem } from '~/schemas/media';

const usageSelect = {
  heroSlides: true,
  aboutCovers: true,
  teamPhotos: true,
  partnerLogos: true,
  portfolioCovers: true,
  portfolioImages: true,
  articleCovers: true,
} as const;

function sumUsage(count: Record<string, number>) {
  return Object.values(count).reduce((a, b) => a + b, 0);
}

export async function mediaUsage(id: string) {
  const row = await db.media.findUnique({
    where: { id },
    select: { _count: { select: usageSelect } },
  });
  return row ? sumUsage(row._count) : null;
}

export async function listMedia({ take, cursor, q, kind }: { take: number; cursor?: string | null; q?: string | null; kind?: 'IMAGE' | 'VIDEO' | null }): Promise<{ items: MediaListItem[]; nextCursor: string | null }> {
  const rows = await db.media.findMany({
    where: {
      ...(kind ? { kind } : {}),
      ...(q
        ? {
            OR: [{ alt: { contains: q, mode: 'insensitive' } }, { publicId: { contains: q, mode: 'insensitive' } }],
          }
        : {}),
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id: true,
      publicId: true,
      width: true,
      height: true,
      bytes: true,
      alt: true,
      kind: true,
      duration: true,
      _count: { select: usageSelect },
    },
  });

  const hasMore = rows.length > take;
  const page = hasMore ? rows.slice(0, take) : rows;
  return {
    items: page.map(({ _count, ...m }) => ({ ...m, usage: sumUsage(_count) })),
    nextCursor: hasMore ? page[page.length - 1]!.id : null,
  };
}

export async function mediaCount() {
  return db.media.count();
}

/** Hapus dari Cloudinary dulu, baru dari database, supaya bisa diulang kalau gagal. */
export async function deleteMedia(id: string) {
  const media = await db.media.findUnique({
    where: { id },
    select: { id: true, publicId: true, kind: true },
  });
  if (!media) return;
  const ok = await destroyAsset(media.publicId, media.kind);
  if (!ok) throw new Error('Gagal menghapus gambar di Cloudinary');
  await db.media.delete({ where: { id } });
}

/**
 * Dipanggil modul konten (hero, artikel, dst) setelah gambar lama diganti atau
 * dilepas. Hanya menghapus kalau sudah tidak dipakai di tempat lain.
 */
export async function deleteMediaIfUnused(id: string | null | undefined) {
  if (!id) return false;
  const usage = await mediaUsage(id);
  if (usage === null || usage > 0) return false;
  try {
    await deleteMedia(id);
    return true;
  } catch (e) {
    console.error('deleteMediaIfUnused gagal', e);
    return false;
  }
}
