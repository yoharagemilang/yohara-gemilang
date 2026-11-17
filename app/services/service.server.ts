// app/services/service.server.ts
// app/services/service.server.ts
import { db } from '~/lib/db.server';
import type { ServiceInput } from '~/schemas/service';

export function listServices() {
  return db.service.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    include: { _count: { select: { projects: true } } },
  });
}

export async function createService(input: ServiceInput) {
  const last = await db.service.findFirst({ orderBy: { sortOrder: 'desc' }, select: { sortOrder: true } });
  return db.service.create({ data: { ...input, sortOrder: (last?.sortOrder ?? -1) + 1 } });
}

export function updateService(id: string, input: ServiceInput) {
  return db.service.update({ where: { id }, data: input });
}

export function setServicePublished(id: string, isPublished: boolean) {
  return db.service.update({ where: { id }, data: { isPublished } });
}

export async function deleteService(id: string) {
  await db.service.delete({ where: { id } }); // proyek terkait otomatis kehilangan layanan (SetNull)
}

/** Tukar posisi dengan tetangga, lalu rapikan urutan jadi 0..n-1. */
export async function moveService(id: string, dir: 'up' | 'down') {
  const all = await db.service.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    select: { id: true },
  });
  const i = all.findIndex((s) => s.id === id);
  const j = dir === 'up' ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= all.length) return;
  [all[i], all[j]] = [all[j]!, all[i]!];
  await db.$transaction(all.map((s, index) => db.service.update({ where: { id: s.id }, data: { sortOrder: index } })));
}
