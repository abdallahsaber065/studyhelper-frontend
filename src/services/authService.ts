import { apiClient } from "@/api/client";
import type { TokenResponse, LoginCredentials, RegisterCredentials, User } from "@/types";

export const authService = {
  async login(credentials: LoginCredentials): Promise<TokenResponse> {
    // Convert to form data for OAuth2 token endpoint
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Login failed" }));
      throw new Error(error.detail || "Login failed");
    }

    return response.json();
  },

  async register(credentials: RegisterCredentials): Promise<User> {
    return apiClient.post<User>("/auth/register", credentials);
  },

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>("/users/me");
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      // Continue with logout even if API call fails
      console.error("Logout API call failed:", error);
    }
    return Promise.resolve();
  },

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Token refresh failed" }));
      throw new Error(error.detail || "Token refresh failed");
    }

    return response.json();
  },

  async requestPasswordReset(email: string): Promise<void> {
    return apiClient.post("/auth/forgot-password", { email });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    return apiClient.post(`/auth/reset-password/${token}`, {
      token,
      new_password: password
    });
  },

  async verifyEmail(token: string): Promise<void> {
    return apiClient.post(`/auth/verify-email/${token}`);
  },

  async resendVerificationEmail(email: string): Promise<void> {
    return apiClient.post(`/auth/resend-verification?email=${email}`);
  },
};
