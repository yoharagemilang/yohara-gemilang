// app/components/admin/nav.ts
// ready: false = modul belum dibuat, tampil redup. Ubah jadi true tiap modul selesai.
export const adminNav = [
  {
    label: 'Umum',
    items: [{ to: '/admin', label: 'Dashboard', icon: 'layout', ready: true }],
  },
  {
    label: 'Konten',
    items: [
      { to: '/admin/media', label: 'Media', icon: 'images', ready: true },
      { to: '/admin/hero', label: 'Hero', icon: 'image', ready: true },
      { to: '/admin/layanan', label: 'Layanan', icon: 'briefcase', ready: true },
      { to: '/admin/partner', label: 'Partner', icon: 'handshake', ready: true },
      { to: '/admin/portofolio', label: 'Portofolio', icon: 'folder', ready: true },
      { to: '/admin/artikel', label: 'Artikel', icon: 'file', ready: false },
      { to: '/admin/faq', label: 'FAQ', icon: 'help', ready: true },
      { to: '/admin/tentang', label: 'Tentang', icon: 'info', ready: true },
      { to: '/admin/tim', label: 'Tim', icon: 'users', ready: true },
    ],
  },
  {
    label: 'Pengelolaan',
    items: [
      { to: '/admin/pesan', label: 'Pesan', icon: 'mail', ready: false },
      { to: '/admin/pengaturan', label: 'Pengaturan', icon: 'settings', ready: false },
    ],
  },
] as const;

export type NavIcon = (typeof adminNav)[number]['items'][number]['icon'];
