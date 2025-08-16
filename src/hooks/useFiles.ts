import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fileService, FileListResponse, FileMetadata, FileUploadResponse } from '@/services/fileService';
import { toast } from '@/hooks/useToast';

// Query keys
export const fileQueryKeys = {
  all: ['files'] as const,
  lists: () => [...fileQueryKeys.all, 'list'] as const,
  list: (params: any) => [...fileQueryKeys.lists(), params] as const,
  details: () => [...fileQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...fileQueryKeys.details(), id] as const,
};

// Hook for getting file list with filters
export const useFiles = (params?: {
  page?: number;
  per_page?: number;
  search?: string;
  mime_type?: string;
}) => {
  return useQuery({
    queryKey: fileQueryKeys.list(params),
    queryFn: () => fileService.getFiles(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
  });
};

// Hook for getting file metadata
export const useFileMetadata = (fileId: string) => {
  return useQuery({
    queryKey: fileQueryKeys.detail(fileId),
    queryFn: () => fileService.getFileMetadata(fileId),
    enabled: !!fileId,
  });
};

// Hook for uploading files
export const useUploadFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, description }: { file: File; description?: string }) =>
      fileService.uploadFile(file, description),
    onSuccess: (data: FileUploadResponse) => {
      // Invalidate and refetch file list
      queryClient.invalidateQueries({ queryKey: fileQueryKeys.lists() });
      toast({
        title: "File uploaded successfully",
        description: `${data.original_filename} has been uploaded.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook for downloading files
export const useDownloadFile = () => {
  return useMutation({
    mutationFn: fileService.downloadFile,
    onSuccess: (blob: Blob, fileId: string) => {
      // The actual download is handled by the component
      toast({
        title: "Download started",
        description: "Your file download has started.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Download failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook for updating file metadata
export const useUpdateFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fileId, data }: { fileId: string; data: { description: string } }) =>
      fileService.updateFile(fileId, data),
    onSuccess: (data: FileMetadata, variables) => {
      // Update cached file data
      queryClient.setQueryData(
        fileQueryKeys.detail(variables.fileId),
        data
      );
      // Invalidate file lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: fileQueryKeys.lists() });
      toast({
        title: "File updated successfully",
        description: "File description has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook for deleting a file
export const useDeleteFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fileService.deleteFile,
    onSuccess: (data, fileId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: fileQueryKeys.detail(fileId) });
      // Invalidate file lists
      queryClient.invalidateQueries({ queryKey: fileQueryKeys.lists() });
      toast({
        title: "File deleted successfully",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook for deleting all files
export const useDeleteAllFiles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fileService.deleteAllFiles,
    onSuccess: (data) => {
      // Clear all file caches
      queryClient.removeQueries({ queryKey: fileQueryKeys.all });
      toast({
        title: "All files deleted",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Bulk delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
