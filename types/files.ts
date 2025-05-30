// File Types
export interface PhysicalFile {
  id: string;
  filename: string;
  original_filename: string;
  size_bytes: number;
  content_type: string;
  file_hash: string;
  upload_timestamp: string;
  uploader_id: string;
  uploader?: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
  };
}

export interface FileUploadRequest {
  file: File;
  description?: string;
}

export interface FileUploadResponse {
  id: string;
  filename: string;
  original_filename: string;
  size_bytes: number;
  content_type: string;
  message: string;
}

export interface FileShareRequest {
  user_id: string;
  access_level: 'read' | 'write';
}

export interface FileAccessInfo {
  user_id: string;
  access_level: 'read' | 'write';
  granted_at: string;
  granted_by: string;
  user?: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
  };
}

export interface FilesListResponse {
  files: PhysicalFile[];
  total: number;
  page: number;
  limit: number;
}

export interface FileListParams {
  skip?: number;
  limit?: number;
  search?: string;
  content_type?: string;
}

// File validation constants
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'text/plain', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc
] as const;

export const ALLOWED_FILE_EXTENSIONS = [
  '.pdf',
  '.txt',
  '.docx', 
  '.doc',
] as const;

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes

export type AllowedFileType = typeof ALLOWED_FILE_TYPES[number];
export type AllowedFileExtension = typeof ALLOWED_FILE_EXTENSIONS[number]; 