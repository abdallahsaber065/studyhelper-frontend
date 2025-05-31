'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ErrorAlert } from '@/components/ui/error-alert';
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

export default function FilesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useProtectedRoute();
  const [shareModalFile, setShareModalFile] = useState<FileRead | null>(null);
  const [error, setError] = useState<any>(null);

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

  if (authLoading) {
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
        {error && (
          <div className="mb-6">
            <ErrorAlert 
              error={error} 
              dismissible 
              onDismiss={() => setError(null)}
            />
          </div>
        )}

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                File Management
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Upload, organize, and share your study materials
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Files</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">-</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Shared Files</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">-</p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Storage Used</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">-</p>
                </div>
                <Folder className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Files List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              All Files
            </h3>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          <FileList
            onFileSelect={handleFileSelect}
            onFileShare={handleFileShare}
            onFileDelete={handleFileDelete}
            selectable={false}
          />
        </div>
      </div>

      {/* Share Modal */}
      {shareModalFile && (
        <FileShareModal
          file={shareModalFile}
          isOpen={!!shareModalFile}
          onClose={() => setShareModalFile(null)}
          onShareSuccess={() => {
            // Optionally refresh the file list
            console.log('File shared successfully');
          }}
        />
      )}
    </div>
  );
} 