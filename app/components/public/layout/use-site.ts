// app/components/public/layout/use-site.ts
// Data situs (kontak, WhatsApp, dll.) sudah dimuat layout, jadi komponen cukup membacanya di sini.
import { useRouteLoaderData } from 'react-router';

import type { SiteInfo } from '~/services/site.server';

export function useSite(): SiteInfo | undefined {
  const data = useRouteLoaderData('routes/public/layout') as { site?: SiteInfo } | undefined;
  return data?.site;
}
