import AssetTabs from './components/AssetTabs';

export default function AssetsLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="mb-3 sm:mb-4 md:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Assets</h1>
          <p className="text-gray-600 text-xs sm:text-sm md:text-base">Manage and monitor your assets</p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <AssetTabs />
          <div className="p-3 sm:p-4 md:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
