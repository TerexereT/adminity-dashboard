
import * as React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { HeaderNav } from '@/components/layout/header-nav'; // Import HeaderNav
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
} from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ClientHeaderContent } from '@/components/layout/client-header-content';
import { ClientSidebarContent } from '@/components/layout/client-sidebar-content';


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session?.userId) {
    redirect('/login');
  }
  
  return (
      <div className="flex min-h-screen w-full bg-muted/40">
        <Sidebar collapsible="icon" variant="sidebar" side="left">
          <SidebarHeader className="border-b">
            <ClientHeaderContent />
          </SidebarHeader>
          <SidebarContent>
            <ScrollArea className="h-full">
              <ClientSidebarContent />
            </ScrollArea>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <HeaderNav session={session} /> {/* Add HeaderNav back here */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </div>
  );
}
