import React, { useState } from 'react';
import { FileText, Download, Edit3, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useFiles, useDownloadFile, useDeleteFile, useUpdateFile } from '@/hooks/useFiles';
import { FileMetadata, formatFileSize, getMimeTypeIcon, getFileTypeLabel } from '@/services/fileService';

interface FileTableProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const FileTable: React.FC<FileTableProps> = ({ searchQuery, onSearchChange }) => {
  const [page, setPage] = useState(1);
  const [editingFile, setEditingFile] = useState<FileMetadata | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [deleteFile, setDeleteFile] = useState<FileMetadata | null>(null);

  const { data: filesData, isLoading, error } = useFiles({
    page,
    per_page: 20,
    search: searchQuery || undefined,
  });

  const downloadFile = useDownloadFile();
  const deleteFileMutation = useDeleteFile();
  const updateFile = useUpdateFile();

  const handleDownload = async (file: FileMetadata) => {
    try {
      const blob = await downloadFile.mutateAsync(file.id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.original_filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleEditDescription = (file: FileMetadata) => {
    setEditingFile(file);
    setEditDescription(file.description || '');
  };

  const handleSaveDescription = async () => {
    if (!editingFile) return;

    try {
      await updateFile.mutateAsync({
        fileId: editingFile.id,
        data: { description: editDescription }
      });
      setEditingFile(null);
      setEditDescription('');
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteFile) return;

    try {
      await deleteFileMutation.mutateAsync(deleteFile.id);
      setDeleteFile(null);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (error) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">Failed to load files. Please try again.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card">
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-muted rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-3 bg-muted rounded w-1/4"></div>
                </div>
                <div className="w-20 h-4 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!filesData?.files?.length) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No files found</h3>
        <p className="text-muted-foreground mb-4">
          {searchQuery ? 'No files match your search criteria.' : 'Upload your first file to get started.'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-card overflow-hidden">
        {/* Table Header */}
        <div className="border-b bg-muted/20 px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
            <div className="md:col-span-5">Name</div>
            <div className="md:col-span-2">Type</div>
            <div className="md:col-span-2">Size</div>
            <div className="md:col-span-2">Uploaded</div>
            <div className="md:col-span-1">Actions</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y">
          {filesData.files.map((file) => (
            <div key={file.id} className="px-6 py-4 hover:bg-muted/20 transition-colors">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Name & Description */}
                <div className="md:col-span-5">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getMimeTypeIcon(file.mime_type)}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate" title={file.original_filename}>
                        {file.original_filename}
                      </p>
                      {file.description && (
                        <p className="text-xs text-muted-foreground truncate" title={file.description}>
                          {file.description}
                        </p>
                      )}
                      {file.is_processed && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          Processed
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Type */}
                <div className="md:col-span-2">
                  <Badge variant="outline" className="text-xs">
                    {getFileTypeLabel(file.mime_type)}
                  </Badge>
                </div>

                {/* Size */}
                <div className="md:col-span-2">
                  <span className="text-sm text-muted-foreground">
                    {formatFileSize(file.file_size)}
                  </span>
                </div>

                {/* Upload Date */}
                <div className="md:col-span-2">
                  <span className="text-sm text-muted-foreground">
                    {formatDate(file.created_at)}
                  </span>
                </div>

                {/* Actions */}
                <div className="md:col-span-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDownload(file)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditDescription(file)}>
                        <Edit3 className="mr-2 h-4 w-4" />
                        Edit Description
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => setDeleteFile(file)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {filesData.has_next && (
          <div className="border-t px-6 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filesData.files.length} of {filesData.total_count} files
              </p>
              <Button
                variant="outline"
                onClick={() => setPage(prev => prev + 1)}
                disabled={!filesData.has_next}
              >
                Load More
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Description Dialog */}
      {editingFile && (
        <AlertDialog open={true} onOpenChange={() => setEditingFile(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Edit File Description</AlertDialogTitle>
              <AlertDialogDescription>
                Update the description for "{editingFile.original_filename}"
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Input
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Enter file description..."
                autoFocus
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSaveDescription}>
                Save Changes
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteFile && (
        <AlertDialog open={true} onOpenChange={() => setDeleteFile(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete File</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deleteFile.original_filename}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete File
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
};
