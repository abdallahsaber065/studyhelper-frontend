import apiClient from '@/lib/api-client';
import { 
  PhysicalFile, 
  FileUploadResponse, 
  FilesListResponse, 
  FileListParams,
  FileShareRequest,
  FileAccessInfo 
} from '@/types/files';

export const filesService = {
  // Upload file
  uploadFile: async (file: File): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get user files
  getFiles: async (params?: FileListParams): Promise<FilesListResponse> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.skip) queryParams.append('skip', params.skip.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.content_type) queryParams.append('content_type', params.content_type);

      const url = `/files/?${queryParams.toString()}`;
      console.log('Fetching files from:', url);
      
      const response = await apiClient.get(url);
      
      console.log('Raw API response:', response);
      console.log('Response data:', response.data);
      
      // Ensure we return the expected format
      if (Array.isArray(response.data)) {
        // If API returns array directly, wrap it in expected format
        return {
          files: response.data,
          total: response.data.length,
          page: 1,
          limit: params?.limit || 20
        };
      } else if (response.data && typeof response.data === 'object') {
        // If API returns object, use it as-is but ensure required fields
        return {
          files: response.data.files || [],
          total: response.data.total || 0,
          page: response.data.page || 1,
          limit: response.data.limit || 20
        };
      } else {
        console.warn('Unexpected API response format:', response.data);
        return {
          files: [],
          total: 0,
          page: 1,
          limit: params?.limit || 20
        };
      }
    } catch (error: any) {
      console.error('Error fetching files:', error);
      console.log('API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000');
      
      // For network errors, provide additional debugging info
      if (error.message === 'Network Error' || !error.response) {
        console.log('This appears to be a network connectivity issue. Check that:');
        console.log('1. The backend server is running at', process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000');
        console.log('2. Your browser can access the API (no CORS issues)');
        console.log('3. You are authenticated (files endpoint requires auth)');
      }
      
      throw error;
    }
  },

  // Get file by ID
  getFileById: async (fileId: string): Promise<PhysicalFile> => {
    const response = await apiClient.get(`/files/${fileId}`);
    return response.data;
  },

  // Share file with user
  shareFile: async (fileId: string, shareData: FileShareRequest): Promise<void> => {
    const formData = new URLSearchParams();
    formData.append('user_id', shareData.user_id);
    formData.append('access_level', shareData.access_level);

    await apiClient.post(`/files/${fileId}/share`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },

  // Get file access list
  getFileAccess: async (fileId: string): Promise<FileAccessInfo[]> => {
    const response = await apiClient.get(`/files/${fileId}/access`);
    return response.data;
  },

  // Revoke file access
  revokeFileAccess: async (fileId: string, userId: string): Promise<void> => {
    await apiClient.delete(`/files/${fileId}/share/${userId}`);
  },
}; 