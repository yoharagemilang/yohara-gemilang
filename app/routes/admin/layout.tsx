// app/routes/admin/layout.tsx
import { Outlet } from 'react-router';

import { AppSidebar } from '~/components/admin/app-sidebar';
import { Separator } from '~/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '~/components/ui/sidebar';
import { Toaster } from '~/components/ui/sonner';
import { TooltipProvider } from '~/components/ui/tooltip';
import { db } from '~/lib/db.server';
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

export default function AdminLayout({ loaderData }: Route.ComponentProps) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar admin={loaderData.admin} newMessages={loaderData.newMessages} />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-4" />
            <span className="text-sm text-muted-foreground">Panel Admin</span>
          </header>
          <div className="mx-auto w-full max-w-6xl p-4 md:p-8">
            <Outlet />
          </div>
        </SidebarInset>
        <Toaster />
      </SidebarProvider>
    </TooltipProvider>
  );
}
