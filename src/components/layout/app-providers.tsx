'use client';

import * as React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';

export interface UserSession {
  userId: string;
  userName: string;
  userRole: 'admin' | 'superadmin';
}

interface AppContextType {
  session: UserSession | null;
  setSession: React.Dispatch<React.SetStateAction<UserSession | null>>;
}

export const AppContext = React.createContext<AppContextType | undefined>(undefined);

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<UserSession | null>(null);
  
  // In a real app, you would fetch the session here or pass it from a server component.
  // For now, this is a placeholder. The actual session is read by middleware/server components.
  // This client-side session is mainly for UI updates that don't require re-fetching from server.

  return (
    <AppContext.Provider value={{ session, setSession }}>
      <SidebarProvider defaultOpen={true}>
          {children}
      </SidebarProvider>
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProviders');
  }
  return context;
}
