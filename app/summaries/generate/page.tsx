'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ErrorAlert } from '@/components/ui/error-alert';
import { useProtectedRoute } from '@/hooks/useAuth';
import FileSelector from '@/components/FileSelector';
import MarkdownEditor from '@/components/MarkdownEditor';
import { summariesService } from '@/services/summaries';
import { SummaryRead } from '@/types/summaries';
import { 
  ArrowLeft, 
  Brain, 
  Loader2,
  FileText,
  Check,
  PenLine,
  Copy,
  ExternalLink
} from 'lucide-react';

export default function GenerateSummaryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useProtectedRoute();
  
  const [selectedFileIds, setSelectedFileIds] = useState<number[]>([]);
  const [initialFileIds, setInitialFileIds] = useState<number[]>([]);
  const [customInstructions, setCustomInstructions] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState<SummaryRead | null>(null);
  const [error, setError] = useState<any>(null);
  const [showLoading, setShowLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Handle loading state client-side only
  useEffect(() => {
    // Only show loading spinner on the client
    setShowLoading(authLoading);
  }, [authLoading]);

  // Parse file IDs from URL query params
  useEffect(() => {
    const files = searchParams.get('files');
    if (files) {
      try {
        // Handle both comma-separated values and single values
        const fileIds = files.includes(',') 
          ? files.split(',').map(id => parseInt(id.trim(), 10))
          : [parseInt(files.trim(), 10)];
        
        const validFileIds = fileIds.filter(id => !isNaN(id));
        setSelectedFileIds(validFileIds);
        setInitialFileIds(validFileIds);
      } catch (err) {
        console.error('Failed to parse file IDs from URL:', err);
      }
    }
  }, [searchParams]);

  const handleGenerateSummary = async () => {
    if (selectedFileIds.length === 0) {
      setError({ message: 'Please select at least one file to generate a summary.' });
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      
      const response = await summariesService.generateSummary({
        physical_file_ids: selectedFileIds,
        custom_instructions: customInstructions || undefined
      });
      
      setGeneratedSummary(response.summary);
    } catch (error) {
      console.error('Failed to generate summary:', error);
      setError(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!generatedSummary) return;
    
    navigator.clipboard.writeText(generatedSummary.full_markdown)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text:', err);
      });
  };

  const handleViewSummary = () => {
    if (generatedSummary) {
      router.push(`/summaries/${generatedSummary.id}`);
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
                <Link href="/files" className="flex items-center space-x-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Files</span>
                </Link>
              </Button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-purple-500" />
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Generate Summary
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-6">
              <ErrorAlert 
                error={error} 
                dismissible 
                onDismiss={() => setError(null)}
              />
            </div>
          )}

          {!generatedSummary ? (
            <div className="space-y-8">
              {/* File Selection Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Select Files
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Choose the files you want to generate a summary from. You can select up to 5 files.
                </p>
                
                <FileSelector
                  selectedFileIds={selectedFileIds}
                  onFileSelectionChange={setSelectedFileIds}
                  maxFiles={5}
                  initialFileIds={initialFileIds}
                />
              </div>

              {/* Custom Instructions Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Custom Instructions (Optional)
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Provide any specific instructions for the AI when generating the summary.
                </p>
                
                <Textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="For example: Focus on the key points, include a section on methodology, summarize in bullet points, etc."
                  className="min-h-[120px]"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => router.push('/files')}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerateSummary}
                  disabled={selectedFileIds.length === 0 || isGenerating}
                  className="min-w-[160px]"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Generate Summary
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Success Message */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
                      Summary Generated Successfully!
                    </h3>
                    <p className="text-green-700 dark:text-green-400">
                      Your summary has been created and saved. You can now view it, edit it, or copy its content.
                    </p>
                  </div>
                </div>
              </div>

              {/* Summary Preview */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {generatedSummary.title}
                  </h2>
                  <div className="flex items-center space-x-2">
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
                  </div>
                </div>
                
                <div className="mt-4 max-h-[500px] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  <MarkdownEditor
                    value={generatedSummary.full_markdown}
                    readOnly={true}
                    minHeight="400px"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setGeneratedSummary(null)}
                >
                  Generate Another
                </Button>
                <Button
                  variant="outline"
                  onClick={handleViewSummary}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Full Summary
                </Button>
                <Button
                  onClick={() => router.push(`/summaries/${generatedSummary.id}/edit`)}
                >
                  <PenLine className="w-4 h-4 mr-2" />
                  Edit Summary
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 