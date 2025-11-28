"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import MetricCard from "@/app/components/MetricCard"; // ✅ YOUR METRIC CARD FILE

export default function BatteryDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // ALLOWED ROLES → Regional Head + Circle Head
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const role = session.user.role;
      if (role !== "regional_head" && role !== "circle_head") {
        router.push("/"); // redirect to dashboard if unauthorized
      }
    }
  }, [status, session, router]);

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (status === "unauthenticated" || !session) {
    return null;
  }

  // Don't render if user doesn't have access
  const role = session?.user?.role;
  if (role !== "regional_head" && role !== "circle_head") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="space-y-6">

          {/* PAGE HEADER */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-emerald-700">
              Battery Swap Dashboard
            </h1>
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>

          {/* METRIC CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

            <MetricCard
              icon={
                <svg className="text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              }
              title="Today Swaps"
              value="1,247"
              subtitle="Region Mumbai"
            />

            <MetricCard
              icon={
                <svg className="text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              }
              title="Yesterday"
              value="1,189"
              subtitle="Yesterday Growth"
              trend="+4.9%"
            />

            <MetricCard
              icon={
                <svg className="text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              title="Weekly Avg"
              value="1,156"
              subtitle="swaps/day"
            />

            <MetricCard
              icon={
                <svg className="text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title="Target Achievement"
              value="96%"
              subtitle="Target 1,300/day"
            />

          </div>

          {/* CIRCLE BREAKDOWN */}
          <div className="p-6 bg-white rounded-xl shadow border">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Circle Breakdown</h2>

            <div className="space-y-2 text-gray-800">
              <p>Circle A: <b>456 swaps</b></p>
              <p>Circle B: <b>523 swaps</b></p>
              <p>Circle C: <b>268 swaps</b></p>
            </div>
          </div>

          {/* TREND CHART PLACEHOLDER */}
          <div className="p-6 bg-white rounded-xl shadow border">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              30-Day Swap Trend
            </h2>

            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
              📊 Chart will come here
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
