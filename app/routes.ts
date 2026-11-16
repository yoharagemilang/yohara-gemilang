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
  layout('routes/admin/layout.tsx', [route('admin', 'routes/admin/dashboard.tsx')]),
] satisfies RouteConfig;
