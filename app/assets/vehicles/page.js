'use client';

import { useState } from 'react';
import { ChevronDown, Zap, AlertCircle, Wrench, Filter, X } from 'lucide-react';

const vehiclesTabs = [
  {
    id: 'active',
    label: 'Active Vehicles',
    icon: Zap,
    description: 'Vehicles in operation',
    nestedTabs: [
      { id: 'running', label: 'Running', count: 142 },
      { id: 'idle', label: 'Idle', count: 28 },
      { id: 'reserved', label: 'Reserved', count: 15 },
    ],
  },
  {
    id: 'inactive',
    label: 'Inactive Vehicles',
    icon: AlertCircle,
    description: 'Vehicles not in use',
    nestedTabs: [
      { id: 'stopped', label: 'Stopped', count: 8 },
      { id: 'damaged', label: 'Damaged', count: 5 },
    ],
  },
  {
    id: 'maintenance',
    label: 'Maintenance',
    icon: Wrench,
    description: 'Under maintenance',
    nestedTabs: [
      { id: 'scheduled', label: 'Scheduled', count: 3 },
      { id: 'in-progress', label: 'In Progress', count: 7 },
      { id: 'completed', label: 'Completed Today', count: 12 },
    ],
  },
];

export default function VehiclesPage() {
  const [activeTab, setActiveTab] = useState('active');
  const [activeNestedTab, setActiveNestedTab] = useState('running');
  const [expandedTabs, setExpandedTabs] = useState({ active: true });
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    oem: 'all',
    model: 'all',
    hub: 'all',
  });

  // Filter options - Mock data (replace with API data)
  const filterOptions = {
    statuses: ['All', 'Running', 'Idle', 'Reserved', 'Stopped', 'Damaged'],
    oems: ['All', 'Tesla', 'BMW', 'Audi', 'Hyundai', 'MG'],
    models: ['All', 'Model 3', 'Model S', 'i3', 'i8', 'e-tron', 'Ioniq 5', 'ZS EV'],
    hubs: ['All', 'Hub-1', 'Hub-2', 'Hub-3', 'Hub-4', 'Hexagon'],
  };

  const currentTab = vehiclesTabs.find((tab) => tab.id === activeTab);
  const currentNestedTab = currentTab?.nestedTabs.find(
    (tab) => tab.id === activeNestedTab
  );

  const toggleExpand = (tabId) => {
    setExpandedTabs((prev) => ({
      ...prev,
      [tabId]: !prev[tabId],
    }));
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const applyFilters = () => {
    // TODO: Make API call with filters
    console.log('Filters applied:', filters);
    setShowFilterModal(false);
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      oem: 'all',
      model: 'all',
      hub: 'all',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Filter Button */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vehicles</h1>
          <p className="text-gray-600 mt-2">Manage and monitor all vehicle assets</p>
        </div>
        <button
          onClick={() => setShowFilterModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
        >
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Active Filters Display */}
      {(filters.status !== 'all' || filters.oem !== 'all' || filters.model !== 'all' || filters.hub !== 'all') && (
        <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <span className="text-sm font-medium text-blue-900">Active Filters:</span>
          {filters.status !== 'all' && (
            <span className="px-3 py-1 bg-blue-200 text-blue-900 rounded-full text-sm">
              Status: {filters.status}
            </span>
          )}
          {filters.oem !== 'all' && (
            <span className="px-3 py-1 bg-blue-200 text-blue-900 rounded-full text-sm">
              OEM: {filters.oem}
            </span>
          )}
          {filters.model !== 'all' && (
            <span className="px-3 py-1 bg-blue-200 text-blue-900 rounded-full text-sm">
              Model: {filters.model}
            </span>
          )}
          {filters.hub !== 'all' && (
            <span className="px-3 py-1 bg-blue-200 text-blue-900 rounded-full text-sm">
              Hub: {filters.hub}
            </span>
          )}
        </div>
      )}

      {/* Main Tabs with Nested Structure */}
      <div className="space-y-3">
        {vehiclesTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isExpanded = expandedTabs[tab.id];

          return (
            <div key={tab.id} className="space-y-2">
              {/* Main Tab Button */}
              <button
                onClick={() => {
                  setActiveTab(tab.id);
                  setActiveNestedTab(tab.nestedTabs[0].id);
                  toggleExpand(tab.id);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-50 border-2 border-blue-500 shadow-sm'
                    : 'bg-white border border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-600'}`} />
                <div className="flex-1 text-left">
                  <div className={`font-semibold ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                    {tab.label}
                  </div>
                  <div className="text-xs text-gray-500">{tab.description}</div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Nested Tabs - Visible when expanded */}
              {isExpanded && isActive && (
                <div className="ml-4 space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Filter by Status
                  </div>
                  <div className="space-y-2">
                    {tab.nestedTabs.map((nestedTab) => (
                      <button
                        key={nestedTab.id}
                        onClick={() => setActiveNestedTab(nestedTab.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-sm ${
                          activeNestedTab?.id === nestedTab.id
                            ? 'bg-blue-100 text-blue-900 font-medium'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{nestedTab.label}</span>
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            activeNestedTab?.id === nestedTab.id
                              ? 'bg-blue-200 text-blue-900'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {nestedTab.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="mt-8 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{currentTab?.label}</h2>
          <p className="text-gray-600 mt-1">
            {currentNestedTab?.label} - {currentNestedTab?.count} items
          </p>
        </div>

        {/* Placeholder for content based on selected tabs */}
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">
            Content for: <span className="font-bold">{currentTab?.label}</span> →{' '}
            <span className="font-bold">{currentNestedTab?.label}</span>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white p-4 rounded border border-gray-200">
              <div className="text-3xl font-bold text-blue-600">{currentNestedTab?.count}</div>
              <div className="text-sm text-gray-600 mt-2">{currentNestedTab?.label}</div>
            </div>
            <div className="bg-white p-4 rounded border border-gray-200">
              <div className="text-3xl font-bold text-green-600">92%</div>
              <div className="text-sm text-gray-600 mt-2">Health Status</div>
            </div>
            <div className="bg-white p-4 rounded border border-gray-200">
              <div className="text-3xl font-bold text-orange-600">4.2h</div>
              <div className="text-sm text-gray-600 mt-2">Avg Usage</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Filter Vehicles</h2>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {filterOptions.statuses.map((status) => (
                    <option key={status} value={status.toLowerCase()}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {/* OEM Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  OEM (Manufacturer)
                </label>
                <select
                  value={filters.oem}
                  onChange={(e) => handleFilterChange('oem', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {filterOptions.oems.map((oem) => (
                    <option key={oem} value={oem.toLowerCase()}>
                      {oem}
                    </option>
                  ))}
                </select>
              </div>

              {/* Model Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Model
                </label>
                <select
                  value={filters.model}
                  onChange={(e) => handleFilterChange('model', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {filterOptions.models.map((model) => (
                    <option key={model} value={model.toLowerCase()}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hub/Hexagon Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Hub / Hexagon
                </label>
                <select
                  value={filters.hub}
                  onChange={(e) => handleFilterChange('hub', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {filterOptions.hubs.map((hub) => (
                    <option key={hub} value={hub.toLowerCase()}>
                      {hub}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium flex-1"
              >
                Reset
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium flex-1"
              >
                Cancel
              </button>
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex-1"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

