import apiClient from '@/lib/api-client';

export interface ApiKeyCreate {
  provider_name: string;
  api_key: string;
  is_active?: boolean;
}

export interface ApiKeyRead {
  id: number;
  provider_name: string;
  is_active: boolean;
  user_id: number;
  created_at: string;
  updated_at: string;
  last_used_at: string | null;
}

export interface ApiKeyList {
  items: ApiKeyRead[];
  total: number;
}

export interface ApiKeyTest {
  api_key: string;
  provider_name: string;
}

export interface ApiKeyTestResponse {
  is_valid: boolean;
  message: string;
}

export const apiKeysService = {
  // List all API keys
  listApiKeys: async (provider?: string, isActive?: boolean): Promise<ApiKeyList> => {
    const params = new URLSearchParams();
    if (provider) params.append('provider', provider);
    if (isActive !== undefined) params.append('is_active', String(isActive));
    
    const response = await apiClient.get('/api-keys', { params });
    return response.data;
  },

  // Create a new API key
  createApiKey: async (data: ApiKeyCreate): Promise<ApiKeyRead> => {
    const response = await apiClient.post('/api-keys', data);
    return response.data;
  },

  // Get API key by ID
  getApiKey: async (apiKeyId: number): Promise<ApiKeyRead> => {
    const response = await apiClient.get(`/api-keys/${apiKeyId}`);
    return response.data;
  },

  // Update API key
  updateApiKey: async (apiKeyId: number, data: Partial<ApiKeyCreate>): Promise<ApiKeyRead> => {
    const response = await apiClient.put(`/api-keys/${apiKeyId}`, data);
    return response.data;
  },

  // Delete API key
  deleteApiKey: async (apiKeyId: number): Promise<void> => {
    await apiClient.delete(`/api-keys/${apiKeyId}`);
  },

  // Test API key
  testApiKey: async (data: ApiKeyTest): Promise<ApiKeyTestResponse> => {
    const response = await apiClient.post('/api-keys/test', data);
    return response.data;
  }
}; 