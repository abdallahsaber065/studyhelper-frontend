import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { authService } from '@/services/auth';
import { LoginRequest, UserCreate, UserUpdate } from '@/types/auth';
import { getErrorMessage, isAuthError } from '@/lib/error-handler';

export function useAuth(redirectTo?: string) {
  const router = useRouter();
  const {
    user,
    accessToken,
    isLoading,
    isAuthenticated,
    setAuth,
    setUser,
    logout: storeLogout,
    setLoading,
    initializeAuth,
  } = useAuthStore();

  // Sync auth state from localStorage on mount
  useEffect(() => {
    try {
      // Initialize auth state from Zustand store
      initializeAuth();
      
      // Double-check localStorage in case Zustand's state is stale
      if (typeof window !== 'undefined') {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          if (parsed?.state?.accessToken && parsed?.state?.user) {
            setAuth(parsed.state.user, parsed.state.accessToken);
          }
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    }
  }, [initializeAuth, setAuth]);

  // Redirect if needed
  useEffect(() => {
    if (!isLoading && !isAuthenticated && redirectTo) {
      router.push(redirectTo);
    }
  }, [isLoading, isAuthenticated, redirectTo, router]);

  // Handle storing auth data consistently
  const storeAuthData = useCallback((user: any, token: string) => {
    // Update Zustand store
    setAuth(user, token);
    
    // Also update localStorage directly
    try {
      const authData = {
        state: {
          user,
          accessToken: token,
          isAuthenticated: true,
          isLoading: false
        }
      };
      localStorage.setItem('auth-storage', JSON.stringify(authData));
    } catch (err) {
      console.error('Error storing auth data:', err);
    }
  }, [setAuth]);

  const login = async (credentials: LoginRequest) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      
      // Store auth data
      storeAuthData(response.user, response.access_token);
      
      return { 
        success: true, 
        user: response.user, 
        access_token: response.access_token 
      };
    } catch (error: any) {
      console.error('Login error:', error);
      // Throw the error instead of returning an error object
      // This will be caught by the LoginForm
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: UserCreate) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      storeAuthData(response.user, response.access_token);
      return { success: true, user: response.user };
    } catch (error: any) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: getErrorMessage(error),
        rawError: error,
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      storeLogout();
      // Also clear localStorage directly
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-storage');
      }
      router.push('/');
    }
  };

  const updateProfile = async (userData: UserUpdate) => {
    try {
      setLoading(true);
      const updatedUser = await authService.updateCurrentUser(userData);
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error: any) {
      console.error('Profile update error:', error);
      return {
        success: false,
        error: getErrorMessage(error),
        rawError: error,
      };
    } finally {
      setLoading(false);
    }
  };

  const refreshUserInfo = async () => {
    try {
      if (!isAuthenticated) return;
      const user = await authService.getCurrentUser();
      setUser(user);
      return user;
    } catch (error) {
      console.error('Refresh user info error:', error);
      // If token is invalid, logout
      if (isAuthError(error)) {
        storeLogout();
        router.push('/auth/login');
      }
    }
  };

  const refreshToken = async () => {
    try {
      if (!isAuthenticated) return false;
      const response = await authService.refreshToken();
      storeAuthData(user, response.access_token);
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      if (isAuthError(error)) {
        storeLogout();
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-storage');
        }
        router.push('/auth/login');
      }
      return false;
    }
  };

  return {
    user,
    accessToken,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    refreshUserInfo,
    refreshToken,
  };
}

// Hook for protected routes
export function useProtectedRoute() {
  return useAuth('/auth/login');
} 