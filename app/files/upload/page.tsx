'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ErrorAlert } from '@/components/ui/error-alert';
import { useProtectedRoute } from '@/hooks/useAuth';
import FileUpload from '@/components/files/FileUpload';
import { FileUploadResponse } from '@/types/files';
import { formatFileSize } from '@/lib/file-utils';
import { 
  ArrowLeft, 
  CheckCircle, 
  Upload,
  FileText,
  Shield,
  Zap
} from 'lucide-react';

export default function FileUploadPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useProtectedRoute();
  const [uploadedFiles, setUploadedFiles] = useState<FileUploadResponse[]>([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState<any>(null);
  const [showLoading, setShowLoading] = useState(false);
  
  // Handle loading state client-side only
  useEffect(() => {
    // Only show loading spinner on the client
    setShowLoading(authLoading);
  }, [authLoading]);

  const handleUploadSuccess = (files: FileUploadResponse[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
    setSuccess(`Successfully uploaded ${files.length} file${files.length > 1 ? 's' : ''}!`);
    setTimeout(() => setSuccess(''), 5000);
  };

  const handleUploadError = (error: any) => {
    setError(error);
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
                <Link href="/files" className="flex items-center space-x-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Files</span>
                </Link>
              </Button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center space-x-2">
                <Upload className="w-5 h-5 text-primary" />
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Upload Files
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Upload Your Study Materials
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Upload documents to generate AI-powered summaries, create quizzes, and share with your study community.
            </p>
            
            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Smart Processing
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Automatic content extraction and AI-powered analysis of your documents.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Secure Storage
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your files are securely stored with encryption and access controls.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Instant Processing
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Files are processed immediately for summaries and quiz generation.
                </p>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
            {error && (
              <div className="mb-6">
                <ErrorAlert 
                  error={error} 
                  dismissible 
                  onDismiss={() => setError(null)}
                />
              </div>
            )}

            {success && (
              <div className="mb-6">
                <ErrorAlert 
                  message={success}
                  variant="info"
                  showIcon={true}
                  dismissible 
                  onDismiss={() => setSuccess('')}
                />
              </div>
            )}

            <FileUpload
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
              multiple={true}
            />
          </div>

          {/* Successfully Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Successfully Uploaded
                </h3>
              </div>
              
              <div className="space-y-3">
                {uploadedFiles.map((uploadResponse, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                  >
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {uploadResponse.file.file_name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {formatFileSize(uploadResponse.file.file_size_bytes)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link href={`/files/${uploadResponse.file.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-center space-x-4">
                <Button asChild variant="outline">
                  <Link href="/files">
                    View All Files
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/summaries/generate">
                    Generate Summary
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
              📚 Supported File Types
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">📄</span>
                <span className="text-blue-800 dark:text-blue-200">PDF Documents</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">📝</span>
                <span className="text-blue-800 dark:text-blue-200">Text Files</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">📘</span>
                <span className="text-blue-800 dark:text-blue-200">Word Documents</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">📊</span>
                <span className="text-blue-800 dark:text-blue-200">DOC/DOCX Files</span>
              </div>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-4">
              Maximum file size: 50MB per file. Files are automatically processed for content extraction and AI analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 