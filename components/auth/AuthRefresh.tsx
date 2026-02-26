'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

/**
 * This component should be included in layouts where authentication is required.
 * It handles token refresh when needed.
 */
export default function AuthRefresh() {
  const { refreshToken, isAuthenticated } = useAuth();

  useEffect(() => {
    // Only attempt to refresh if already authenticated
    if (isAuthenticated) {
      // Create a timer to refresh the token before it expires
      const refreshInterval = setInterval(() => {
        refreshToken();
      }, 15 * 60 * 1000); // Refresh every 15 minutes
      
      // Clean up the timer when the component unmounts
      return () => clearInterval(refreshInterval);
    }
  }, [refreshToken, isAuthenticated]);

  // This component doesn't render anything
  return null;
} 