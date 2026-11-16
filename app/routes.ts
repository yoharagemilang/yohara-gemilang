// app/routes.ts
import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [index('routes/public/home.tsx'), route('healthz', 'routes/public/health.tsx')] satisfies RouteConfig;
