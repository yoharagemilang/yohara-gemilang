// app/services/team.server.ts
import { db } from '~/lib/db.server';
import type { TeamInput } from '~/schemas/team';
import { getMediaDims, mediaSelect, moveInOrder, type ServiceResult } from './helpers.server';
import { deleteMediaIfUnused } from './media.server';

const order = [{ sortOrder: 'asc' }, { createdAt: 'asc' }] as const;

export function listTeam() {
  return db.teamMember.findMany({
    orderBy: [...order],
    include: { photo: { select: mediaSelect } },
  });
}

async function checkPhoto(photoId: string | null): Promise<ServiceResult> {
  if (photoId && !(await getMediaDims(photoId))) {
    return { ok: false, field: 'photoId', message: 'Foto tidak ditemukan, pilih ulang' };
  }
  return { ok: true };
}

export async function createMember(input: TeamInput): Promise<ServiceResult> {
  const check = await checkPhoto(input.photoId);
  if (!check.ok) return check;
  const last = await db.teamMember.findFirst({ orderBy: { sortOrder: 'desc' }, select: { sortOrder: true } });
  await db.teamMember.create({ data: { ...input, sortOrder: (last?.sortOrder ?? -1) + 1 } });
  return { ok: true };
}

export async function updateMember(id: string, input: TeamInput): Promise<ServiceResult> {
  const current = await db.teamMember.findUnique({ where: { id }, select: { photoId: true } });
  if (!current) return { ok: false, message: 'Anggota tim tidak ditemukan' };
  const check = await checkPhoto(input.photoId);
  if (!check.ok) return check;
  await db.teamMember.update({ where: { id }, data: input });
  if (current.photoId && current.photoId !== input.photoId) await deleteMediaIfUnused(current.photoId);
  return { ok: true };
}

export function setMemberPublished(id: string, isPublished: boolean) {
  return db.teamMember.update({ where: { id }, data: { isPublished } });
}

export async function deleteMember(id: string) {
  const current = await db.teamMember.findUnique({ where: { id }, select: { photoId: true } });
  if (!current) return;
  await db.teamMember.delete({ where: { id } });
  await deleteMediaIfUnused(current.photoId);
}

export async function moveMember(id: string, dir: 'up' | 'down') {
  const all = await db.teamMember.findMany({ orderBy: [...order], select: { id: true } });
  const next = moveInOrder(
    all.map((m) => m.id),
    id,
    dir,
  );
  if (!next) return;
  await db.$transaction(next.map((mid, index) => db.teamMember.update({ where: { id: mid }, data: { sortOrder: index } })));
}

export async function reorderMembers(ids: string[]) {
  await db.$transaction(ids.map((id, index) => db.teamMember.update({ where: { id }, data: { sortOrder: index } })));
}
