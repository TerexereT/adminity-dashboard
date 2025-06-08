import * as React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { DASHBOARD_NAV_ITEMS } from '@/lib/constants';
import { AdminityLogo } from '@/components/icons';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { HeaderNav } from '@/components/layout/header-nav';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';

// Client component to manage sidebar state and pass to SidebarNav
function DashboardSidebarClient({ isCollapsed }: { isCollapsed: boolean }) {
  return <SidebarNav items={DASHBOARD_NAV_ITEMS} isCollapsed={isCollapsed} />;
}

// Client component to manage header state and pass session to HeaderNav
function DashboardHeaderClient({ session }: { session: Awaited<ReturnType<typeof getSession>> }) {
   // This component ensures HeaderNav (client) can access useSidebar hook
  return <HeaderNav session={session} />;
}


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session?.userId) {
    redirect('/login');
  }
  
  // The Sidebar component from shadcn is a client component internally.
  // We pass a server-computed value (isCollapsed can be derived from cookies for persistence)
  // Or, we let the SidebarProvider handle its state client-side.
  // For simplicity, we'll assume SidebarProvider handles its collapsed state.
  // We need a client component wrapper to use the `useSidebar` hook for `isCollapsed`.

  return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <Sidebar collapsible="icon" variant="sidebar" side="left">
          <SidebarHeader className="border-b">
             {/* Client component wrapper needed for useSidebar */}
            <ClientHeaderContent />
          </SidebarHeader>
          <SidebarContent>
            <ScrollArea className="h-full">
               {/* Client component wrapper needed for useSidebar */}
              <ClientSidebarContent />
            </ScrollArea>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <DashboardHeaderClient session={session} />
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </div>
  );
}

// Helper client component to use useSidebar hook
function ClientSidebarContent() {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  return <SidebarNav items={DASHBOARD_NAV_ITEMS} isCollapsed={isCollapsed} />;
}

function ClientHeaderContent() {
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === 'collapsed';

  if (isMobile) return null; // SidebarTrigger in HeaderNav handles mobile toggle

  return (
    <div className="flex h-16 items-center justify-between px-4">
      {!isCollapsed && (
        <div className="flex items-center">
          <AdminityLogo />
        </div>
      )}
      <SidebarTrigger className={isCollapsed ? 'mx-auto' : ''} />
    </div>
  );
}
