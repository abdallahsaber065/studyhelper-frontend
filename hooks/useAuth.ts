import { useEffect } from 'react';
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

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && redirectTo) {
      router.push(redirectTo);
    }
  }, [isLoading, isAuthenticated, redirectTo, router]);

  const login = async (credentials: LoginRequest) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      setAuth(response.user, response.access_token);
      return { success: true, user: response.user };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        error: getErrorMessage(error),
        rawError: error, // Include raw error for components that need it
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: UserCreate) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      setAuth(response.user, response.access_token);
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
  };
}

// Hook for protected routes
export function useProtectedRoute() {
  return useAuth('/auth/login');
} 