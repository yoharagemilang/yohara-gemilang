// app/routes/public/not-found.tsx
// Menangkap alamat publik yang tidak dikenal. Status 404 dikirim lewat ErrorBoundary di bawah.
import { data } from 'react-router';

import { PublicErrorView } from '~/components/public/shared/error-view';
import type { Route } from './+types/not-found';

export function loader() {
  throw data('Tidak ditemukan', { status: 404 });
}

export function meta() {
  return [{ title: 'Halaman tidak ditemukan | Yohara Gemilang Management' }, { name: 'robots', content: 'noindex' }];
}

export default function NotFound() {
  return null;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <PublicErrorView error={error} />;
}
