// app/components/admin/app-sidebar.tsx
import { Briefcase, ChevronsUpDown, ExternalLink, FileText, Folder, Handshake, CircleHelp, Image as ImageIcon, Images, Info, LayoutDashboard, LogOut, Mail, Settings, Users, type LucideIcon } from 'lucide-react';
import { Link, useLocation, useSubmit } from 'react-router';

import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '~/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '~/components/ui/sidebar';
import { adminNav, type NavIcon } from './nav';

const icons: Record<NavIcon, LucideIcon> = {
  layout: LayoutDashboard,
  image: ImageIcon,
  images: Images,
  briefcase: Briefcase,
  handshake: Handshake,
  folder: Folder,
  file: FileText,
  help: CircleHelp,
  info: Info,
  users: Users,
  mail: Mail,
  settings: Settings,
};

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

export function AppSidebar({ admin, newMessages }: { admin: { name: string; email: string }; newMessages: number }) {
  const { pathname } = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();
  const submit = useSubmit();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-2 py-1.5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Yohara Gemilang</p>
          <p className="text-xs text-muted-foreground">Panel Admin</p>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {adminNav.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = icons[item.icon];
                  const active = item.to === '/admin' ? pathname === '/admin' : pathname.startsWith(item.to);

                  return (
                    <SidebarMenuItem key={item.to}>
                      {item.ready ? (
                        <SidebarMenuButton isActive={active} render={<Link to={item.to} onClick={() => isMobile && setOpenMobile(false)} />}>
                          <Icon />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      ) : (
                        <SidebarMenuButton disabled>
                          <Icon />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      )}
                      {item.to === '/admin/pesan' && newMessages > 0 ? <SidebarMenuBadge>{newMessages}</SidebarMenuBadge> : null}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger render={<SidebarMenuButton size="lg" className="data-popup-open:bg-sidebar-accent" />}>
                <Avatar className="size-8">
                  <AvatarFallback>{initials(admin.name)}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{admin.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{admin.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent side={isMobile ? 'bottom' : 'right'} align="end" className="min-w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{admin.email}</DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<a href="/" target="_blank" rel="noreferrer" />}>
                  <ExternalLink />
                  Lihat situs
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={() => submit(null, { method: 'post', action: '/admin/logout' })}>
                  <LogOut />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
