// app/routes/admin/layout.tsx
import { Outlet, useNavigation, type ShouldRevalidateFunctionArgs } from 'react-router';

import { NavProgress } from '~/components/public/layout/nav-progress';
import { AppSidebar } from '~/components/admin/app-sidebar';
import { Separator } from '~/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '~/components/ui/sidebar';
import { Toaster } from '~/components/ui/sonner';
import { db } from '~/lib/db.server';
import { cn } from '~/lib/utils';
import { adminContext, adminHeaders, requireAdmin } from '~/middleware/auth.server';
import type { Route } from './+types/layout';

export const middleware: Route.MiddlewareFunction[] = [adminHeaders, requireAdmin];

export function meta(_: Route.MetaArgs) {
  return [{ title: 'Admin | Yohara Gemilang' }, { name: 'robots', content: 'noindex, nofollow' }];
}

export async function loader({ context }: Route.LoaderArgs) {
  const { name, email } = context.get(adminContext);
  const newMessages = await db.contactMessage.count({ where: { status: 'NEW' } });
  return { admin: { name, email }, newMessages };
}

const inbox = (path: string) => path === '/admin' || path.startsWith('/admin/pesan');

/** Jumlah pesan baru hanya dihitung ulang saat pesan dibuka, ditinggalkan, atau diubah. */
export function shouldRevalidate({ formAction, currentUrl, nextUrl }: ShouldRevalidateFunctionArgs) {
  if (formAction) return formAction.startsWith('/admin/pesan');
  return inbox(currentUrl.pathname) || inbox(nextUrl.pathname);
}

export default function AdminLayout({ loaderData }: Route.ComponentProps) {
  const busy = useNavigation().state === 'loading';
  return (
    <SidebarProvider>
      <NavProgress />
      <AppSidebar admin={loaderData.admin} newMessages={loaderData.newMessages} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <span className="text-sm text-muted-foreground">Panel Admin</span>
        </header>
        <div className={cn('mx-auto w-full max-w-6xl p-4 transition-opacity duration-200 md:p-8', busy && 'opacity-60')}>
          <Outlet />
        </div>
      </SidebarInset>
      <Toaster richColors closeButton />
    </SidebarProvider>
  );
}
