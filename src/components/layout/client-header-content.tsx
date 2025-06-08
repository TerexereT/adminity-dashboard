'use client';

import * as React from 'react';
import { AdminityLogo } from '@/components/icons';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';

export function ClientHeaderContent() {
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
