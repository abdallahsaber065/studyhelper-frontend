import { useAuthStore } from "@/store/authStore";
import type { ApiResponse, PaginatedResponse } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

class ApiClient {
  private baseURL: string;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getHeaders(): HeadersInit {
    const { token } = useAuthStore.getState();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
      console.log("🔑 Adding Authorization header with token:", token.substring(0, 20) + "...");
    } else {
      console.log("⚠️  No token available for request");
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401) {
      return this.handle401(response);
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Network error" }));
      throw new Error(error.detail || error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  private async handle401<T>(originalResponse: Response): Promise<T> {
    const { refreshToken, clearAuth, setTokens } = useAuthStore.getState();

    if (!refreshToken) {
      clearAuth();
      throw new Error("Authentication required");
    }

    if (this.isRefreshing) {
      // If already refreshing, queue this request
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      // Attempt to refresh the token
      const refreshResponse = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!refreshResponse.ok) {
        throw new Error("Failed to refresh token");
      }

      const tokenData = await refreshResponse.json();
      setTokens(tokenData.access_token, tokenData.refresh_token);

      // Retry all queued requests
      this.failedQueue.forEach(({ resolve }) => {
        resolve(this.retryOriginalRequest(originalResponse));
      });
      this.failedQueue = [];

      return this.retryOriginalRequest(originalResponse);
    } catch (error) {
      // Refresh failed, clear auth and reject all queued requests
      clearAuth();
      this.failedQueue.forEach(({ reject }) => {
        reject(error);
      });
      this.failedQueue = [];
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  private async retryOriginalRequest<T>(originalResponse: Response): Promise<T> {
    const url = originalResponse.url;
    const method = originalResponse.type || 'GET';

    // Recreate the original request with new token
    const response = await fetch(url, {
      method,
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  async upload<T>(endpoint: string, file: File): Promise<T> {
    const formData = new FormData();
    formData.append("file", file);

    const { token } = useAuthStore.getState();
    const headers: HeadersInit = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "POST",
      headers,
      body: formData,
    });

    return this.handleResponse<T>(response);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Generic API response helpers
export type { ApiResponse, PaginatedResponse };
