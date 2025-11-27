"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const ALLOWED_ROLES = ["regional_head", "circle_head", "area_head"];

export default function BatteryDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userRole = session?.user?.role;

  // ---------------------- AUTH CHECK ----------------------
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      if (!ALLOWED_ROLES.includes(session.user.role)) {
        router.push("/");
      }
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>
          <div className="animate-spin w-8 h-8 border-b-2 border-emerald-600 rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !session) return null;

  if (!ALLOWED_ROLES.includes(userRole)) {
    return null;
  }

  // ---------------------- CONVERTER FUNCTION ----------------------
  function convertToUtcTimestamp(rawTime) {
    if (!rawTime) return null;

    const parts = rawTime.split(":");
    const min = parseInt(parts[0]);
    const sec = parseFloat(parts[1]);

    const baseDate = new Date().toISOString().split("T")[0]; // today

    const d = new Date(baseDate + "T00:00:00.000Z");
    d.setMinutes(min);
    d.setSeconds(sec);

    return d.toISOString();
  }

  // ---------------------- DUMMY DATA USING THE CONVERTER ----------------------
  const dummyTransactions = [
    // Today swaps
    { id: 1, timestamp: convertToUtcTimestamp("38:39.5"), region: "Mumbai" },
    { id: 2, timestamp: convertToUtcTimestamp("18:10.5"), region: "Mumbai" },
    { id: 3, timestamp: convertToUtcTimestamp("11:10.5"), region: "Mumbai" },

    // Yesterday swaps
    { id: 4, timestamp: convertToUtcTimestamp("14:10.5"), region: "Mumbai" },
    { id: 5, timestamp: convertToUtcTimestamp("19:22.5"), region: "Mumbai" },

    // Weekly extra
    { id: 6, timestamp: convertToUtcTimestamp("08:15.5"), region: "Mumbai" },
    { id: 7, timestamp: convertToUtcTimestamp("10:45.2"), region: "Mumbai" }
  ];

  // ---------------------- DATE RANGE LOGIC ----------------------
  function getTodayRange() {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return { start, end: now };
  }

  function getYesterdayRange() {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(now);
    end.setDate(end.getDate() - 1);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  // ---------------------- FILTERING ----------------------
  const { start: todayStart, end: todayEnd } = getTodayRange();
  const { start: yStart, end: yEnd } = getYesterdayRange();

  const todaySwaps = dummyTransactions.filter((t) => {
    const time = new Date(t.timestamp);
    return time >= todayStart && time <= todayEnd;
  }).length;

  const yesterdaySwaps = dummyTransactions.filter((t) => {
    const time = new Date(t.timestamp);
    return time >= yStart && time <= yEnd;
  }).length;

  const weeklyAvg = Math.round(dummyTransactions.length / 7);

  // ---------------------- UI ----------------------
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="space-y-6">

          <h1 className="text-3xl font-bold text-emerald-700">
            Battery Swap Dashboard
          </h1>

          {/* METRICS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <MetricCard title="Today Swaps" value={todaySwaps} subtitle="Auto from 12 AM" />
            <MetricCard title="Yesterday" value={yesterdaySwaps} subtitle="Prev day" />
            <MetricCard title="Weekly Avg" value={weeklyAvg} subtitle="Per day" />
            <MetricCard title="Target Achievement" value="96%" subtitle="Based on target" />
          </div>

          {/* CIRCLES */}
          <div className="p-6 bg-white rounded-xl shadow border">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Circle Breakdown</h2>
            <p>Circle A: <b>456 swaps</b></p>
            <p>Circle B: <b>523 swaps</b></p>
            <p>Circle C: <b>268 swaps</b></p>
          </div>

          {/* TREND */}
          <div className="p-6 bg-white rounded-xl shadow border">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">30-Day Swap Trend</h2>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
              📊 Chart will come here
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

function MetricCard({ title, value, subtitle }) {
  return (
    <div className="p-5 bg-white border rounded-xl shadow-sm hover:shadow-md transition">
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      <p className="text-3xl font-bold mt-3 text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}