// app/services/public/faq.server.ts
import { db } from '~/lib/db.server';

export type FaqView = { id: string; question: string; answer: string };

export async function getFaqData() {
  const faqs: FaqView[] = await db.faq.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    select: { id: true, question: true, answer: true },
  });
  return { faqs };
}
