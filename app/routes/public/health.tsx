// app/routes/public/health.tsx
import { db } from '~/lib/db.server';

export async function loader() {
  const headers = { 'Cache-Control': 'no-store' };
  try {
    await db.$queryRaw`SELECT 1`;
    return Response.json({ ok: true, db: 'up' }, { headers });
  } catch {
    return Response.json({ ok: false, db: 'down' }, { status: 503, headers });
  }
}
