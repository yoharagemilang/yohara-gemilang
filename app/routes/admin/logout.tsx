// app/routes/admin/logout.tsx
import { redirect } from 'react-router';

import { clearLegacyAdminCookie, destroyAdminSession } from '~/lib/session.server';
import type { Route } from './+types/logout';

// Logout hanya lewat POST. GET diarahkan ke halaman masuk.
export function loader() {
  return redirect('/admin/login');
}

export async function action({ request }: Route.ActionArgs) {
  const headers = new Headers();
  headers.append('Set-Cookie', await destroyAdminSession(request));
  headers.append('Set-Cookie', clearLegacyAdminCookie());
  return redirect('/admin/login', { headers });
}
