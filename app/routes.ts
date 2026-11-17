// app/routes.ts
import { type RouteConfig, index, layout, route } from '@react-router/dev/routes';

export default [
  // Publik
  index('routes/public/home.tsx'),
  route('healthz', 'routes/public/health.tsx'),

  // Admin: masuk dan keluar tanpa layout
  route('admin/login', 'routes/admin/login.tsx'),
  route('admin/logout', 'routes/admin/logout.tsx'),

  // Admin: semua di bawah ini wajib login
  layout('routes/admin/layout.tsx', [
    route('admin', 'routes/admin/dashboard.tsx'),
    route('admin/hero', 'routes/admin/hero.tsx'),
    route('admin/layanan', 'routes/admin/layanan.tsx'),
    route('admin/partner', 'routes/admin/partner.tsx'),
    route('admin/faq', 'routes/admin/faq.tsx'),
    route('admin/tentang', 'routes/admin/tentang.tsx'),
    route('admin/tim', 'routes/admin/tim.tsx'),
    route('admin/portofolio', 'routes/admin/portofolio.tsx'),
    route('admin/portofolio/:slug', 'routes/admin/portofolio-form.tsx'),
    route('admin/pesan', 'routes/admin/pesan.tsx'),
    route('admin/pengaturan', 'routes/admin/pengaturan.tsx'),
    route('admin/media', 'routes/admin/media.tsx'),
    route('admin/api/media', 'routes/admin/api-media.tsx'),
    route('admin/api/upload-sign', 'routes/admin/api-upload-sign.tsx'),
  ]),
] satisfies RouteConfig;
