'use client';

import React from 'react';
import { AlertTriangle, X, CheckCircle, Info } from 'lucide-react';

interface ErrorAlertProps {
  error?: any;
  message?: string;
  variant?: 'error' | 'success' | 'info';
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function ErrorAlert({ 
  error, 
  message,
  variant = 'error',
  dismissible = false, 
  onDismiss 
}: ErrorAlertProps) {
  // Determine the message content
  const displayMessage = message || getErrorMessage(error);
  
  // Determine styles based on variant
  const styles = {
    error: {
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-200 dark:border-red-800",
      text: "text-red-800 dark:text-red-200",
      iconColor: "text-red-500 dark:text-red-400",
      buttonColor: "text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300",
      title: "Error"
    },
    success: {
      bg: "bg-green-50 dark:bg-green-900/20",
      border: "border-green-200 dark:border-green-800",
      text: "text-green-800 dark:text-green-200",
      iconColor: "text-green-500 dark:text-green-400",
      buttonColor: "text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300",
      title: "Success"
    },
    info: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-200 dark:border-blue-800",
      text: "text-blue-800 dark:text-blue-200", 
      iconColor: "text-blue-500 dark:text-blue-400",
      buttonColor: "text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300",
      title: "Info"
    }
  };
  
  const currentStyle = styles[variant];
  
  // Determine icon based on variant
  const icons = {
    error: <AlertTriangle className={`h-5 w-5 mr-2 flex-shrink-0 mt-0.5 ${currentStyle.iconColor}`} />,
    success: <CheckCircle className={`h-5 w-5 mr-2 flex-shrink-0 mt-0.5 ${currentStyle.iconColor}`} />,
    info: <Info className={`h-5 w-5 mr-2 flex-shrink-0 mt-0.5 ${currentStyle.iconColor}`} />
  };
  
  return (
    <div className={`${currentStyle.bg} border ${currentStyle.border} ${currentStyle.text} px-4 py-3 rounded-md relative`}>
      <div className="flex items-start">
        {icons[variant]}
        <div className="flex-1">
          <p className="font-medium">{currentStyle.title}</p>
          <p className="text-sm">{displayMessage}</p>
        </div>
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className={`ml-4 ${currentStyle.buttonColor} focus:outline-none`}
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
  
  // Handle error objects with message property
  if (error.message) {
    return error.message;
  }
  
  // Handle API error format
  if (error.response?.data?.error?.message) {
    return error.response.data.error.message;
  }
  
  // Handle Axios error responses in legacy format
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  
  // Handle nested error in response
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