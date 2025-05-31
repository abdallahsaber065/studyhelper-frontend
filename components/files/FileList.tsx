'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ErrorAlert } from '@/components/ui/error-alert';
import { filesService } from '@/services/files';
import { FileRead, FileListParams } from '@/types/files';
import { 
  formatFileSize, 
  formatFileDate, 
  getFileTypeIcon, 
  getFileTypeName,
  truncateFilename 
} from '@/lib/file-utils';
import { 
  Search, 
  Filter,
  MoreVertical, 
  Share2, 
  Eye, 
  Download,
  Trash2,
  User,
  Calendar,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileListProps {
  onFileSelect?: (file: FileRead) => void;
  onFileShare?: (file: FileRead) => void;
  onFileDelete?: (file: FileRead) => void;
  selectable?: boolean;
  className?: string;
}

type SortField = 'name' | 'size' | 'type' | 'date';
type SortOrder = 'asc' | 'desc';

export default function FileList({
  onFileSelect,
  onFileShare,
  onFileDelete,
  selectable = false,
  className
}: FileListProps) {
  const [files, setFiles] = useState<FileRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFiles, setTotalFiles] = useState(0);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [actionMenuFile, setActionMenuFile] = useState<string | null>(null);

  const itemsPerPage = 20;

  const loadFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: FileListParams = {
        skip: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
      };

      const response = await filesService.getFiles(params);
      
      // Sort files locally since API might not support all sort options
      const sortedFiles = [...response].sort((a, b) => {
        let compareValue = 0;
        
        switch (sortField) {
          case 'name':
            compareValue = a.file_name.localeCompare(b.file_name);
            break;
          case 'size':
            compareValue = a.file_size_bytes - b.file_size_bytes;
            break;
          case 'type':
            compareValue = a.file_type.localeCompare(b.file_type);
            break;
          case 'date':
            compareValue = new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime();
            break;
          default:
            compareValue = 0;
        }
        
        return sortOrder === 'asc' ? compareValue : -compareValue;
      });

      setFiles(sortedFiles);
      setTotalFiles(sortedFiles.length);
      setTotalPages(Math.ceil(sortedFiles.length / itemsPerPage));
    } catch (error) {
      console.error('Failed to load files:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, sortField, sortOrder]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleFileSelect = (file: FileRead) => {
    if (selectable) {
      const newSelected = new Set(selectedFiles);
      const fileIdStr = String(file.id);
      if (newSelected.has(fileIdStr)) {
        newSelected.delete(fileIdStr);
      } else {
        newSelected.add(fileIdStr);
      }
      setSelectedFiles(newSelected);
    }
    onFileSelect?.(file);
  };

  const handleFileAction = (action: string, file: FileRead) => {
    setActionMenuFile(null);
    switch (action) {
      case 'share':
        onFileShare?.(file);
        break;
      case 'delete':
        onFileDelete?.(file);
        break;
      default:
        break;
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  if (loading && files.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600 dark:text-gray-400">Loading files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {error && (
        <ErrorAlert 
          error={error} 
          dismissible 
          onDismiss={() => setError(null)}
        />
      )}

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadFiles}
            disabled={loading}
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </Button>
          
          {selectedFiles.size > 0 && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedFiles.size} selected
            </span>
          )}
        </div>
      </div>

      {/* Files Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {files.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No files found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'Try adjusting your search terms' : 'Upload your first file to get started'}
            </p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-4 p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              {selectable && <div className="col-span-1"></div>}
              <div 
                className={cn("col-span-4 cursor-pointer hover:text-primary", selectable ? "col-span-3" : "col-span-4")}
                onClick={() => handleSort('name')}
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name {getSortIcon('name')}
                </span>
              </div>
              <div 
                className="col-span-2 cursor-pointer hover:text-primary"
                onClick={() => handleSort('type')}
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Type {getSortIcon('type')}
                </span>
              </div>
              <div 
                className="col-span-2 cursor-pointer hover:text-primary"
                onClick={() => handleSort('size')}
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Size {getSortIcon('size')}
                </span>
              </div>
              <div 
                className="col-span-2 cursor-pointer hover:text-primary"
                onClick={() => handleSort('date')}
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Modified {getSortIcon('date')}
                </span>
              </div>
              <div className="col-span-1"></div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {files.map((file) => (
                <div
                  key={String(file.id)}
                  className={cn(
                    'p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors',
                    'grid grid-cols-1 lg:grid-cols-12 gap-4 items-center',
                    selectable && selectedFiles.has(String(file.id)) && 'bg-blue-50 dark:bg-blue-900/20'
                  )}
                >
                  {selectable && (
                    <div className="lg:col-span-1">
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(String(file.id))}
                        onChange={() => handleFileSelect(file)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </div>
                  )}

                  <div className={cn("lg:col-span-4 flex items-center space-x-3", selectable ? "lg:col-span-3" : "lg:col-span-4")}>
                    <span className="text-2xl flex-shrink-0">
                      {getFileTypeIcon(file.file_type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {file.file_name}
                      </p>
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {getFileTypeName(file.file_type)}
                    </span>
                  </div>

                  <div className="lg:col-span-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatFileSize(file.file_size_bytes)}
                    </span>
                  </div>

                  <div className="lg:col-span-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatFileDate(file.uploaded_at)}
                    </span>
                  </div>

                  <div className="lg:col-span-1 relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActionMenuFile(String(file.id) === actionMenuFile ? null : String(file.id))}
                      className="w-8 h-8 p-0"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>

                    {actionMenuFile === String(file.id) && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                        <div className="py-1">
                          <button
                            onClick={() => handleFileAction('share', file)}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                          </button>
                          <button
                            onClick={() => handleFileAction('delete', file)}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalFiles)} of {totalFiles} files
          </p>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1 || loading}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Click outside to close action menu */}
      {actionMenuFile && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setActionMenuFile(null)}
        />
      )}
    </div>
  );
} 