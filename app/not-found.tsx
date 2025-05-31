'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
        <div className="relative mb-8 mx-auto w-32 h-32 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <div className="text-6xl font-bold text-red-500 dark:text-red-400">404</div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Page Not Found
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved. 
          Please check the URL or navigate back to a known page.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="default" className="flex items-center justify-center">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="flex items-center justify-center">
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="mt-8 text-gray-500 dark:text-gray-400 text-sm">
        <p>Looking for something specific? Try using the search function in the dashboard.</p>
      </div>
    </div>
  );
} 