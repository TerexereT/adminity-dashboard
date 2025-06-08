'use client';

import * as React from 'react';
import { DASHBOARD_NAV_ITEMS } from '@/lib/constants';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { useSidebar } from '@/components/ui/sidebar';

export function ClientSidebarContent() {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  return <SidebarNav items={DASHBOARD_NAV_ITEMS} isCollapsed={isCollapsed} />;
}
