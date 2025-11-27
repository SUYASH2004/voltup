"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// ✅ Centralized shared component
import MetricCard from "../../components/MetricCard";

export default function BatteryDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-4 sm:p-6 lg:p-8">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

          <MetricCard
            icon={
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2"
                viewBox="0 0 24 24">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            title="Today Swaps"
            value="1,247"
            subtitle="Region Mumbai"
          />

          <MetricCard
            icon={
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2"
                viewBox="0 0 24 24">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            }
            title="Yesterday"
            value="1,189"
            subtitle="+4.9% growth"
          />

          <MetricCard
            icon={
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2"
                viewBox="0 0 24 24">
                <path d="M12 20l9-16H3l9 16z" />
              </svg>
            }
            title="Weekly Avg"
            value="1,156"
            subtitle="swaps/day"
          />

          <MetricCard
            icon={
              <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2"
                viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 3" />
              </svg>
            }
            title="Target Achievement"
            value="96%"
            subtitle="Target 1,300/day"
          />

        </div>

      </main>
    </div>
  );
}
