'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AdminityLogo } from '@/components/icons';
import { logout } from '@/lib/actions/auth.actions';
import { LogOut, Settings, UserCircle } from 'lucide-react';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import type { UserSession } from './app-providers';

interface HeaderNavProps {
  session: UserSession | null;
}

export function HeaderNav({ session }: HeaderNavProps) {
  const { isMobile } = useSidebar();

  const handleLogout = async () => {
    await logout();
  };
  
  const userInitials = session?.userName
    ? session.userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'AD';


  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 shadow-sm">
      {isMobile && <SidebarTrigger className="md:hidden" />}
      {!isMobile && (
        <Link href="/dashboard" className="flex items-center gap-2">
          <AdminityLogo />
        </Link>
      )}
      
      <div className="flex-1" /> 
      {/* For mobile view, show logo if sidebar is collapsed/hidden */}
      {isMobile && (
         <Link href="/dashboard" className="flex items-center gap-2 md:hidden">
          <AdminityLogo />
        </Link>
      )}


      {session?.userId && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10 border border-primary">
                <AvatarImage src={`https://placehold.co/100x100.png?text=${userInitials}`} alt={session.userName || 'Admin'} data-ai-hint="user avatar" />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{session.userName || 'Administrator'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {session.userRole === 'superadmin' ? 'Super Admin' : 'Admin'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserCircle className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
}
