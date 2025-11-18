'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import BottomNavbar from './BottomNavbar';
import SessionTimeout from './SessionTimeout';
import { useSidebar } from '../contexts/SidebarContext';

export default function LayoutWrapper({ children }) {
  const { isCollapsed } = useSidebar();
  const pathname = usePathname();
  
  // Don't show sidebar/navbar on login page
  if (pathname === '/login') {
    return <>{children}</>;
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
