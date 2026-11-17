// app/services/helpers.server.ts
import { db } from '~/lib/db.server';
import type { ActionResult } from '~/schemas/common';

export const mediaSelect = {
  id: true,
  publicId: true,
  width: true,
  height: true,
  bytes: true,
  alt: true,
  kind: true,
  duration: true,
} as const;

/** Hasil service: gagal di satu kolom (field) atau gagal umum. */
export type ServiceResult = { ok: true } | { ok: false; field?: string; message: string };

export function failure(result: Extract<ServiceResult, { ok: false }>): ActionResult {
  return result.field ? { ok: false, errors: { [result.field]: result.message } } : { ok: false, message: result.message };
}

/** Ukuran media, atau null kalau tidak ada. Dipakai untuk memeriksa id dari form. */
export function getMediaDims(id: string) {
  return db.media.findUnique({ where: { id }, select: { id: true, width: true, height: true, kind: true } });
}

/** Susun ulang daftar id: pindahkan `id` satu langkah. null kalau tidak bisa bergerak. */
export function moveInOrder(ids: string[], id: string, dir: 'up' | 'down') {
  const i = ids.indexOf(id);
  const j = dir === 'up' ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= ids.length) return null;
  const next = [...ids];
  [next[i], next[j]] = [next[j]!, next[i]!];
  return next;
}
