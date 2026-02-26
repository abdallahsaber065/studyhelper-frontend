import apiClient from './api-client';

export async function checkApiHealth(): Promise<{ status: string; message: string }> {
  try {
    const response = await apiClient.get('/health');
    return {
      status: 'success',
      message: 'API is reachable',
    };
  } catch (error) {
    console.error('API health check failed:', error);
    return {
      status: 'error',
      message: 'Unable to connect to API',
    };
  }
} 