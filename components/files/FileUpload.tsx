'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ErrorAlert } from '@/components/ui/error-alert';
import { filesService } from '@/services/files';
import { validateFile, formatFileSize, createFileDropValidator } from '@/lib/file-utils';
import { MAX_FILE_SIZE, ALLOWED_FILE_EXTENSIONS } from '@/types/files';
import { 
  Upload, 
  X, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Loader2,
  CloudUpload 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onUploadSuccess?: (files: any[]) => void;
  onUploadError?: (error: any) => void;
  multiple?: boolean;
  className?: string;
}

interface UploadingFile {
  file: File;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  result?: any;
}

export default function FileUpload({ 
  onUploadSuccess, 
  onUploadError, 
  multiple = true,
  className 
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [error, setError] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropValidator = createFileDropValidator();

  const uploadFile = async (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      // Simulate upload progress for better UX
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress > 90) {
          clearInterval(progressInterval);
        }
        setUploadingFiles(prev => 
          prev.map(f => f.file === file ? { ...f, progress: Math.min(progress, 90) } : f)
        );
      }, 200);

      filesService.uploadFile(file)
        .then(result => {
          clearInterval(progressInterval);
          setUploadingFiles(prev => 
            prev.map(f => f.file === file ? { 
              ...f, 
              status: 'success', 
              progress: 100, 
              result 
            } : f)
          );
          // Add a slight delay before removing the file from the list
          setTimeout(() => {
            setUploadingFiles(prev => 
              prev.filter(f => f.file !== file)
            );
          }, 1500);
          resolve(result);
        })
        .catch(error => {
          clearInterval(progressInterval);
          setUploadingFiles(prev => 
            prev.map(f => f.file === file ? { 
              ...f, 
              status: 'error', 
              progress: 0,
              error: error.message || 'Upload failed'
            } : f)
          );
          reject(error);
        });
    });
  };

  const handleFiles = useCallback(async (files: File[]) => {
    setError(null);
    
    const { validFiles, errors } = dropValidator(files);
    
    if (errors.length > 0) {
      setError({ message: errors.join('; ') });
      return;
    }

    if (!multiple && validFiles.length > 1) {
      setError({ message: 'Only one file can be uploaded at a time' });
      return;
    }

    // Add files to uploading state
    const newUploadingFiles: UploadingFile[] = validFiles.map(file => ({
      file,
      status: 'uploading' as const,
      progress: 0,
    }));

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    try {
      // Upload files
      const results = await Promise.allSettled(
        validFiles.map(file => uploadFile(file))
      );

      const successfulUploads = results
        .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
        .map(result => result.value);

      if (successfulUploads.length > 0) {
        onUploadSuccess?.(successfulUploads);
      }

      const failedUploads = results.filter(result => result.status === 'rejected');
      if (failedUploads.length > 0) {
        onUploadError?.(failedUploads[0]);
      }

    } catch (error) {
      console.error('Upload error:', error);
      onUploadError?.(error);
    }
  }, [multiple, onUploadSuccess, onUploadError, dropValidator]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(Array.from(files));
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFiles]);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const removeUploadingFile = (file: File) => {
    setUploadingFiles(prev => prev.filter(f => f.file !== file));
  };

  const clearAll = () => {
    setUploadingFiles([]);
    setError(null);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {error && (
        <ErrorAlert 
          error={error} 
          dismissible 
          onDismiss={() => setError(null)}
        />
      )}

      {/* Drop Zone */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 transition-colors',
          isDragOver 
            ? 'border-primary bg-primary/5' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500',
          'hover:bg-gray-50 dark:hover:bg-gray-800/50'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={ALLOWED_FILE_EXTENSIONS.join(',')}
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="text-center">
          <CloudUpload className={cn(
            'mx-auto h-12 w-12 mb-4',
            isDragOver ? 'text-primary' : 'text-gray-400 dark:text-gray-500'
          )} />
          
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {isDragOver ? 'Drop files here' : 'Upload your files'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Drag and drop files here, or{' '}
              <button
                type="button"
                onClick={openFileDialog}
                className="text-primary hover:text-primary/80 font-medium underline"
              >
                browse
              </button>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Supports: {ALLOWED_FILE_EXTENSIONS.join(', ')} • Max size: {formatFileSize(MAX_FILE_SIZE)}
            </p>
          </div>

          <Button
            type="button"
            onClick={openFileDialog}
            className="mt-4"
            variant="outline"
          >
            <Upload className="w-4 h-4 mr-2" />
            Choose Files
          </Button>
        </div>
      </div>

      {/* Uploading Files List */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Upload Progress
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-xs"
            >
              Clear All
            </Button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {uploadingFiles.map((uploadingFile, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex-shrink-0">
                  {uploadingFile.status === 'uploading' && (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  )}
                  {uploadingFile.status === 'success' && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  {uploadingFile.status === 'error' && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {uploadingFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(uploadingFile.file.size)}
                    </p>
                  </div>

                  {uploadingFile.status === 'uploading' && (
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadingFile.progress}%` }}
                      />
                    </div>
                  )}

                  {uploadingFile.status === 'success' && (
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Upload completed successfully
                    </p>
                  )}

                  {uploadingFile.status === 'error' && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {uploadingFile.error}
                    </p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeUploadingFile(uploadingFile.file)}
                  className="flex-shrink-0 h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 