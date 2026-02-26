import apiClient from '@/lib/api-client';
import { LoginRequest, UserCreate, UserUpdate, AuthResponse, User, PasswordResetRequest, PasswordResetConfirm, ActivationRequest } from '@/types/auth';

export const authService = {
  // Login user
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  // Register new user
  register: async (userData: UserCreate): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  // Logout user
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  // Get current user info
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // Update current user
  updateCurrentUser: async (userData: UserUpdate): Promise<User> => {
    const response = await apiClient.put('/auth/me', userData);
    return response.data;
  },

  // Refresh token
  refreshToken: async (): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/refresh');
    return response.data;
  },
  
  // Request password reset
  requestPasswordReset: async (data: PasswordResetRequest): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/password-reset', data);
    return response.data;
  },
  
  // Confirm password reset
  confirmPasswordReset: async (data: PasswordResetConfirm): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/password-reset/confirm', data);
    return response.data;
  },
  
  // Activate account
  activateAccount: async (data: ActivationRequest): Promise<{ message: string; user: User }> => {
    const response = await apiClient.post('/auth/activate', data);
    return response.data;
  },
  
  // Resend activation email
  resendActivationEmail: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/resend-activation', { email });
    return response.data;
  }
}; 