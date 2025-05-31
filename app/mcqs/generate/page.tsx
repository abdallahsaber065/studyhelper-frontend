'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ErrorAlert } from '@/components/ui/error-alert';
import { useProtectedRoute } from '@/hooks/useAuth';
import FileSelector from '@/components/FileSelector';
import { mcqsService } from '@/services/mcqs';
import { 
  ArrowLeft, 
  Loader2,
  MessageSquare,
  Sliders,
  Plus,
  Minus,
  Check
} from 'lucide-react';
import { DifficultyLevelEnum } from '@/types/mcqs';

export default function GenerateMCQsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useProtectedRoute();
  
  const [selectedFileIds, setSelectedFileIds] = useState<number[]>([]);
  const [initialFileIds, setInitialFileIds] = useState<number[]>([]);
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevelEnum>("Medium");
  const [customInstructions, setCustomInstructions] = useState('');
  const [createQuiz, setCreateQuiz] = useState(true);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSuccess, setGenerationSuccess] = useState(false);
  const [generatedQuizId, setGeneratedQuizId] = useState<number | null>(null);
  const [error, setError] = useState<any>(null);
  const [showLoading, setShowLoading] = useState(false);

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

  const handleGenerateMCQs = async () => {
    if (selectedFileIds.length === 0) {
      setError({ message: 'Please select at least one file to generate MCQs.' });
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      
      const response = await mcqsService.generateMCQs({
        physical_file_ids: selectedFileIds,
        num_questions: numQuestions,
        difficulty_level: difficultyLevel,
        custom_instructions: customInstructions || undefined,
        create_quiz: createQuiz,
        quiz_title: quizTitle || undefined,
        quiz_description: quizDescription || undefined
      });
      
      setGenerationSuccess(true);
      
      // Assuming the response contains the generated quiz ID
      if (response && response.quiz_id) {
        setGeneratedQuizId(response.quiz_id);
      }
    } catch (error) {
      console.error('Failed to generate MCQs:', error);
      setError(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const incrementQuestions = () => {
    if (numQuestions < 60) {
      setNumQuestions(prev => prev + 1);
    }
  };

  const decrementQuestions = () => {
    if (numQuestions > 1) {
      setNumQuestions(prev => prev - 1);
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
                <MessageSquare className="w-5 h-5 text-blue-500" />
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Generate MCQs
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

          {generationSuccess ? (
            <div className="space-y-8">
              {/* Success Message */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
                      MCQs Generated Successfully!
                    </h3>
                    <p className="text-green-700 dark:text-green-400">
                      Your questions have been created{createQuiz ? ' and a quiz has been set up' : ''}.
                      You can now view or take the quiz.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setGenerationSuccess(false);
                    setGeneratedQuizId(null);
                  }}
                  className="flex-1"
                >
                  Generate More MCQs
                </Button>
                {generatedQuizId && (
                  <Button
                    onClick={() => router.push(`/mcqs/quizzes/${generatedQuizId}`)}
                    className="flex-1"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    View Quiz
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* File Selection Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Select Files
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Choose the files you want to generate MCQs from. You can select up to 5 files.
                </p>
                
                <FileSelector
                  selectedFileIds={selectedFileIds}
                  initialFileIds={initialFileIds}
                  onFileSelectionChange={setSelectedFileIds}
                  maxFiles={5}
                />
              </div>

              {/* MCQ Generation Options */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Sliders className="w-5 h-5 text-blue-500" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Generation Options
                  </h2>
                </div>
                
                <div className="space-y-6">
                  {/* Number of Questions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Number of Questions
                    </label>
                    <div className="flex items-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={decrementQuestions}
                        disabled={numQuestions <= 1}
                        className="h-9 w-9 p-0"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <input
                        type="number"
                        value={numQuestions}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value >= 1 && value <= 60) {
                            setNumQuestions(value);
                          }
                        }}
                        min={1}
                        max={60}
                        className="w-16 h-9 mx-2 text-center border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={incrementQuestions}
                        disabled={numQuestions >= 60}
                        className="h-9 w-9 p-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                        (max: 60)
                      </span>
                    </div>
                  </div>

                  {/* Difficulty Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      value={difficultyLevel}
                      onChange={(e) => setDifficultyLevel(e.target.value as DifficultyLevelEnum)}
                      className="w-full h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>

                  {/* Custom Instructions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Custom Instructions (Optional)
                    </label>
                    <Textarea
                      value={customInstructions}
                      onChange={(e) => setCustomInstructions(e.target.value)}
                      placeholder="For example: Focus on specific topics, include calculation questions, etc."
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              </div>

              {/* Quiz Options */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Quiz Options
                </h2>
                
                <div className="space-y-6">
                  {/* Create Quiz Toggle */}
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="create-quiz"
                      checked={createQuiz}
                      onChange={() => setCreateQuiz(prev => !prev)}
                      className="h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="create-quiz"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Create a quiz from generated questions
                    </label>
                  </div>

                  {/* Quiz Title & Description (only shown if creating quiz) */}
                  {createQuiz && (
                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Quiz Title (Optional)
                        </label>
                        <input
                          type="text"
                          value={quizTitle}
                          onChange={(e) => setQuizTitle(e.target.value)}
                          placeholder="Enter a title for your quiz"
                          className="w-full h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          If left blank, a title will be generated automatically.
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Quiz Description (Optional)
                        </label>
                        <Textarea
                          value={quizDescription}
                          onChange={(e) => setQuizDescription(e.target.value)}
                          placeholder="Enter a description for your quiz"
                          className="min-h-[80px]"
                        />
                      </div>
                    </div>
                  )}
                </div>
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
                  onClick={handleGenerateMCQs}
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
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Generate MCQs
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 