'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/store/auth';
import Link from 'next/link';

export default function AccountActivation() {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  
  useEffect(() => {
    // Get token from URL query parameter
    const tokenFromQuery = searchParams?.get('token');
    if (tokenFromQuery) {
      setToken(tokenFromQuery);
      // Automatically activate account when token is available
      activateAccount(tokenFromQuery);
    }
  }, [searchParams]);

  const activateAccount = async (activationToken: string) => {
    if (!activationToken) {
      setError('Activation token is missing');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.activateAccount({ token: activationToken });
      setSuccess(response.message || 'Your account has been activated successfully');
      
      // Auto login after successful activation (optional)
      if (response.user) {
        // Wait 2 seconds to show the success message before redirecting
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      }
    } catch (error: any) {
      setError(
        error.response?.data?.detail || 
        'Failed to activate account. The token may be invalid or expired.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Account Activation</h2>
      
      {isLoading && (
        <div className="text-center mb-6">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Activating your account...</p>
        </div>
      )}
      
      {error && (
        <div className="mb-6">
          <div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4 rounded-md">
            {error}
          </div>
          <div className="mt-4 text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              The activation link may have expired or is invalid.
            </p>
            <Link 
              href="/auth/login" 
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </div>
      )}
      
      {success && (
        <div className="mb-6">
          <div className="bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 p-4 rounded-md">
            {success}
          </div>
          <div className="mt-4 text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              Redirecting you to login page...
            </p>
            <Link 
              href="/auth/login" 
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Go to Login
            </Link>
          </div>
        </div>
      )}
      
      {!token && !isLoading && !error && !success && (
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            No activation token found. Please use the link from your email.
          </p>
          <Link 
            href="/auth/login" 
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Back to Login
          </Link>
        </div>
      )}
    </div>
  );
} 