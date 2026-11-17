// app/services/about.server.ts
import { db } from '~/lib/db.server';
import { isLandscape } from '~/lib/image-rules';
import { sanitizeRichText } from '~/lib/sanitize.server';
import type { AboutInput } from '~/schemas/about';
import { getMediaDims, mediaSelect, type ServiceResult } from './helpers.server';
import { deleteMediaIfUnused } from './media.server';

export function getAbout() {
  return db.aboutPage.findUnique({
    where: { id: 'main' },
    include: { cover: { select: mediaSelect } },
  });
}

export async function saveAbout(input: AboutInput): Promise<ServiceResult> {
  const { contentHtml: rawHtml, ...fields } = input;
  const contentHtml = sanitizeRichText(rawHtml);
  if (!contentHtml) {
    return { ok: false, field: 'contentHtml', message: 'Cerita perusahaan wajib diisi' };
  }

  if (fields.coverId) {
    const media = await getMediaDims(fields.coverId);
    if (!media) return { ok: false, field: 'coverId', message: 'Gambar tidak ditemukan, pilih ulang' };
    if (media.kind !== 'IMAGE' || !isLandscape(media.width, media.height)) {
      return { ok: false, field: 'coverId', message: 'Gambar sampul harus landscape' };
    }
  }

  const current = await db.aboutPage.findUnique({ where: { id: 'main' }, select: { coverId: true } });
  const data = { ...fields, contentHtml };
  await db.aboutPage.upsert({
    where: { id: 'main' },
    create: { id: 'main', ...data },
    update: data,
  });
  if (current?.coverId && current.coverId !== fields.coverId) {
    await deleteMediaIfUnused(current.coverId);
  }
  return { ok: true };
}
