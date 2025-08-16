import { apiClient } from '@/api/client';
import { useAuthStore } from '@/store/authStore';

// API response types
export interface FileUploadResponse {
  id: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  message: string;
}

export interface FileMetadata {
  id: string;
  user_id: number;
  original_filename: string;
  stored_filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  file_hash: string;
  description: string | null;
  is_processed: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface FileListResponse {
  files: FileMetadata[];
  total_count: number;
  total_size: number;
  page: number;
  per_page: number;
  has_next: boolean;
}

export interface FileUpdateRequest {
  description: string;
}

export interface FileDeleteResponse {
  message: string;
  deleted_file_id: string;
}

// File service functions
export const fileService = {
  // Upload a file
  async uploadFile(file: File, description?: string): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }

    const { token } = useAuthStore.getState();
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/files/upload`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Upload failed" }));
      throw new Error(error.detail || error.message || `Upload failed: ${response.statusText}`);
    }

    return response.json();
  },

  // Get list of files
  async getFiles(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    mime_type?: string;
  }): Promise<FileListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.mime_type) searchParams.set('mime_type', params.mime_type);

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/files/?${queryString}` : '/files/';
    
    return apiClient.get<FileListResponse>(endpoint);
  },

  // Get file metadata
  async getFileMetadata(fileId: string): Promise<FileMetadata> {
    return apiClient.get<FileMetadata>(`/files/${fileId}`);
  },

  // Download a file
  async downloadFile(fileId: string): Promise<Blob> {
    const { token } = useAuthStore.getState();
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/files/${fileId}/download`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const error = await response.text().catch(() => "Download failed");
      throw new Error(`Download failed: ${error}`);
    }

    return response.blob();
  },

  // Update file metadata
  async updateFile(fileId: string, data: FileUpdateRequest): Promise<FileMetadata> {
    return apiClient.put<FileMetadata>(`/files/${fileId}`, data);
  },

  // Delete a file
  async deleteFile(fileId: string): Promise<FileDeleteResponse> {
    return apiClient.delete<FileDeleteResponse>(`/files/${fileId}`);
  },

  // Delete all files
  async deleteAllFiles(): Promise<{message: string; deleted_count: number}> {
    return apiClient.delete('/files/?confirm=true');
  }
};

// Utility functions
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const getMimeTypeIcon = (mimeType: string): string => {
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('text')) return '📝';
  if (mimeType.includes('markdown')) return '📋';
  return '📄';
};

export const getFileTypeLabel = (mimeType: string): string => {
  switch (mimeType) {
    case 'application/pdf':
      return 'PDF';
    case 'text/plain':
      return 'Text';
    case 'text/markdown':
      return 'Markdown';
    default:
      return 'Document';
  }
};
