'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ErrorAlert } from '@/components/ui/error-alert';
import { useProtectedRoute } from '@/hooks/useAuth';
import FileShareModal from '@/components/files/FileShareModal';
import { filesService } from '@/services/files';
import { FileRead, UserFileAccessRead } from '@/types/files';
import { 
  formatFileSize, 
  formatFileDate, 
  getFileTypeIcon, 
  getFileTypeName 
} from '@/lib/file-utils';
import { 
  ArrowLeft, 
  Share2, 
  Download,
  Eye,
  Edit,
  Trash2,
  User,
  Calendar,
  FileText,
  Users,
  Loader2,
  Brain,
  MessageSquare,
  Hash
} from 'lucide-react';

export default function FileDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useProtectedRoute();
  const fileId = params.fileId as string;

  const [file, setFile] = useState<FileRead | null>(null);
  const [accessList, setAccessList] = useState<UserFileAccessRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [analytics, setAnalytics] = useState<any>({
    views: 0,
    downloads: 0,
    summaries: 0,
    quizzes: 0
  });

  const loadFileDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fileIdNum = Number(fileId);
      const fileData = await filesService.getFileById(fileIdNum);
      setFile(fileData);
    } catch (error) {
      console.error('Failed to load file details:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [fileId]);

  const loadAccessList = useCallback(async () => {
    try {
      const fileIdNum = Number(fileId);
      const access = await filesService.getFileAccess(fileIdNum);
      setAccessList(access);
    } catch (error) {
      console.error('Failed to load access list:', error);
      // Don't set error here as it might be a permission issue
    }
  }, [fileId]);

  const loadAnalytics = useCallback(async () => {
    if (!fileId) return;
    
    try {
      const fileIdNum = Number(fileId);
      const analyticsData = await filesService.getFileAnalytics(fileIdNum);
      const engagementData = await filesService.getFileEngagement(fileIdNum);
      
      setAnalytics({
        views: analyticsData?.views || 0,
        downloads: analyticsData?.downloads || 0,
        summaries: engagementData?.summaries_count || 0,
        quizzes: engagementData?.quizzes_count || 0
      });
      
      // Increment view count
      await filesService.incrementFileView(fileIdNum);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      // Don't set the main error state for analytics failures
    }
  }, [fileId]);

  useEffect(() => {
    if (fileId) {
      loadFileDetails();
      loadAccessList();
      loadAnalytics();
    }
  }, [fileId, loadFileDetails, loadAccessList, loadAnalytics]);

  const handleDelete = async () => {
    if (!file) return;
    
    // TODO: Implement delete confirmation modal
    const confirmed = window.confirm(`Are you sure you want to delete "${file.file_name}"? This action cannot be undone.`);
    
    if (confirmed) {
      try {
        // Note: Delete endpoint is not defined in the API yet
        // await filesService.deleteFile(fileId);
        console.log('Delete file:', fileId);
        // router.push('/files');
      } catch (error) {
        console.error('Failed to delete file:', error);
        setError(error);
      }
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600 dark:text-gray-400">Loading file details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // useProtectedRoute will handle redirect
  }

  if (error && !file) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            File Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The file you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button asChild>
            <Link href="/files">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Files
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!file) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/files" className="flex items-center space-x-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Files</span>
                </Link>
              </Button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">
                  {getFileTypeIcon(file.file_type)}
                </span>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white truncate max-w-md">
                    {file.file_name}
                  </h1>
                  {!file.is_owner && (
                    <div className="flex items-center text-sm text-blue-600 dark:text-blue-400 mt-1">
                      <Share2 className="w-3 h-3 mr-1" />
                      <span>Shared with you by {file.owner_name || `User ${file.user_id}`}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => setShareModalOpen(true)}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              {file.is_owner && (
                <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              )}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* File Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                File Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    File Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Type:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {getFileTypeName(file.file_type)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Size:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatFileSize(file.file_size_bytes)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Hash:</span>
                      <code className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {file.file_hash.substring(0, 12)}...
                      </code>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Upload Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Uploaded by:
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {file.user_id}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Uploaded:
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatFileDate(file.uploaded_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* File Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Quick Actions
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button asChild variant="outline" className="justify-start h-auto p-4">
                  <Link href={`/summaries/generate?files=${file.id}`}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Generate Summary</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Create AI-powered summary
                        </p>
                      </div>
                    </div>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="justify-start h-auto p-4">
                  <Link href={`/mcqs/generate?files=${file.id}`}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Generate MCQs</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Create quiz questions
                        </p>
                      </div>
                    </div>
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* File Access */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  File Access
                </h3>
                <Button 
                  size="sm" 
                  onClick={() => setShareModalOpen(true)}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>

              {accessList.length === 0 ? (
                <div className="text-center py-4">
                  <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Not shared with anyone
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Shared with {accessList.length} user{accessList.length > 1 ? 's' : ''}
                  </p>
                  {accessList.slice(0, 3).map((access, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {access.user_id}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {access.access_level} access
                        </p>
                      </div>
                    </div>
                  ))}
                  {accessList.length > 3 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      +{accessList.length - 3} more
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* File Statistics */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Statistics
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Views:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {analytics.views || '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Downloads:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {analytics.downloads || '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Summaries:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {analytics.summaries || '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Quizzes:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {analytics.quizzes || '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {shareModalOpen && (
        <FileShareModal
          file={file}
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          onShareSuccess={() => {
            loadAccessList();
          }}
        />
      )}
    </div>
  );
} 