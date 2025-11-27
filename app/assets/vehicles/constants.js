export const ALLOWED_ROLES = ["regional_head", "circle_head", "area_head"];

export const VEHICLE_DATA = [
  { id: "VX-2301", city: "Mumbai", status: "active", lastSeenHours: 2, lastSwapDays: 1, planEndedDaysAgo: 5 },
  { id: "VX-2314", city: "Pune", status: "active", lastSeenHours: 8, lastSwapDays: 0, planEndedDaysAgo: 2 },
  { id: "VX-2420", city: "Hyderabad", status: "idle", lastSeenHours: 20, lastSwapDays: 4, planEndedDaysAgo: 3 },
  { id: "VX-1991", city: "Bengaluru", status: "defective", lastSeenHours: 36, lastSwapDays: 6, planEndedDaysAgo: 1 },
  { id: "VX-2205", city: "Mumbai", status: "active", lastSeenHours: 12, lastSwapDays: 2, planEndedDaysAgo: 7 },
  { id: "VX-2107", city: "Chennai", status: "offline", lastSeenHours: 48, lastSwapDays: 9, planEndedDaysAgo: 3 },
  { id: "VX-2043", city: "Delhi", status: "maintenance", lastSeenHours: 5, lastSwapDays: 3, planEndedDaysAgo: 10 },
  { id: "VX-2250", city: "Kochi", status: "active", lastSeenHours: 6, lastSwapDays: 1, planEndedDaysAgo: 0 },
  { id: "VX-2148", city: "Jaipur", status: "active", lastSeenHours: 18, lastSwapDays: 2, planEndedDaysAgo: 4 },
  { id: "VX-2059", city: "Ahmedabad", status: "defective", lastSeenHours: 30, lastSwapDays: 5, planEndedDaysAgo: 2 }
];

export const FILTER_OPTIONS = [
  { key: "none", label: "No filter", predicate: () => true },
  { key: "all", label: "Vehicle count", predicate: () => true },
  { key: "seen24", label: "Seen in 24h", predicate: (vehicle) => vehicle.lastSeenHours <= 24 },
  { key: "swapped3", label: "Swapped last 3d", predicate: (vehicle) => vehicle.lastSwapDays <= 3 },
  { key: "planEnded", label: "Plan ended ≤3d", predicate: (vehicle) => vehicle.planEndedDaysAgo <= 3 },
  { key: "defective", label: "Defective vehicles", predicate: (vehicle) => vehicle.status === "defective" }
];

export const METRIC_TABS = [
  { key: "table", label: "Table ", message: "Vehicle table view is on the way." },
  { key: "distribution", label: "Distribution", message: "Distribution charts coming soon." }
];

