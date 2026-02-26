'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ErrorAlert } from '@/components/ui/alert';
import { useProtectedRoute } from '@/hooks/useAuth';
import { summariesService } from '@/services/summaries';
import { SummaryRead } from '@/types/summaries';
import { 
  ArrowLeft, 
  Brain,
  Search,
  Plus,
  FileText,
  Calendar,
  ExternalLink,
  Pencil,
  Trash2,
  Loader2
} from 'lucide-react';

export default function SummariesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useProtectedRoute();
  
  const [summaries, setSummaries] = useState<SummaryRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLoading, setShowLoading] = useState(false);

  // Handle loading state client-side only
  useEffect(() => {
    // Only show loading spinner on the client
    setShowLoading(authLoading);
  }, [authLoading]);

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await summariesService.getSummaries({ search: searchQuery || undefined });
        setSummaries(data);
      } catch (error) {
        console.error('Failed to fetch summaries:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchSummaries();
    }
  }, [user, searchQuery]);

  const handleDeleteSummary = async (summaryId: number) => {
    if (!confirm('Are you sure you want to delete this summary?')) {
      return;
    }

    try {
      await summariesService.deleteSummary(summaryId);
      setSummaries(summaries.filter(summary => summary.id !== summaryId));
    } catch (error) {
      console.error('Failed to delete summary:', error);
      setError(error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateMarkdown = (markdown: string, maxLength = 200) => {
    if (!markdown) return '';
    
    // Remove markdown formatting for display
    let plainText = markdown
      .replace(/#{1,6}\s?/g, '') // Remove headings
      .replace(/\*\*|\*|~~|__|\|/g, '') // Remove bold, italic, strikethrough, etc.
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Replace links with just text
      .replace(/\n/g, ' '); // Replace newlines with spaces
    
    if (plainText.length > maxLength) {
      return plainText.substring(0, maxLength) + '...';
    }
    
    return plainText;
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
                <Link href="/dashboard" className="flex items-center space-x-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Dashboard</span>
                </Link>
              </Button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-purple-500" />
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  My Summaries
                </h1>
              </div>
            </div>
            <div>
              <Button asChild>
                <Link href="/summaries/generate">
                  <Plus className="w-4 h-4 mr-2" />
                  Generate Summary
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

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search summaries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading summaries...</span>
          </div>
        ) : summaries.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchQuery ? 'No matching summaries found' : 'No summaries yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery 
                ? `Try a different search term or clear your search.`
                : `Generate your first AI-powered summary from your study materials.`}
            </p>
            <Button asChild>
              <Link href="/summaries/generate">
                <Plus className="w-4 h-4 mr-2" />
                Generate Summary
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {summaries.map((summary) => (
              <div 
                key={summary.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {summary.title}
                      </h2>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>Created: {formatDate(summary.created_at)}</span>
                        {summary.updated_at !== summary.created_at && (
                          <>
                            <span className="mx-2">•</span>
                            <span>Updated: {formatDate(summary.updated_at)}</span>
                          </>
                        )}
                        {summary.physical_file_id && (
                          <>
                            <span className="mx-2">•</span>
                            <FileText className="w-4 h-4 mr-1" />
                            <span>From file ID: {summary.physical_file_id}</span>
                          </>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-6">
                        {truncateMarkdown(summary.full_markdown)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSummary(summary.id)}
                      className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link href={`/summaries/${summary.id}/edit`}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      asChild
                    >
                      <Link href={`/summaries/${summary.id}`}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 