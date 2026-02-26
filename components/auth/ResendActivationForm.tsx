'use client';

import { useState } from 'react';
import { authService } from '@/services/auth';
import Link from 'next/link';

export default function ResendActivationForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authService.resendActivationEmail(email);
      setSuccess(response.message || 'Activation email has been sent. Please check your inbox.');
    } catch (error: any) {
      setError(
        error.response?.data?.detail || 
        'Failed to send activation email. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Resend Activation Email</h2>
      
      {success ? (
        <div className="mb-6">
          <div className="bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 p-4 rounded-md">
            {success}
          </div>
          <div className="mt-4 text-center">
            <Link 
              href="/auth/login" 
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </div>
      ) : (
        <>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
            Enter your email address and we'll send you a new activation link.
          </p>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4 rounded-md mb-6">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Resend Activation Email'}
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <Link 
              href="/auth/login" 
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </>
      )}
    </div>
  );
} 