'use client';

import { useState } from 'react';

export default function TestBackendPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/test');
      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data);
      }
    } catch (err) {
      setError({
        success: false,
        error: 'Frontend Error',
        message: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🔌 Backend Connection Tester
          </h1>
          <p className="text-gray-600">
            Test connection to FastAPI backend at{' '}
            <code className="bg-gray-200 px-2 py-1 rounded">
              http://10.68.23.55:8000
            </code>
          </p>
        </div>

        {/* Test Button */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <button
            onClick={testConnection}
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white text-lg transition-all ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Testing Connection...
              </span>
            ) : (
              '🧪 Test Backend Connection'
            )}
          </button>
        </div>

        {/* Success Result */}
        {result && result.success && (
          <div className="bg-green-50 border-l-4 border-green-500 rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center">
              ✅ Connection Successful!
            </h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 font-semibold">Backend URL:</p>
                <p className="text-lg text-green-700 font-mono bg-white p-3 rounded mt-1">
                  {result.backendUrl}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 font-semibold">Message:</p>
                <p className="text-lg text-green-700 bg-white p-3 rounded mt-1">
                  {result.message}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 font-semibold">Backend Response:</p>
                <pre className="bg-white p-4 rounded mt-1 overflow-auto text-sm border border-green-200">
                  {JSON.stringify(result.backendResponse, null, 2)}
                </pre>
              </div>

              <div>
                <p className="text-sm text-gray-600 font-semibold">Timestamp:</p>
                <p className="text-lg text-gray-700 bg-white p-3 rounded mt-1">
                  {new Date(result.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Result */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-red-700 mb-4 flex items-center">
              ❌ Connection Failed
            </h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 font-semibold">Error:</p>
                <p className="text-lg text-red-700 font-mono bg-white p-3 rounded mt-1">
                  {error.error}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 font-semibold">Details:</p>
                <p className="text-lg text-red-700 bg-white p-3 rounded mt-1">
                  {error.message}
                </p>
              </div>

              {error.hint && (
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Hint:</p>
                  <p className="text-lg text-orange-600 bg-white p-3 rounded mt-1">
                    💡 {error.hint}
                  </p>
                </div>
              )}

              {error.details && (
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Backend Details:</p>
                  <pre className="bg-white p-4 rounded mt-1 overflow-auto text-sm border border-red-200">
                    {JSON.stringify(error.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-8">
          <h3 className="text-lg font-bold text-blue-900 mb-3">
            📋 What This Does:
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li>✓ Connects to backend at <code className="bg-white px-2 py-1 rounded">http://10.68.23.55:8000/test</code></li>
            <li>✓ Verifies backend is running and reachable</li>
            <li>✓ Tests environment configuration</li>
            <li>✓ Displays backend response for debugging</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
