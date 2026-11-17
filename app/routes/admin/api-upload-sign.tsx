// app/routes/admin/api-upload-sign.tsx
import { signUpload } from '~/lib/cloudinary.server';
import { rateLimit } from '~/lib/rate-limit.server';
import { adminContext } from '~/middleware/auth.server';
import type { Route } from './+types/api-upload-sign';

export function loader() {
  return new Response('Method Not Allowed', { status: 405 });
}

export async function action({ request, context }: Route.ActionArgs) {
  const admin = context.get(adminContext);

  const limited = rateLimit(`sign:${admin.id}`, { limit: 120, windowMs: 10 * 60_000 });
  if (!limited.ok) {
    return Response.json({ error: 'Terlalu banyak unggahan. Coba lagi sebentar lagi.' }, { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec) } });
  }

  const body = await request.json().catch(() => null);
  const kind = body?.kind === 'VIDEO' ? 'VIDEO' : 'IMAGE';

  try {
    return Response.json(signUpload(kind));
  } catch (e) {
    console.error(e);
    return Response.json({ error: 'Cloudinary belum dikonfigurasi di server.' }, { status: 500 });
  }
}
