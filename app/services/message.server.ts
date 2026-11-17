// app/services/message.server.ts
import { db } from '~/lib/db.server';
import type { MessageStatus } from '~/schemas/message';

export function listMessages({ q, status, take }: { q?: string; status?: MessageStatus; take: number }) {
  return db.contactMessage.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [{ name: { contains: q, mode: 'insensitive' } }, { whatsapp: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }, { eventType: { contains: q, mode: 'insensitive' } }],
          }
        : {}),
    },
    orderBy: [{ createdAt: 'desc' }],
    take: take + 1, // satu lebihnya untuk tahu masih ada halaman berikutnya
  });
}

/** Tandai sudah dibuka. Status tidak berubah, hanya readAt (sekali). */
export async function markMessageRead(id: string) {
  const m = await db.contactMessage.findUnique({ where: { id }, select: { readAt: true } });
  if (!m || m.readAt) return;
  await db.contactMessage.update({ where: { id }, data: { readAt: new Date() } });
}

export async function setMessageStatus(id: string, status: MessageStatus) {
  const m = await db.contactMessage.findUnique({ where: { id }, select: { readAt: true } });
  if (!m) return;
  await db.contactMessage.update({
    where: { id },
    data: { status, ...(m.readAt ? {} : { readAt: new Date() }) },
  });
}

export async function deleteMessage(id: string) {
  await db.contactMessage.delete({ where: { id } });
}
