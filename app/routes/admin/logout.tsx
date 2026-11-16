// app/routes/admin/logout.tsx
import { redirect } from 'react-router';

import { destroyAdminSession } from '~/lib/session.server';
import type { Route } from './+types/logout';

// Logout hanya lewat POST. GET diarahkan ke halaman masuk.
export function loader() {
  return redirect('/admin/login');
}

export async function action({ request }: Route.ActionArgs) {
  return redirect('/admin/login', {
    headers: { 'Set-Cookie': await destroyAdminSession(request) },
  });
}
