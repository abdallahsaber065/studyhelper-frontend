'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ErrorAlert } from '@/components/ui/error-alert';
import { useProtectedRoute } from '@/hooks/useAuth';
import { mcqsService } from '@/services/mcqs';
import { McqQuestionRead, DifficultyLevelEnum } from '@/types/mcqs';
import { ArrowLeft, Edit, Trash2, Tag, Check, X } from 'lucide-react';

export default function QuestionDetailsPage({ params }: { params: Promise<{ questionId: string }> }) {
  const router = useRouter();
  const { questionId} = use(params);
  const parsedId = parseInt(questionId);
  const [question, setQuestion] = useState<McqQuestionRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  // Load question details
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (isNaN(parsedId)) {
          throw new Error("Invalid question ID");
        }
        
        const data = await mcqsService.getQuestionById(parsedId);
        setQuestion(data);
      } catch (err) {
        console.error('Failed to fetch question:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestion();
  }, [parsedId]);

  // Handle deleting the question
  const handleDelete = async () => {
    if (!question) return;
    
    if (!confirm('Are you sure you want to delete this question?')) {
      return;
    }
    
    try {
      setLoading(true);
      await mcqsService.deleteQuestion(question.id);
      router.push('/mcqs/questions');
    } catch (err) {
      console.error('Failed to delete question:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Render difficulty badge with appropriate color
  const renderDifficultyBadge = (difficulty: DifficultyLevelEnum) => {
    let colorClass = '';
    switch (difficulty) {
      case 'Easy':
        colorClass = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        break;
      case 'Medium':
        colorClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        break;
      case 'Hard':
        colorClass = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        break;
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {difficulty}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="loader"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorAlert error={error} />
        <div className="mt-4">
          <Button asChild variant="ghost">
            <Link href="/mcqs/questions">Back to Questions</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Question Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The question you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button asChild>
            <Link href="/mcqs/questions">Back to Questions</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div className="flex items-center mb-4 sm:mb-0">
          <Button asChild variant="ghost" className="mr-4">
            <Link href="/mcqs/questions">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Questions
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Question Details</h1>
        </div>
        <div className="flex space-x-3">
          <Button asChild variant="outline">
            <Link href={`/mcqs/questions/${question.id}/edit`} className="flex items-center">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete} className="flex items-center">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {/* Question Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            {renderDifficultyBadge(question.difficulty_level)}
            {question.tags.length > 0 && (
              <div className="flex items-center">
                <Tag className="w-4 h-4 mr-1 text-gray-400" />
                <div className="flex flex-wrap gap-1">
                  {question.tags.map(tag => (
                    <span key={tag.id} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{question.question_text}</h2>
        </div>

        {/* Options */}
        <div className="px-6 py-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Options</h3>
          <div className="space-y-3">
            <div className={`p-3 rounded-lg border ${question.correct_option === 'A' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${question.correct_option === 'A' ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                  {question.correct_option === 'A' ? <Check className="w-4 h-4" /> : 'A'}
                </div>
                <span className={`${question.correct_option === 'A' ? 'text-green-800 dark:text-green-400 font-medium' : 'text-gray-800 dark:text-gray-300'}`}>
                  {question.option_a}
                </span>
              </div>
            </div>
            
            <div className={`p-3 rounded-lg border ${question.correct_option === 'B' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${question.correct_option === 'B' ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                  {question.correct_option === 'B' ? <Check className="w-4 h-4" /> : 'B'}
                </div>
                <span className={`${question.correct_option === 'B' ? 'text-green-800 dark:text-green-400 font-medium' : 'text-gray-800 dark:text-gray-300'}`}>
                  {question.option_b}
                </span>
              </div>
            </div>
            
            {question.option_c && (
              <div className={`p-3 rounded-lg border ${question.correct_option === 'C' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${question.correct_option === 'C' ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                    {question.correct_option === 'C' ? <Check className="w-4 h-4" /> : 'C'}
                  </div>
                  <span className={`${question.correct_option === 'C' ? 'text-green-800 dark:text-green-400 font-medium' : 'text-gray-800 dark:text-gray-300'}`}>
                    {question.option_c}
                  </span>
                </div>
              </div>
            )}
            
            {question.option_d && (
              <div className={`p-3 rounded-lg border ${question.correct_option === 'D' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${question.correct_option === 'D' ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                    {question.correct_option === 'D' ? <Check className="w-4 h-4" /> : 'D'}
                  </div>
                  <span className={`${question.correct_option === 'D' ? 'text-green-800 dark:text-green-400 font-medium' : 'text-gray-800 dark:text-gray-300'}`}>
                    {question.option_d}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Explanation & Hint */}
        {(question.explanation || question.hint) && (
          <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
            {question.explanation && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Explanation</h3>
                <p className="text-gray-700 dark:text-gray-300">{question.explanation}</p>
              </div>
            )}
            {question.hint && (
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Hint</h3>
                <p className="text-gray-700 dark:text-gray-300">{question.hint}</p>
              </div>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-6 py-4">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
            <div>Created: {new Date(question.created_at).toLocaleDateString()}</div>
            <div>Updated: {new Date(question.updated_at).toLocaleDateString()}</div>
            <div>ID: {question.id}</div>
          </div>
        </div>
      </div>
    </div>
  );
} 