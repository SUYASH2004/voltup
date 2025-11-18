'use client';

import { useSession, signOut } from 'next-auth/react';
import { getUserScope } from '../utils/auth';

export default function UserProfile() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  const getRoleLabel = (role) => {
    switch (role) {
      case 'regional_head':
        return 'Regional Head';
      case 'circle_head':
        return 'Circle Head';
      case 'area_head':
        return 'Area Head';
      default:
        return role;
    }
  };

  return (
    <div className="flex items-center space-x-3 px-4 py-2 border-t border-gray-200">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{session.user.name}</p>
        <p className="text-xs text-gray-500 truncate">{getRoleLabel(session.user.role)}</p>
        <p className="text-xs text-emerald-600 truncate">{getUserScope(session.user)}</p>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        title="Sign out"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </div>
  );
}

