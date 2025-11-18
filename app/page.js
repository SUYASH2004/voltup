'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import KPICard from './components/KPICard';
import StatusBadge from './components/StatusBadge';
import RoleBadge from './components/RoleBadge';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

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

  // Don't render dashboard if not authenticated (will redirect)
  if (status === 'unauthenticated' || !session) {
    return null;
  }
  // Dummy data for dashboard
  const kpiData = [
    { title: 'Total Assets', value: '1,247', change: '+12% from last month', icon: '🚗', trend: 'up' },
    { title: 'Active Work Orders', value: '43', change: '+5 new today', icon: '📋', trend: 'up' },
    { title: 'Available Assets', value: '892', change: '68% availability', icon: '✅', trend: 'up' },
  ];

  const recentWorkOrders = [
    { id: 'WO-001', asset: 'EV-2024-001', status: 'pending', priority: 'High' },
    { id: 'WO-002', asset: 'EV-2024-045', status: 'in-progress', priority: 'Medium' },
    { id: 'WO-003', asset: 'EV-2024-089', status: 'completed', priority: 'Low' },
  ];

  const recentAssets = [
    { id: 'EV-2024-001', name: 'Electric Vehicle Model X', status: 'available', location: 'Mumbai Hub' },
    { id: 'EV-2024-045', name: 'Electric Vehicle Model Y', status: 'inuse', location: 'Delhi Hub' },
    { id: 'EV-2024-089', name: 'Electric Vehicle Model Z', status: 'maintenance', location: 'Bangalore Hub' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-4 sm:p-6 lg:p-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 text-sm sm:text-base mt-1">Monitor your assets and work orders</p>
              <div className="mt-3">
                <RoleBadge />
              </div>
            </div>
            <div className="hidden sm:flex items-center space-x-2">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 sm:mb-8">
          {kpiData.map((kpi, index) => (
            <KPICard
              key={index}
              title={kpi.title}
              value={kpi.value}
              change={kpi.change}
              icon={kpi.icon}
              trend={kpi.trend}
            />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 sm:mb-8">
          {/* Recent Work Orders */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recent Work Orders</h2>
                <p className="text-xs text-gray-500 mt-1">Latest activity and updates</p>
              </div>
              <a href="/work-orders" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center">
                View All
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            <div className="space-y-3">
              {recentWorkOrders.map((order) => (
                <div key={order.id} className="border border-gray-100 rounded-lg p-3 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm">{order.id}</h3>
                      <p className="text-xs text-gray-600 mt-0.5">Asset: {order.asset}</p>
                    </div>
                    <StatusBadge status={order.status} size="sm" />
                  </div>
                  <div className="mt-2 flex items-center">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                      order.priority === 'High' ? 'bg-red-50 text-red-700 border border-red-200' :
                      order.priority === 'Medium' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                      'bg-gray-50 text-gray-700 border border-gray-200'
                    }`}>
                      {order.priority} Priority
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Asset Status Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Asset Status</h2>
                <p className="text-xs text-gray-500 mt-1">Current asset availability</p>
              </div>
              <a href="/assets" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center">
                View All
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            <div className="space-y-3">
              {recentAssets.map((asset) => (
                <div key={asset.id} className="border border-gray-100 rounded-lg p-3 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{asset.name}</h3>
                      <p className="text-xs text-gray-600 mt-0.5">{asset.id}</p>
                    </div>
                    <StatusBadge status={asset.status} size="sm" />
                  </div>
                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {asset.location}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
