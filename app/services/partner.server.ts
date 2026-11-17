// app/services/partner.server.ts
// app/services/partner.server.ts
import { db } from '~/lib/db.server';
import type { PartnerInput } from '~/schemas/partner';
import { getMediaDims, mediaSelect, moveInOrder, type ServiceResult } from './helpers.server';
import { deleteMediaIfUnused } from './media.server';

const order = [{ sortOrder: 'asc' }, { createdAt: 'asc' }] as const;

export function listPartners() {
  return db.partner.findMany({
    orderBy: [...order],
    include: { logo: { select: mediaSelect } },
  });
}

async function checkLogo(logoId: string | null): Promise<ServiceResult> {
  if (logoId && !(await getMediaDims(logoId))) {
    return { ok: false, field: 'logoId', message: 'Logo tidak ditemukan, pilih ulang' };
  }
  return { ok: true };
}

export async function createPartner(input: PartnerInput): Promise<ServiceResult> {
  const check = await checkLogo(input.logoId);
  if (!check.ok) return check;
  const last = await db.partner.findFirst({ orderBy: { sortOrder: 'desc' }, select: { sortOrder: true } });
  await db.partner.create({ data: { ...input, sortOrder: (last?.sortOrder ?? -1) + 1 } });
  return { ok: true };
}

export async function updatePartner(id: string, input: PartnerInput): Promise<ServiceResult> {
  const current = await db.partner.findUnique({ where: { id }, select: { logoId: true } });
  if (!current) return { ok: false, message: 'Partner tidak ditemukan' };
  const check = await checkLogo(input.logoId);
  if (!check.ok) return check;
  await db.partner.update({ where: { id }, data: input });
  if (current.logoId && current.logoId !== input.logoId) await deleteMediaIfUnused(current.logoId);
  return { ok: true };
}

export function setPartnerPublished(id: string, isPublished: boolean) {
  return db.partner.update({ where: { id }, data: { isPublished } });
}

export async function deletePartner(id: string) {
  const current = await db.partner.findUnique({ where: { id }, select: { logoId: true } });
  if (!current) return;
  await db.partner.delete({ where: { id } });
  await deleteMediaIfUnused(current.logoId);
}

export async function movePartner(id: string, dir: 'up' | 'down') {
  const all = await db.partner.findMany({ orderBy: [...order], select: { id: true } });
  const next = moveInOrder(
    all.map((p) => p.id),
    id,
    dir,
  );
  if (!next) return;
  await db.$transaction(next.map((pid, index) => db.partner.update({ where: { id: pid }, data: { sortOrder: index } })));
}
