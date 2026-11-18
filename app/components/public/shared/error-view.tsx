// app/components/public/shared/error-view.tsx
// Dipakai sebagai ErrorBoundary rute anak, jadi navbar dan footer tetap tampil.
import { isRouteErrorResponse, Link } from 'react-router';

import { cta } from './cta';
import { PageHeader } from './section';

const quickLinks = [
  { to: '/layanan', label: 'Layanan' },
  { to: '/portofolio', label: 'Portofolio' },
  { to: '/artikel', label: 'Artikel' },
  { to: '/kontak', label: 'Kontak' },
] as const;

export function PublicErrorView({ error }: { error: unknown }) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <PageHeader
      eyebrow={notFound ? '404' : 'Error'}
      title={notFound ? 'Halaman tidak ditemukan' : 'Terjadi kesalahan'}
      description={notFound ? 'Alamat yang Anda buka tidak tersedia atau sudah dipindahkan.' : 'Maaf, ada masalah yang tidak terduga. Silakan coba lagi sebentar lagi.'}
    >
      <div className="mt-8 flex flex-wrap gap-2.5">
        <Link to="/" className={cta('red')}>
          Kembali ke beranda
        </Link>
        {quickLinks.map((l) => (
          <Link key={l.to} to={l.to} className={cta('line')}>
            {l.label}
          </Link>
        ))}
      </div>
    </PageHeader>
  );
}
