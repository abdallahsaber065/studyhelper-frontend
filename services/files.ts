import apiClient from '@/lib/api-client';
import {
  FileRead,
  FileUploadResponse,
  FileListParams,
  FileShareRequest,
  UserFileAccessRead
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
  getFiles: async (params?: FileListParams): Promise<FileRead[]> => {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    const response = await apiClient.get(`/files/?${queryParams.toString()}`);
    return response.data;
  },

  // Get file by ID
  getFileById: async (fileId: number): Promise<FileRead> => {
    const response = await apiClient.get(`/files/${fileId}`);
    return response.data;
  },

  // Share file with user
  shareFile: async (fileId: number, shareData: FileShareRequest): Promise<UserFileAccessRead> => {
    // user_id is required, access_level is optional
    const payload: any = { user_id: shareData.user_id };
    if (shareData.access_level) payload.access_level = shareData.access_level;
    const response = await apiClient.post(`/files/${fileId}/share`, payload);
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
}; 