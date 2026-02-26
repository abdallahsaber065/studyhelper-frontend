'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ErrorAlert } from '@/components/ui/alert';
import { useProtectedRoute } from '@/hooks/useAuth';
import FileList from '@/components/files/FileList';
import FileShareModal from '@/components/files/FileShareModal';
import { FileRead } from '@/types/files';
import { 
  ArrowLeft, 
  Upload, 
  Plus,
  FileText,
  Folder,
  Users,
  Filter
} from 'lucide-react';
import { filesService } from '@/services/files';
import { formatFileSize } from '@/lib/file-utils';

export default function FilesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useProtectedRoute();
  
  const [fileStats, setFileStats] = useState({
    total: 0,
    shared: 0,
    storage: 0
  });
  const [shareModalFile, setShareModalFile] = useState<FileRead | null>(null);
  const [deleteModalFile, setDeleteModalFile] = useState<FileRead | null>(null);
  const [showLoading, setShowLoading] = useState(false);
  
  // Handle loading state client-side only
  useEffect(() => {
    // Only show loading spinner on the client
    setShowLoading(authLoading);
  }, [authLoading]);
  
  // Load file statistics
  useEffect(() => {
    const fetchFileStats = async () => {
      try {
        const files = await filesService.getFiles({});
        const totalFiles = files.length;
        
        // Count files that are shared with other users (files I own that have been shared)
        const filesIOwn = files.filter(file => file.is_owner);
        const sharedByMe = filesIOwn.filter(file => file.shared_count && file.shared_count > 0).length;
        
        // Count files shared with me (I don't own them)
        const sharedWithMe = files.filter(file => !file.is_owner).length;
        
        // Total shared files (both directions)
        const totalShared = sharedByMe + sharedWithMe;
        
        const totalStorage = files.reduce((acc, file) => acc + file.file_size_bytes, 0);
        
        setFileStats({
          total: totalFiles,
          shared: totalShared,
          storage: totalStorage
        });
      } catch (error) {
        console.error('Failed to fetch file stats:', error);
      }
    };
    
    if (user) {
      fetchFileStats();
    }
  }, [user]);

  const handleFileSelect = (file: FileRead) => {
    router.push(`/files/${file.id}`);
  };

  const handleFileShare = (file: FileRead) => {
    setShareModalFile(file);
  };

  const handleFileDelete = (file: FileRead) => {
    // TODO: Implement delete confirmation modal
    console.log('Delete file:', file.id);
  };

  // Render loading state only on client after first render
  if (showLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // useProtectedRoute will handle redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/dashboard" className="flex items-center space-x-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Dashboard</span>
                </Link>
              </Button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center space-x-2">
                <Folder className="w-5 h-5 text-primary" />
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  My Files
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button asChild>
                <Link href="/files/upload" className="flex items-center space-x-2">
                  <Upload className="w-4 h-4" />
                  <span>Upload Files</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* File Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Files
              </h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                {fileStats.total}
              </p>
            </div>
            <FileText className="w-10 h-10 text-blue-500 opacity-80" />
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Shared Files
              </h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                {fileStats.shared}
              </p>
            </div>
            <Users className="w-10 h-10 text-green-500 opacity-80" />
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Storage Used
              </h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                {formatFileSize(fileStats.storage)}
              </p>
            </div>
            <Folder className="w-10 h-10 text-purple-500 opacity-80" />
          </div>
        </div>

        {/* File List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              All Files
            </h2>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
          
          <FileList
            onFileSelect={handleFileSelect}
            onFileShare={handleFileShare}
            onFileDelete={handleFileDelete}
          />
        </div>
      </div>

      {/* Share Modal */}
      {shareModalFile && (
        <FileShareModal
          file={shareModalFile}
          isOpen={Boolean(shareModalFile)}
          onClose={() => setShareModalFile(null)}
          onShareSuccess={() => {
            // Refresh the file list to update share status
            setShareModalFile(null);
          }}
        />
      )}
    </div>
  );
} 