export default function BatteriesPage() {
  return (
    <div className="text-center py-6 sm:py-8 md:py-12">
      <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
        <svg className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      </div>
      <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">Batteries</h2>
      <p className="text-gray-500 text-xs sm:text-sm md:text-base max-w-md mx-auto px-3 sm:px-4">
        Battery data will be displayed here. This section is ready for database integration.
      </p>
    </div>
  );
}

