'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ErrorAlert } from '@/components/ui/alert';
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

      {/* File List Table */}
      <div className="relative overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
          <thead className="text-xs text-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
            <tr>
              {selectable && (
                <th scope="col" className="px-4 py-3 w-10">
                  <span className="sr-only">Select</span>
                </th>
              )}
              <th
                scope="col"
                className="px-4 py-3 cursor-pointer"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  <span>Name</span>
                  <span className="ml-1 text-gray-500">{getSortIcon('name')}</span>
                </div>
              </th>
              <th
                scope="col"
                className="px-4 py-3 cursor-pointer w-24"
                onClick={() => handleSort('type')}
              >
                <div className="flex items-center">
                  <span>Type</span>
                  <span className="ml-1 text-gray-500">{getSortIcon('type')}</span>
                </div>
              </th>
              <th
                scope="col"
                className="px-4 py-3 cursor-pointer w-24"
                onClick={() => handleSort('size')}
              >
                <div className="flex items-center">
                  <span>Size</span>
                  <span className="ml-1 text-gray-500">{getSortIcon('size')}</span>
                </div>
              </th>
              <th
                scope="col"
                className="px-4 py-3 cursor-pointer w-32 hidden md:table-cell"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center">
                  <span>Date</span>
                  <span className="ml-1 text-gray-500">{getSortIcon('date')}</span>
                </div>
              </th>
              <th scope="col" className="px-4 py-3 w-24 text-right">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {files.length === 0 ? (
              <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <td colSpan={selectable ? 6 : 5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No files found.
                </td>
              </tr>
            ) : (
              files.map((file) => (
                <tr
                  key={file.id}
                  className={cn(
                    "bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700",
                    selectedFiles.has(String(file.id)) && "bg-blue-50 dark:bg-blue-900/20"
                  )}
                  onClick={() => handleFileSelect(file)}
                >
                  {selectable && (
                    <td className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
                        checked={selectedFiles.has(String(file.id))}
                        onChange={() => handleFileSelect(file)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl flex-shrink-0">
                        {getFileTypeIcon(file.file_type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {truncateFilename(file.file_name, 30)}
                        </p>
                        {!file.is_owner && file.owner_name && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                            <Share2 className="w-3 h-3 mr-1 text-blue-500" /> 
                            Shared by {file.owner_name}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize">
                    {getFileTypeName(file.file_type)}
                  </td>
                  <td className="px-4 py-3">
                    {formatFileSize(file.file_size_bytes)}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {formatFileDate(file.uploaded_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="relative inline-block text-left">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActionMenuFile(actionMenuFile === String(file.id) ? null : String(file.id));
                        }}
                        className="p-2 text-gray-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {actionMenuFile === String(file.id) && (
                        <div
                          className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100 dark:divide-gray-700"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="py-1">
                            <button
                              onClick={() => {
                                handleFileAction('view', file);
                                setActionMenuFile(null);
                              }}
                              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Eye className="w-4 h-4 mr-3" />
                              View
                            </button>
                            <button
                              onClick={() => {
                                handleFileAction('share', file);
                                setActionMenuFile(null);
                              }}
                              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Share2 className="w-4 h-4 mr-3" />
                              Share
                            </button>
                          </div>
                          {file.is_owner !== false && (
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  handleFileAction('delete', file);
                                  setActionMenuFile(null);
                                }}
                                className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <Trash2 className="w-4 h-4 mr-3" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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