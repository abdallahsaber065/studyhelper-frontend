'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ErrorAlert } from '@/components/ui/error-alert';
import { useProtectedRoute } from '@/hooks/useAuth';
import FileSelector from '@/components/FileSelector';
import { mcqsService, quizzesService } from '@/services/mcqs';
import {
  ArrowLeft,
  Loader2,
  MessageSquare,
  Sliders,
  Plus,
  Minus,
  Check,
  FileText,
  HelpCircle,
  Brain,
  BrainCircuit,
  Sparkles,
  BarChart3,
  AlertTriangle,
  Info,
  ListChecks
} from 'lucide-react';
import { DifficultyLevelEnum } from '@/types/mcqs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [generationProgress, setGenerationProgress] = useState(0); // 0-100

  // Generation time estimates based on file count and question number
  const estimatedTime = React.useMemo(() => {
    const baseTime = 15; // base seconds
    const fileMultiplier = selectedFileIds.length * 5;
    const questionMultiplier = numQuestions * 0.5;
    return Math.round(baseTime + fileMultiplier + questionMultiplier);
  }, [selectedFileIds.length, numQuestions]);

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

  // Simulate progress during generation
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isGenerating) {
      setGenerationProgress(0);
      interval = setInterval(() => {
        setGenerationProgress(prev => {
          // Slowly increase up to 95%, the final 5% will be set when complete
          const increment = Math.random() * 5 + 1;
          const newProgress = prev + increment;
          return newProgress >= 95 ? 95 : newProgress;
        });
      }, 1000);
    } else if (generationSuccess) {
      setGenerationProgress(100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating, generationSuccess]);

  const handleGenerateMCQs = async () => {
    if (selectedFileIds.length === 0) {
      setError({ message: 'Please select at least one file to generate MCQs.' });
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);

      const response = await quizzesService.generateQuiz({
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
      if (response && response.id) {
        setGeneratedQuizId(response.id);
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

  const renderDifficultyIcon = (difficulty: DifficultyLevelEnum) => {
    switch (difficulty) {
      case 'Easy':
        return <Sparkles className="w-4 h-4 text-green-500" />;
      case 'Medium':
        return <BarChart3 className="w-4 h-4 text-yellow-500" />;
      case 'Hard':
        return <BrainCircuit className="w-4 h-4 text-red-500" />;
      default:
        return null;
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
                <Link href="/quizzes" className="flex items-center space-x-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Quizzes</span>
                </Link>
              </Button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-blue-500" />
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  AI Quiz Generator
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

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <Info className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  About Quiz Generation
                </h3>
                <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                  Our AI will analyze your selected files and generate multiple-choice questions based on the content.
                  Select up to 5 files, choose your difficulty level, and customize your generation options.
                </p>
              </div>
            </div>
          </div>

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
                      Quiz Generated Successfully!
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
                  Generate More Quizzes
                </Button>
                {generatedQuizId && (
                  <>
                    <Button
                      onClick={() => router.push(`/quizzes/${generatedQuizId}`)}
                      className="flex-1"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      View Quiz
                    </Button>
                    <Button
                      onClick={() => router.push(`/quizzes/${generatedQuizId}/take`)}
                      variant="secondary"
                      className="flex-1"
                    >
                      <ListChecks className="w-4 h-4 mr-2" />
                      Take Quiz Now
                    </Button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Generation Process Steps */}
              <div className="flex items-center justify-between mb-2 px-2">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedFileIds.length > 0 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">Select Files</span>
                </div>
                <div className="flex-1 h-1 mx-2 bg-gray-200 dark:bg-gray-700">
                  <div className={`h-1 ${selectedFileIds.length > 0 ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`} style={{ width: selectedFileIds.length > 0 ? '100%' : '0%' }}></div>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${numQuestions > 0 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                    <Sliders className="w-5 h-5" />
                  </div>
                  <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">Configure</span>
                </div>
                <div className="flex-1 h-1 mx-2 bg-gray-200 dark:bg-gray-700">
                  <div className={`h-1 ${isGenerating || generationSuccess ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`} style={{ width: isGenerating || generationSuccess ? '100%' : '0%' }}></div>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${generationSuccess ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                    <Brain className="w-5 h-5" />
                  </div>
                  <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">Generate</span>
                </div>
              </div>

              {/* File Selection Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <FileText className="w-5 h-5 text-blue-500 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Select Files
                  </h2>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="ml-2 h-6 w-6">
                          <HelpCircle className="h-4 w-4 text-gray-400" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-sm">
                        <p>Select up to 5 files for the AI to analyze and generate questions from. More files and varied content will result in more diverse questions.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className={`rounded-lg border ${selectedFileIds.length > 0 ? 'border-blue-200 dark:border-blue-900/50' : 'border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-900/10'} p-4 mb-4`}>
                  {selectedFileIds.length === 0 ? (
                    <div className="flex items-center">
                      <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
                      <p className="text-sm text-amber-800 dark:text-amber-400">
                        Please select at least one file to generate questions from.
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-2" />
                      <p className="text-sm text-green-800 dark:text-green-400">
                        {selectedFileIds.length} {selectedFileIds.length === 1 ? 'file' : 'files'} selected
                      </p>
                    </div>
                  )}
                </div>

                <FileSelector
                  selectedFileIds={selectedFileIds}
                  initialFileIds={initialFileIds}
                  onFileSelectionChange={setSelectedFileIds}
                  maxFiles={5}
                />
              </div>

              {/* MCQ Generation Options */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <Sliders className="w-5 h-5 text-blue-500 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Generation Options
                  </h2>
                </div>

                <div className="space-y-6">
                  {/* Number of Questions */}
                  <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 items-center">
                      Number of Questions
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="ml-2 h-6 w-6">
                              <HelpCircle className="h-4 w-4 text-gray-400" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>More questions will result in more comprehensive coverage of the material but will take longer to generate.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
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
                  <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 items-center">
                      Difficulty Level
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="ml-2 h-6 w-6">
                              <HelpCircle className="h-4 w-4 text-gray-400" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p><strong>Easy:</strong> Basic recall and understanding questions<br />
                              <strong>Medium:</strong> Application and analysis questions<br />
                              <strong>Hard:</strong> Evaluation and synthesis questions</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['Easy', 'Medium', 'Hard'].map((level) => (
                        <Button
                          key={level}
                          type="button"
                          variant={difficultyLevel === level ? "default" : "outline"}
                          className={`flex items-center justify-center ${difficultyLevel === level
                              ? level === 'Easy'
                                ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/40'
                                : level === 'Medium'
                                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/40'
                                  : 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/40'
                              : ''
                            }`}
                          onClick={() => setDifficultyLevel(level as DifficultyLevelEnum)}
                        >
                          {renderDifficultyIcon(level as DifficultyLevelEnum)}
                          <span className="ml-2">{level}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Instructions */}
                  <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 items-center">
                      Custom Instructions (Optional)
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="ml-2 h-6 w-6">
                              <HelpCircle className="h-4 w-4 text-gray-400" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs">
                            <p>Add specific requirements for the AI to consider when generating questions. For example, "Focus on concepts from chapters 3-5" or "Include questions about formulas and calculations".</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
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
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <ListChecks className="w-5 h-5 text-blue-500 mr-2" />
                  Quiz Options
                </h2>

                <div className="space-y-6">
                  {/* Create Quiz Toggle */}
                  <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
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
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 ml-7">
                      If unchecked, questions will be generated but not organized into a quiz.
                    </p>
                  </div>

                  {/* Quiz Title & Description (only shown if creating quiz) */}
                  {createQuiz && (
                    <div className="space-y-4 bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
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
                          If left blank, a title will be generated automatically based on your content.
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

              {/* Estimated Time Info */}
              {selectedFileIds.length > 0 && !isGenerating && (
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <Info className="h-5 w-5 text-blue-500 mr-2" />
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      Estimated generation time: <span className="font-medium">{estimatedTime} seconds</span> for {numQuestions} {numQuestions === 1 ? 'question' : 'questions'} from {selectedFileIds.length} {selectedFileIds.length === 1 ? 'file' : 'files'}.
                    </p>
                  </div>
                </div>
              )}

              {/* Generation Progress */}
              {isGenerating && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <Brain className="w-5 h-5 text-blue-500 mr-2 animate-pulse" />
                    Generating Quiz
                  </h3>

                  <div className="space-y-4">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                        style={{ width: `${generationProgress}%` }}
                      ></div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                      Analyzing content and creating {numQuestions} {difficultyLevel.toLowerCase()}-level questions...
                    </p>

                    <div className="flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => router.push('/quizzes')}
                  disabled={isGenerating}
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
                      <Brain className="w-4 h-4 mr-2" />
                      Generate Quiz
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