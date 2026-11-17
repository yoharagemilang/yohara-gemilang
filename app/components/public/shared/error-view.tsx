// app/components/public/error-view.tsx
// Dipakai sebagai ErrorBoundary rute anak, jadi navbar dan footer tetap tampil.
import { isRouteErrorResponse, Link } from 'react-router';

import { cta } from './cta';
import { PageHeader } from './section';

export function PublicErrorView({ error }: { error: unknown }) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <PageHeader
      eyebrow={notFound ? '404' : 'Error'}
      title={notFound ? 'Halaman tidak ditemukan' : 'Terjadi kesalahan'}
      description={notFound ? 'Alamat yang Anda buka tidak tersedia atau sudah dipindahkan.' : 'Maaf, ada masalah yang tidak terduga. Silakan coba lagi sebentar lagi.'}
    >
      <Link to="/" className={cta('red', 'mt-8 w-fit')}>
        Kembali ke beranda
      </Link>
    </PageHeader>
  );
}
