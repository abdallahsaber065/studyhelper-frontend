'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ErrorAlert } from '@/components/ui/error-alert';
import { useProtectedRoute } from '@/hooks/useAuth';
import MarkdownEditor from '@/components/MarkdownEditor';
import { summariesService } from '@/services/summaries';
import { SummaryRead } from '@/types/summaries';
import { 
  ArrowLeft, 
  Brain,
  FileText,
  Calendar,
  Pencil,
  Trash2,
  Copy,
  Check,
  Loader2
} from 'lucide-react';

export default function SummaryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoading: authLoading } = useProtectedRoute();
  
  const [summary, setSummary] = useState<SummaryRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  const summaryId = params.summaryId ? parseInt(params.summaryId as string, 10) : null;

  // Handle loading state client-side only
  useEffect(() => {
    // Only show loading spinner on the client
    setShowLoading(authLoading);
  }, [authLoading]);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!summaryId) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await summariesService.getSummaryById(summaryId);
        setSummary(data);
      } catch (error) {
        console.error('Failed to fetch summary:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    if (user && summaryId) {
      fetchSummary();
    }
  }, [user, summaryId]);

  const handleDeleteSummary = async () => {
    if (!summary) return;
    
    if (!confirm('Are you sure you want to delete this summary?')) {
      return;
    }

    try {
      await summariesService.deleteSummary(summary.id);
      router.push('/summaries');
    } catch (error) {
      console.error('Failed to delete summary:', error);
      setError(error);
    }
  };

  const handleCopyToClipboard = () => {
    if (!summary) return;
    
    navigator.clipboard.writeText(summary.full_markdown)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text:', err);
      });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render loading state only on client after first render
  if (showLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
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
                <Link href="/summaries" className="flex items-center space-x-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Summaries</span>
                </Link>
              </Button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-purple-500" />
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {loading ? 'Loading Summary...' : summary?.title || 'Summary Not Found'}
                </h1>
              </div>
            </div>
            {summary && (
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyToClipboard}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteSummary}
                  className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <Button
                  asChild
                >
                  <Link href={`/summaries/${summary.id}/edit`}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </Link>
                </Button>
              </div>
            )}
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

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading summary...</span>
          </div>
        ) : !summary ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Summary Not Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The summary you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button asChild>
              <Link href="/summaries">
                View All Summaries
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Metadata */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Created: {formatDate(summary.created_at)}</span>
                </div>
                {summary.updated_at !== summary.created_at && (
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Updated: {formatDate(summary.updated_at)}</span>
                  </div>
                )}
                {summary.physical_file_id && (
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    <span>Source File ID: {summary.physical_file_id}</span>
                  </div>
                )}
                {summary.community_id && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Community ID: {summary.community_id}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Summary Content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <MarkdownEditor
                value={summary.full_markdown}
                readOnly={true}
                minHeight="500px"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 