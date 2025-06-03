'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ErrorAlert } from '@/components/ui/alert';
import { useProtectedRoute } from '@/hooks/useAuth';
import MarkdownEditor from '@/components/MarkdownEditor';
import { summariesService } from '@/services/summaries';
import { SummaryRead, SummaryUpdate } from '@/types/summaries';
import { 
  ArrowLeft, 
  Brain,
  Save,
  X,
  Loader2
} from 'lucide-react';

export default function EditSummaryPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoading: authLoading } = useProtectedRoute();
  
  const [summary, setSummary] = useState<SummaryRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<any>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
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
        setEditTitle(data.title);
        setEditContent(data.full_markdown);
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

  const handleSave = async () => {
    if (!summary || !summaryId) return;
    
    if (!editTitle.trim()) {
      setError({ message: 'Title cannot be empty' });
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      const updateData: SummaryUpdate = {
        title: editTitle,
        full_markdown: editContent
      };
      
      const updatedSummary = await summariesService.updateSummary(summaryId, updateData);
      setSummary(updatedSummary);
      
      // Redirect to view page after successful save
      router.push(`/summaries/${summaryId}`);
    } catch (error) {
      console.error('Failed to update summary:', error);
      setError(error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (summary) {
      router.push(`/summaries/${summary.id}`);
    } else {
      router.push('/summaries');
    }
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
                <Link href={summary ? `/summaries/${summary.id}` : '/summaries'} className="flex items-center space-x-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </Link>
              </Button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-purple-500" />
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {loading ? 'Loading...' : `Editing: ${summary?.title || 'Summary'}`}
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading || saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
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
              The summary you're trying to edit doesn't exist or you don't have permission to edit it.
            </p>
            <Button asChild>
              <Link href="/summaries">
                View All Summaries
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Title Edit */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <label htmlFor="summary-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Summary Title
              </label>
              <Input
                id="summary-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter a title for your summary"
                className="mb-1"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Choose a clear, descriptive title that summarizes the content.
              </p>
            </div>

            {/* Content Edit */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 pt-6 pb-2">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                  Summary Content
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Edit the content using markdown formatting. Use the toolbar to add formatting.
                </p>
              </div>
              <MarkdownEditor
                value={editContent}
                onChange={setEditContent}
                minHeight="500px"
                onSave={handleSave}
              />
            </div>

            {/* Action buttons (for mobile) */}
            <div className="md:hidden flex flex-col-reverse space-y-4 space-y-reverse">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
                className="w-full"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading || saving}
                className="w-full"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 