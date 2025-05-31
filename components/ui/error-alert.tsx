'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ErrorAlertProps {
  error: any;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function ErrorAlert({ error, dismissible = false, onDismiss }: ErrorAlertProps) {
  const errorMessage = getErrorMessage(error);
  
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-md relative">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium">Error</p>
          <p className="text-sm">{errorMessage}</p>
        </div>
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-4 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 focus:outline-none"
            aria-label="Dismiss"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

function getErrorMessage(error: any): string {
  if (!error) {
    return 'An unknown error occurred';
  }
  
  // Handle error strings
  if (typeof error === 'string') {
    return error;
  }
  
  // Handle error objects
  if (error.message) {
    return error.message;
  }
  
  // Handle Axios error responses
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  // Handle object with error details
  if (error.detail) {
    return error.detail;
  }
  
  // Fallback for other error types
  return 'An unexpected error occurred';
} 