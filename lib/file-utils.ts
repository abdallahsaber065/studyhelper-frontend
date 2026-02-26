import { 
  ALLOWED_FILE_TYPES, 
  ALLOWED_FILE_EXTENSIONS, 
  MAX_FILE_SIZE,
  AllowedFileType 
} from '@/types/files';

/**
 * Validates if a file is allowed based on type and size
 */
export function validateFile(file: File): { isValid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size must be less than ${formatFileSize(MAX_FILE_SIZE)}`
    };
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type as AllowedFileType)) {
    return {
      isValid: false,
      error: `File type not supported. Allowed types: ${ALLOWED_FILE_EXTENSIONS.join(', ')}`
    };
  }

  // Check file extension as backup
  const extension = getFileExtension(file.name);
  if (!ALLOWED_FILE_EXTENSIONS.includes(extension as any)) {
    return {
      isValid: false,
      error: `File extension not supported. Allowed extensions: ${ALLOWED_FILE_EXTENSIONS.join(', ')}`
    };
  }

  return { isValid: true };
}

/**
 * Formats file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Gets file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.slice(filename.lastIndexOf('.')).toLowerCase();
}

/**
 * Gets file type icon based on content type or extension
 */
export function getFileTypeIcon(contentType: string): string {
  if (contentType.includes('pdf')) return '📄';
  if (contentType.includes('text')) return '📝';
  if (contentType.includes('word') || contentType.includes('document')) return '📘';
  return '📄'; // Default
}

/**
 * Gets human readable file type name
 */
export function getFileTypeName(contentType: string): string {
  const typeMap: Record<string, string> = {
    'application/pdf': 'PDF Document',
    'text/plain': 'Text File',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
    'application/msword': 'Word Document',
  };
  
  return typeMap[contentType] || 'Document';
}

/**
 * Formats date for file timestamps
 */
export function formatFileDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
  
  return date.toLocaleDateString();
}

/**
 * Truncates filename for display
 */
export function truncateFilename(filename: string, maxLength: number = 30): string {
  if (filename.length <= maxLength) return filename;
  
  const extension = getFileExtension(filename);
  const nameWithoutExt = filename.slice(0, filename.lastIndexOf('.'));
  const truncatedName = nameWithoutExt.slice(0, maxLength - extension.length - 3);
  
  return `${truncatedName}...${extension}`;
}

/**
 * Creates a file drag and drop validator
 */
export function createFileDropValidator() {
  return (files: FileList | File[]): { validFiles: File[]; errors: string[] } => {
    const validFiles: File[] = [];
    const errors: string[] = [];
    
    Array.from(files).forEach(file => {
      const validation = validateFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });
    
    return { validFiles, errors };
  };
} 