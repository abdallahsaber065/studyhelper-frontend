// File Types (Synced with backend OpenAPI)

export interface FileRead {
  id: number;
  file_name: string; // original file name
  file_type: string; // extension (e.g., pdf, txt)
  mime_type: string;
  file_hash: string;
  file_size_bytes: number;
  uploaded_at: string; // ISO date-time
  user_id: number;
  shared_count?: number; // Number of users the file is shared with
  is_owner?: boolean; // Whether the current user is the owner
  owner_name?: string; // Name of the file owner
}

export interface FileUploadResponse {
  message: string;
  file: FileRead;
}

export interface FileListParams {
  skip?: number;
  limit?: number;
  search?: string;
}

export interface UserFileAccessRead {
  user_id: number;
  physical_file_id: number;
  access_level: 'read' | 'write' | 'admin';
  granted_at: string;
  granted_by_user_id?: number | null;
}

export interface FileShareRequest {
  user_id: number;
  access_level?: 'read' | 'write' | 'admin';
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