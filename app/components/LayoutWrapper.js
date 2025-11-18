'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Sidebar from './Sidebar';
import BottomNavbar from './BottomNavbar';
import SessionTimeout from './SessionTimeout';
import { useSidebar } from '../contexts/SidebarContext';

export default function LayoutWrapper({ children }) {
  // All hooks must be called at the top, before any conditional returns
  const { isCollapsed } = useSidebar();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Redirect to login if not authenticated (defense in depth)
  // This hook must be called on every render, even for login page
  useEffect(() => {
    if (status === 'unauthenticated' && pathname !== '/login') {
      router.push('/login');
    }
  }, [status, pathname, router]);

  // Don't show sidebar/navbar on login page
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render layout if not authenticated (will redirect)
  if (status === 'unauthenticated' || !session) {
    return null;
  }
  
  return (
    <div className="flex min-h-screen">
      {/* Session Timeout Handler */}
      <SessionTimeout />
      
      {/* Sidebar for Desktop */}
      <Sidebar />
      
      {/* Main Content - margin adjusts based on sidebar width */}
      <div className={`flex-1 pb-24 lg:pb-0 transition-all duration-300 ${
        isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      }`}>
        {children}
      </div>

      {/* Bottom Navbar for Mobile */}
      <BottomNavbar />
    </div>
  );
}
