'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ErrorAlert } from '@/components/ui/error-alert';
import { filesService } from '@/services/files';
import { FileRead } from '@/types/files';
import { formatFileSize, formatFileDate, getFileTypeIcon } from '@/lib/file-utils';
import { Loader2, Search } from 'lucide-react';

interface FileSelectorProps {
  selectedFileIds: number[];
  onFileSelectionChange: (fileIds: number[]) => void;
  maxFiles?: number;
  initialFileIds?: number[];
}

export default function FileSelector({
  selectedFileIds,
  onFileSelectionChange,
  maxFiles = 10,
  initialFileIds = []
}: FileSelectorProps) {
  const [files, setFiles] = useState<FileRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // This effect runs once on component mount
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true);
        setError(null);
        const filesData = await filesService.getFiles({});
        setFiles(filesData);
        
        // If initial file IDs are provided and no files are selected yet
        if (initialFileIds.length > 0 && selectedFileIds.length === 0) {
          onFileSelectionChange(initialFileIds);
        }
      } catch (error) {
        console.error('Failed to load files:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFiles();
    // Only run this effect when the component mounts or initialFileIds changes
  }, [initialFileIds]);

  const handleFileSelect = (fileId: number) => {
    if (selectedFileIds.includes(fileId)) {
      onFileSelectionChange(selectedFileIds.filter(id => id !== fileId));
    } else {
      // Check if adding this file would exceed the max limit
      if (selectedFileIds.length >= maxFiles) {
        return;
      }
      onFileSelectionChange([...selectedFileIds, fileId]);
    }
  };

  const filteredFiles = files.filter(file => 
    file.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading files...</span>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorAlert 
        error={error} 
        dismissible 
        onDismiss={() => setError(null)}
      />
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-400 mb-4">No files available for selection.</p>
        <Button asChild>
          <a href="/files/upload">Upload Files</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {selectedFileIds.length} of {maxFiles} files selected
        </div>
      </div>

      {/* File List */}
      <div className="grid gap-2 max-h-[400px] overflow-y-auto pr-2">
        {filteredFiles.map((file) => (
          <div
            key={file.id}
            className={`flex items-center p-3 rounded-md border ${
              selectedFileIds.includes(file.id)
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            }`}
          >
            <Checkbox
              id={`file-${file.id}`}
              checked={selectedFileIds.includes(file.id)}
              onCheckedChange={() => handleFileSelect(file.id)}
              disabled={selectedFileIds.length >= maxFiles && !selectedFileIds.includes(file.id)}
              className="mr-3"
            />
            <label
              htmlFor={`file-${file.id}`}
              className="flex flex-1 items-center cursor-pointer overflow-hidden"
            >
              <div className="text-xl mr-3">{getFileTypeIcon(file.file_type)}</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 dark:text-white truncate">
                  {file.file_name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex space-x-2">
                  <span>{formatFileSize(file.file_size_bytes)}</span>
                  <span>•</span>
                  <span>Uploaded {formatFileDate(file.uploaded_at)}</span>
                </div>
              </div>
            </label>
          </div>
        ))}
      </div>

      {filteredFiles.length === 0 && searchQuery && (
        <div className="text-center py-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400">No files found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
} 