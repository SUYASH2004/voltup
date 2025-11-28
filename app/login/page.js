'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'SessionExpired') {
      setError('Your session has expired. Please login again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('[Login] Submitting credentials for:', email);
      
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      console.log('[Login] SignIn result:', result);

      if (result?.error) {
        const errorMessage = result.error === 'CredentialsSignin' 
          ? 'Invalid email or password' 
          : result.error;
        console.error('[Login] Auth error:', errorMessage);
        setError(errorMessage);
      } else if (result?.ok) {
        console.log('[Login] Login successful, waiting for session...');
        // Wait a moment for session to be established
        await new Promise(resolve => setTimeout(resolve, 500));
        const callbackUrl = searchParams.get('callbackUrl') || '/';
        console.log('[Login] Redirecting to:', callbackUrl);
        router.push(callbackUrl);
        router.refresh();
      } else {
        console.error('[Login] Unknown error:', result);
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      const errorMsg = 'An error occurred. Please try again.';
      setError(errorMsg);
      console.error('[Login] Exception:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 md:p-6 bg-gray-50">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
            <span className="text-white font-bold text-xl sm:text-2xl">D</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Draive</h1>
          <p className="text-gray-600 text-sm sm:text-base">Voltup Enterprise Dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 p-5 sm:p-6 md:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Welcome Back</h2>
          <p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6">Sign in to access your dashboard</p>

          {error && (
            <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs sm:text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                placeholder="your.email@voltup.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2 sm:mb-3">Demo Credentials:</p>
            <div className="space-y-1.5 sm:space-y-2 text-xs">
              <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-1 xs:gap-0 p-2 bg-gray-50 rounded">
                <span className="text-gray-700 font-medium">Regional Head (West):</span>
                <span className="text-gray-600 break-all xs:break-normal">regional.west@voltup.com</span>
              </div>
              <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-1 xs:gap-0 p-2 bg-gray-50 rounded">
                <span className="text-gray-700 font-medium">Circle Head:</span>
                <span className="text-gray-600 break-all xs:break-normal">circle.mumbai@voltup.com</span>
              </div>
              <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-1 xs:gap-0 p-2 bg-gray-50 rounded">
                <span className="text-gray-700 font-medium">Area Head:</span>
                <span className="text-gray-600 break-all xs:break-normal">area.andheri@voltup.com</span>
              </div>
              <p className="text-gray-500 mt-2">Password: password123</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs sm:text-sm text-gray-500 mt-4 sm:mt-6">
          © 2024 Draive. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600 text-sm sm:text-base">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
