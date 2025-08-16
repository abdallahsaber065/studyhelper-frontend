import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, File, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUploadFile } from '@/hooks/useFiles';
import { formatFileSize } from '@/services/fileService';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FileWithMetadata extends File {
  id: string;
  preview?: string;
}

const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  'text/markdown': ['.md', '.markdown'],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const FileUploadModal: React.FC<FileUploadModalProps> = ({ isOpen, onClose }) => {
  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [description, setDescription] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadFile = useUploadFile();

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than ${formatFileSize(MAX_FILE_SIZE)}`;
    }

    // Check file type
    const isAccepted = Object.keys(ACCEPTED_FILE_TYPES).some(mimeType => {
      return file.type === mimeType || 
             ACCEPTED_FILE_TYPES[mimeType as keyof typeof ACCEPTED_FILE_TYPES].some(ext => 
               file.name.toLowerCase().endsWith(ext)
             );
    });

    if (!isAccepted) {
      return 'Only PDF, TXT, and Markdown files are supported';
    }

    return null;
  }, []);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const validFiles: FileWithMetadata[] = [];
    const errors: string[] = [];

    Array.from(newFiles).forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        const fileWithId = Object.assign(file, {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        }) as FileWithMetadata;
        validFiles.push(fileWithId);
      }
    });

    if (errors.length > 0) {
      // You might want to show these errors to the user
      console.error('File validation errors:', errors);
    }

    setFiles(prev => [...prev, ...validFiles]);
  }, [validateFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
    }
  }, [addFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      addFiles(selectedFiles);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [addFiles]);

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const handleUpload = useCallback(async () => {
    if (files.length === 0) return;

    // For now, upload one file at a time
    // TODO: Implement batch upload
    const file = files[0];
    
    try {
      await uploadFile.mutateAsync({ 
        file, 
        description: description.trim() || undefined 
      });
      
      // Reset form and close modal
      setFiles([]);
      setDescription('');
      onClose();
    } catch (error) {
      // Error is handled by the hook
      console.error('Upload failed:', error);
    }
  }, [files, description, uploadFile, onClose]);

  const handleClose = useCallback(() => {
    setFiles([]);
    setDescription('');
    setIsDragOver(false);
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  const acceptedExtensions = Object.values(ACCEPTED_FILE_TYPES).flat().join(', ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">Upload Files</h2>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Drop zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragOver
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {isDragOver ? 'Drop files here' : 'Drop files here or click to browse'}
              </p>
              <p className="text-xs text-muted-foreground">
                Supported formats: {acceptedExtensions}
              </p>
              <p className="text-xs text-muted-foreground">
                Maximum file size: {formatFileSize(MAX_FILE_SIZE)}
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={Object.keys(ACCEPTED_FILE_TYPES).join(',')}
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Files</Label>
              {files.map(file => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add a description for your file..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Upload info */}
          {files.length > 1 && (
            <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Multiple files selected</p>
                <p>Files will be uploaded one at a time. The description will be applied to all files.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-muted/20">
          <p className="text-xs text-muted-foreground">
            {files.length} file{files.length !== 1 ? 's' : ''} selected
          </p>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={files.length === 0 || uploadFile.isPending}
            >
              {uploadFile.isPending ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
