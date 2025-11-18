'use client';

import { useSession } from 'next-auth/react';
import { getUserScope } from '../utils/auth';

export default function RoleBadge() {
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
    <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
      <span className="text-sm font-medium text-emerald-700">
        {getRoleLabel(session.user.role)} • {getUserScope(session.user)}
      </span>
    </div>
  );
}

