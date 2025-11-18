'use client';

import SessionProvider from './SessionProvider';
import { SidebarProvider } from '../contexts/SidebarContext';

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <SidebarProvider>
        {children}
      </SidebarProvider>
    </SessionProvider>
  );
}

