// app/components/public/nav.ts
// Satu sumber untuk menu navbar dan footer. Setiap alamat di sini punya halaman sendiri.
export const publicNav = [
  { to: '/', label: 'Beranda' },
  { to: '/tentang', label: 'Tentang' },
  { to: '/layanan', label: 'Layanan' },
  { to: '/portofolio', label: 'Portofolio' },
  { to: '/artikel', label: 'Artikel' },
  { to: '/faq', label: 'FAQ' },
  { to: '/kontak', label: 'Kontak' },
] as const;

export const legalNav = [
  { to: '/kebijakan-privasi', label: 'Kebijakan Privasi' },
  { to: '/syarat-ketentuan', label: 'Syarat dan Ketentuan' },
] as const;

export const DEFAULT_TAGLINE = 'Event organizer untuk acara korporat, pernikahan, konser, dan peresmian di seluruh Indonesia.';
