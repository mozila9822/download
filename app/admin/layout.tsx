
'use client';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  Building2,
  Calendar,
  Contact,
  HardHat,
  HelpCircle,
  Home,
  Package2,
  Settings,
  ShoppingCart,
  Wrench,
  BarChart,
  LogOut,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AdminHeader from '@/components/admin/AdminHeader';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/admin/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/admin/bookings', icon: ShoppingCart, label: 'Bookings Management' },
  { href: '/admin/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/admin/rooms', icon: Building2, label: 'Rooms & Properties' },
  { href: '/admin/clients', icon: Contact, label: 'Clients / Companies' },
  { href: '/admin/workers', icon: HardHat, label: 'Workers / Staff' },
  { href: '/admin/reports', icon: BarChart, label: 'Reports & Analytics' },
  { href: '/admin/operations', icon: Wrench, label: 'Operations' },
];

const secondaryNavItems = [
    { href: '/admin/settings', icon: Settings, label: 'Settings' },
    { href: '/admin/support', icon: HelpCircle, label: 'Help & Support' },
]

function AdminApp({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<{ displayName: string; email: string }>({ displayName: 'Admin User', email: 'admin@voyagehub.io' });

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    router.push('/');
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/session', { method: 'GET', cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json().catch(() => ({}));
        const email: string | undefined = data?.user?.email;
        if (!email) return;
        // Try to get full name from users API; fallback to email local part
        const ures = await fetch(`/api/users?email=${encodeURIComponent(email)}`, { cache: 'no-store' });
        let displayName = (email.split('@')[0] || 'User').replace(/\./g, ' ');
        if (ures.ok) {
          const list = await ures.json().catch(() => []);
          const first = Array.isArray(list) && list.length > 0 ? list[0] : null;
          if (first && (first.firstName || first.lastName)) {
            displayName = `${first.firstName || ''} ${first.lastName || ''}`.trim() || displayName;
          }
        }
        if (!cancelled) setUser({ displayName, email });
      } catch {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, []);


  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="size-9 shrink-0"
              asChild
            >
              <Link href="/">
                <Package2 className="size-5" />
                <span className="sr-only">VoyageHub</span>
              </Link>
            </Button>
            <h2 className="text-lg font-semibold font-headline text-sidebar-foreground">
              VoyageHub
            </h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  tooltip={{ children: item.label }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="mt-auto">
        <SidebarMenu>
            {secondaryNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  tooltip={{ children: item.label }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          <div className="flex items-center gap-3 p-2 border-t border-sidebar-border mt-2">
            <Avatar className="size-8">
              <AvatarImage src={"https://github.com/shadcn.png"} alt={user.displayName} />
              <AvatarFallback>{user.email.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col flex-1">
              <span className="text-sm font-medium text-sidebar-foreground truncate">
                {user.displayName}
              </span>
              <span className="text-xs text-sidebar-foreground/70 truncate">
                {user.email}
              </span>
            </div>
            <Button variant="ghost" size="icon" className="shrink-0" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
                <span className="sr-only">Sign Out</span>
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <AdminHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-gray-100 dark:bg-gray-900">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}


export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminApp>{children}</AdminApp>;
}
