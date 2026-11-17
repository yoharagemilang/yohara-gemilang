// app/services/public/services.server.ts
import { db } from '~/lib/db.server';

export type ServiceView = { id: string; title: string; description: string; iconKey: string };

export async function getServicesData() {
  const services: ServiceView[] = await db.service.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    select: { id: true, title: true, description: true, iconKey: true },
  });
  return { services };
}
