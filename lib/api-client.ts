import axios from 'axios';
import { isAuthError } from '@/lib/error-handler';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      try {
        // Get token from localStorage - avoid using parsed state which might be outdated
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          const token = parsed?.state?.accessToken;
          
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log(`Adding token to ${config.url}`);
          } else {
            console.warn('No token found in auth storage');
          }
        }
      } catch (error) {
        console.error('Error accessing auth token:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Check if this is an authentication error using our error handler
    if (isAuthError(error)) {
      // Clear auth storage and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-storage');
        
        // Only redirect if we're not already on an auth page
        if (!window.location.pathname.startsWith('/auth/')) {
          window.location.href = '/auth/login';
        }
      }
    }

    // Log errors for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
      });
    }

    return Promise.reject(error);
  }
);

export default apiClient; 