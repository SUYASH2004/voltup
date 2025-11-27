'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

export default function BottomNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { 
      href: '/', 
      label: 'Home', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      href: '/assets', 
      label: 'Assets', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      href: '/work-orders', 
      label: 'Orders', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    { 
      href: '/customer-plans', 
      label: 'Plans', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
  ];

  const isActive = (href) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      // Sign out without redirect first
      const result = await signOut({ 
        redirect: false 
      });
      
      // Then manually navigate to login page
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: manually redirect if signOut fails
      router.push('/login');
    }
  };

  return (
    <nav className="lg:hidden fixed bottom-4 left-4 right-4 z-50 safe-area-bottom">
      <div className="bg-white rounded-full shadow-2xl border border-gray-200/60 backdrop-blur-md">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 relative group ${
                  active ? 'text-emerald-600' : 'text-gray-500'
                }`}
              >
                <div className={`relative transition-all duration-200 ${active ? 'scale-110' : 'scale-100 group-hover:scale-105'}`}>
                  <div className={active ? 'p-1.5 bg-emerald-50 rounded-full' : ''}>
                    {item.icon}
                  </div>
                  {active && (
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-600 rounded-full border-2 border-white shadow-sm"></div>
                  )}
                </div>
                <span className={`text-[10px] font-semibold mt-0.5 transition-colors ${active ? 'text-emerald-600' : 'text-gray-500 group-hover:text-gray-700'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center h-full px-3 transition-all duration-200 relative group text-red-500 hover:text-red-600"
            title="Logout"
          >
            <div className="relative transition-all duration-200 group-hover:scale-105">
              <div className="p-1.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
            </div>
            <span className="text-[10px] font-semibold mt-0.5 transition-colors text-red-500 group-hover:text-red-600">
              Logout
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}
