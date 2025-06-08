import type { NavItem } from '@/lib/types';
import { Users, LayoutDashboard, ShieldAlert, FileText, BarChart3, Settings } from 'lucide-react';

export const DASHBOARD_NAV_ITEMS: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    matchExact: true,
  },
  {
    title: 'Admin Management',
    href: '/dashboard/admins',
    icon: ShieldAlert,
  },
  {
    title: 'User Management',
    href: '/dashboard/users',
    icon: Users,
  },
  {
    title: 'Survey Responses',
    href: '/dashboard/surveys',
    icon: BarChart3,
  },
  {
    title: 'Documents',
    href: '/dashboard/documents',
    icon: FileText,
  },
  // {
  //   title: 'Settings',
  //   href: '/dashboard/settings',
  //   icon: Settings,
  // }
];

export const MOCK_ADMINS_COUNT = 5;
export const MOCK_USERS_COUNT = 50;
export const MOCK_SURVEYS_COUNT = 100;
export const MOCK_DOCUMENTS_COUNT = 75;
