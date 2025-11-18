'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AssetTabs() {
  const pathname = usePathname();

  const tabs = [
    { 
      href: '/assets/vehicles', 
      label: 'Vehicles',
      shortLabel: 'Vehicles',
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      )
    },
    { 
      href: '/assets/batteries', 
      label: 'Batteries',
      shortLabel: 'Batteries',
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      )
    },
    { 
      href: '/assets/charging-stations', 
      label: 'Charging Stations',
      shortLabel: 'Stations',
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    { 
      href: '/assets/tcu', 
      label: 'TCU',
      shortLabel: 'TCU',
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      )
    },
  ];

  const isActive = (href) => {
    return pathname === href || pathname?.startsWith(href + '/');
  };

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="flex space-x-0.5 sm:space-x-1 overflow-x-auto scrollbar-hide px-2 sm:px-4">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center space-x-1 sm:space-x-2 px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap min-w-fit ${
                active
                  ? 'border-emerald-600 text-emerald-600 bg-emerald-50/50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50/50'
              }`}
            >
              <span className={`flex-shrink-0 ${active ? 'text-emerald-600' : 'text-gray-500'}`}>{tab.icon}</span>
              <span className="hidden xs:inline sm:hidden md:inline">{tab.label}</span>
              <span className="xs:hidden md:hidden">{tab.shortLabel}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
