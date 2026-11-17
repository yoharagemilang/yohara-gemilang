// app/services/faq.server.ts
// app/services/faq.server.ts
import { db } from '~/lib/db.server';
import type { FaqInput } from '~/schemas/faq';
import { moveInOrder } from './helpers.server';

const order = [{ sortOrder: 'asc' }, { createdAt: 'asc' }] as const;

export function listFaqs() {
  return db.faq.findMany({ orderBy: [...order] });
}

export async function createFaq(input: FaqInput) {
  const last = await db.faq.findFirst({ orderBy: { sortOrder: 'desc' }, select: { sortOrder: true } });
  return db.faq.create({ data: { ...input, sortOrder: (last?.sortOrder ?? -1) + 1 } });
}

export function updateFaq(id: string, input: FaqInput) {
  return db.faq.update({ where: { id }, data: input });
}

export function setFaqPublished(id: string, isPublished: boolean) {
  return db.faq.update({ where: { id }, data: { isPublished } });
}

export async function deleteFaq(id: string) {
  await db.faq.delete({ where: { id } });
}

export async function moveFaq(id: string, dir: 'up' | 'down') {
  const all = await db.faq.findMany({ orderBy: [...order], select: { id: true } });
  const next = moveInOrder(
    all.map((f) => f.id),
    id,
    dir,
  );
  if (!next) return;
  await db.$transaction(next.map((fid, index) => db.faq.update({ where: { id: fid }, data: { sortOrder: index } })));
}
