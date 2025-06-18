
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarNavProps {
  items: NavItem[];
  isCollapsed: boolean;
}

export function SidebarNav({ items, isCollapsed }: SidebarNavProps) {
  const pathname = usePathname();

  if (!items?.length) {
    return null;
  }

  return (
    <SidebarMenu>
      {items.map((item, index) => {
        const Icon = item.icon;
        const isActive = item.matchExact ? pathname === item.href : pathname.startsWith(item.href);
        
        const buttonContent = (
          <>
            {Icon && <Icon className="h-5 w-5" />}
            <span className={cn(isCollapsed && "sr-only")}>{item.title}</span>
          </>
        );

        const menuButton = (
           <SidebarMenuButton
            asChild
            variant="default"
            size="default"
            className={cn(
              "w-full justify-center", // Changed from justify-start to justify-center
              isActive && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
              !isActive && "hover:bg-accent/50"
              // isCollapsed && "justify-center" // This is now handled by the base "justify-center"
            )}
            isActive={isActive}
          >
            <Link href={item.href} >
             {buttonContent}
            </Link>
          </SidebarMenuButton>
        );

        return (
          <SidebarMenuItem key={index}>
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  {menuButton}
                </TooltipTrigger>
                <TooltipContent side="right" align="center">
                  {item.title}
                </TooltipContent>
              </Tooltip>
            ) : (
              menuButton
            )}
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
