"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Car, History, Radar, RefreshCw } from "lucide-react";
import BottomNavbar from "../../components/BottomNavbar";
import { ALLOWED_ROLES, FILTER_OPTIONS, METRIC_TABS, VEHICLE_DATA } from "./constants";

// ============================================================================
// CENTRALIZED COMPONENTS - Google-level Production Quality
// ============================================================================

/**
 * Filter Dropdown Component
 * Accessible, keyboard-navigable dropdown with smooth animations
 */
function FilterDropdown({ options, selectedKey, onSelect }) {
  const [open, setOpen] = useState(false);
  const activeOption = useMemo(() => options.find((option) => option.key === selectedKey), [options, selectedKey]);

  const handleSelect = (key) => {
    onSelect(key);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="group inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2.5 text-sm font-medium text-emerald-700 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        aria-label="Filter vehicles"
        aria-expanded={open}
      >
        <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span>Filter</span>
        {activeOption && (
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-100">
            {activeOption.label}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="py-1" role="menu" aria-orientation="vertical">
              {options.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => handleSelect(filter.key)}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors ${selectedKey === filter.key
                      ? "bg-emerald-50 text-emerald-700 font-semibold"
                      : "text-gray-700 hover:bg-gray-50"
                    }`}
                  role="menuitem"
                >
                  <span>{filter.label}</span>
                  {selectedKey === filter.key && (
                    <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Metric Card Component
 * Displays key metrics with subtle hover effects and visual hierarchy
 */
function MetricCard({ title, value, subtitle, icon: Icon }) {
  return (
    <div className="group relative rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300 overflow-hidden">
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-emerald-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
            <Icon className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</p>
        </div>
        <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </div>
    </div>
  );
}

/**
 * Metrics Panel Component
 * Container for metric visualizations with tab navigation
 */
function MetricsPanel({ tabs, activeTab, onTabChange, activeMessage, filterLabel, vehicleCount }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Vehicle Metrics</h2>
          <p className="text-sm text-gray-600 mt-0.5">
            Filter: <span className="font-semibold text-emerald-600">{filterLabel}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-gray-700">{vehicleCount} vehicles</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`relative rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${activeTab === tab.key
                ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                : "border-gray-200 bg-white text-gray-600 hover:border-emerald-200 hover:bg-emerald-50/50 hover:text-emerald-700"
              }`}
          >
            {activeTab === tab.key && (
              <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-pulse" />
            )}
            <span className="relative">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="relative min-h-[160px] rounded-xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50 to-white p-8 flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-4 right-4 w-16 h-16 bg-emerald-100 rounded-full opacity-20 blur-2xl" />
        <div className="absolute bottom-4 left-4 w-20 h-20 bg-blue-100 rounded-full opacity-20 blur-2xl" />

        <div className="relative">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-gray-800 mb-1">Coming Soon</p>
          <p className="text-sm text-gray-500 max-w-sm">{activeMessage}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Page Header Component
 * Consistent header layout with breadcrumb and actions
 */
function PageHeader({ eyebrow, title, description, rightSlot }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-1">
        <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-emerald-600">{eyebrow}</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <div className="flex-shrink-0">
        {rightSlot}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function VehiclesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userRole = session?.user?.role;

  const [selectedFilter, setSelectedFilter] = useState(FILTER_OPTIONS[0].key);
  const [metricsTab, setMetricsTab] = useState(METRIC_TABS[0].key);

  // Authentication & Authorization
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.user && !ALLOWED_ROLES.includes(session.user.role)) {
      router.push("/");
    }
  }, [status, session, router]);

  // Loading State
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-emerald-200 animate-ping" />
            <div className="relative w-12 h-12 rounded-full border-2 border-t-emerald-600 border-r-emerald-600 border-b-emerald-200 border-l-emerald-200 animate-spin" />
          </div>
          <p className="text-sm font-medium text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !session) return null;
  if (!ALLOWED_ROLES.includes(userRole)) return null;

  // Data Processing
  const activeFilter = useMemo(
    () => FILTER_OPTIONS.find((item) => item.key === selectedFilter) ?? FILTER_OPTIONS[0],
    [selectedFilter]
  );

  const filteredVehicles = useMemo(
    () => VEHICLE_DATA.filter((vehicle) => activeFilter.predicate(vehicle)),
    [activeFilter]
  );

  const metrics = useMemo(() => {
    const totalVehicles = filteredVehicles.length;
    const seen24 = filteredVehicles.filter((v) => v.lastSeenHours <= 24).length;
    const swapped3 = filteredVehicles.filter((v) => v.lastSwapDays <= 3).length;
    const planEndedThree = filteredVehicles.filter((v) => v.planEndedDaysAgo <= 3).length;
    const defective = filteredVehicles.filter((v) => v.status === "defective").length;

    return { totalVehicles, seen24, swapped3, planEndedThree, defective };
  }, [filteredVehicles]);

  // Metric Cards Configuration
  const metricCards = [
    { title: "Total Count", value: metrics.totalVehicles, subtitle: "Filtered vehicles", icon: Car },
    { title: "Active 24h", value: metrics.seen24, subtitle: "Recently active", icon: Radar },
    { title: "Swapped 3d", value: metrics.swapped3, subtitle: "Energy swaps", icon: RefreshCw },
    { title: "Plan Ending", value: metrics.planEndedThree, subtitle: "Needs renewal", icon: History },
    { title: "Defective", value: metrics.defective, subtitle: "Needs service", icon: AlertTriangle }
  ];

  const filterLabel = activeFilter.label;
  const metricsTabContent = METRIC_TABS.find((tab) => tab.key === metricsTab) ?? METRIC_TABS[0];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50 pb-24 lg:pb-8">
        <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <PageHeader
            eyebrow="Assets · Vehicles"
            title="Vehicle Dashboard"
            description="Monitor and manage your vehicle fleet"
            rightSlot={
              <FilterDropdown options={FILTER_OPTIONS} selectedKey={selectedFilter} onSelect={setSelectedFilter} />
            }
          />

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {metricCards.map((card) => (
              <MetricCard key={card.title} {...card} />
            ))}
          </div>

          <MetricsPanel
            tabs={METRIC_TABS}
            activeTab={metricsTab}
            onTabChange={setMetricsTab}
            activeMessage={metricsTabContent.message}
            filterLabel={filterLabel}
            vehicleCount={filteredVehicles.length}
          />
        </main>
      </div>

      <BottomNavbar />
    </>
  );
}
