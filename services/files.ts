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
    const queryParams = new URLSearchParams();
    
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.content_type) queryParams.append('content_type', params.content_type);

    const response = await apiClient.get(`/files/?${queryParams.toString()}`);
    return response.data;
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