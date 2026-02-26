import apiClient from '@/lib/api-client';
import {
  FileRead,
  FileUploadResponse,
  FileListParams,
  FileShareRequest,
  UserFileAccessRead
} from '@/types/files';
import { useAuthStore } from '@/store/auth';

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
  getFiles: async (params?: FileListParams): Promise<FileRead[]> => {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    const response = await apiClient.get(`/files/?${queryParams.toString()}`);
    
    // Enrich files with ownership info
    const { user } = useAuthStore.getState();
    const currentUserId = user?.id ? parseInt(user.id) : null;
    
    return response.data.map((file: FileRead) => ({
      ...file,
      is_owner: file.user_id === currentUserId,
      // For non-owners, we could fetch user info here or just use the ID
      owner_name: file.user_id === currentUserId ? 'You' : `User ${file.user_id}`
    }));
  },

  // Get file by ID
  getFileById: async (fileId: number): Promise<FileRead> => {
    const response = await apiClient.get(`/files/${fileId}`);
    
    // Enrich file with ownership info
    const { user } = useAuthStore.getState();
    const currentUserId = user?.id ? parseInt(user.id) : null;
    
    return {
      ...response.data,
      is_owner: response.data.user_id === currentUserId,
      owner_name: response.data.user_id === currentUserId ? 'You' : `User ${response.data.user_id}`
    };
  },

  // Share file with user
  shareFile: async (fileId: number, shareData: FileShareRequest): Promise<UserFileAccessRead> => {
    // Create form data using URLSearchParams for x-www-form-urlencoded format
    const formData = new URLSearchParams();
    formData.append('user_id', shareData.user_id.toString());
    if (shareData.access_level) {
      formData.append('access_level', shareData.access_level);
    }
    
    const response = await apiClient.post(`/files/${fileId}/share`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  // Get file access list
  getFileAccess: async (fileId: number): Promise<UserFileAccessRead[]> => {
    const response = await apiClient.get(`/files/${fileId}/access`);
    return response.data;
  },

  // Revoke file access
  revokeFileAccess: async (fileId: number, userId: number): Promise<void> => {
    await apiClient.delete(`/files/${fileId}/share/${userId}`);
  },

  // Get file analytics
  getFileAnalytics: async (fileId: number) => {
    const response = await apiClient.get(`/analytics/content/file/${fileId}`);
    return response.data;
  },
  
  // Increment file view count
  incrementFileView: async (fileId: number) => {
    const response = await apiClient.post(`/analytics/view/file/${fileId}`);
    return response.data;
  },
  
  // Get file engagement data
  getFileEngagement: async (fileId: number) => {
    const response = await apiClient.get(`/analytics/content/file/${fileId}/engagement`);
    return response.data;
  }
}; 