'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ErrorAlert } from '@/components/ui/error-alert';
import { useProtectedRoute } from '@/hooks/useAuth';
import { mcqsService } from '@/services/mcqs';
import { McqQuizRead, DifficultyLevelEnum } from '@/types/mcqs';
import {
  ArrowLeft,
  Loader2,
  Play,
  ListChecks,
  Calendar,
  Users,
  Clock,
  LucideIcon,
  CalendarClock,
  Tag,
  CheckCircle,
  AlertCircle,
  Home,
  ChevronRight
} from 'lucide-react';

export default function QuizDetailsPage({ params }: { params: { quizId: string } }) {
  const router = useRouter();
  const { user } = useProtectedRoute();
  
  const [quiz, setQuiz] = useState<McqQuizRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingSession, setStartingSession] = useState(false);
  const [error, setError] = useState<any>(null);

  // Load quiz details
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        setError(null);
        // Convert params.quizId to a number safely
        const quizId = parseInt(params.quizId, 10);
        if (isNaN(quizId)) {
          throw new Error("Invalid quiz ID");
        }
        const data = await mcqsService.getQuizById(quizId);
        setQuiz(data);
      } catch (err) {
        console.error('Failed to fetch quiz:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuiz();
  }, [params.quizId]);

  // Start a quiz session
  const startQuizSession = async () => {
    if (!quiz) return;
    
    try {
      setStartingSession(true);
      const session = await mcqsService.startQuizSession(quiz.id);
      router.push(`/mcqs/quizzes/${quiz.id}/take?session=${session.id}`);
    } catch (err) {
      console.error('Failed to start quiz session:', err);
      setError(err);
      setStartingSession(false);
    }
  };

  // Render difficulty badge with appropriate color
  const renderDifficultyBadge = (difficulty: DifficultyLevelEnum) => {
    let colorClass = '';
    let Icon: LucideIcon = AlertCircle;
    
    switch (difficulty) {
      case 'Easy':
        colorClass = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        Icon = CheckCircle;
        break;
      case 'Medium':
        colorClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        Icon = AlertCircle;
        break;
      case 'Hard':
        colorClass = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        Icon = AlertCircle;
        break;
    }
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
        <Icon className="w-4 h-4 mr-1.5" />
        {difficulty}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
            <Link href="/mcqs/quizzes">Back to Quizzes</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Quiz Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The quiz you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button asChild>
            <Link href="/mcqs/quizzes">Back to Quizzes</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb navigation */}
      <nav className="mb-6">
        <ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <li>
            <Link href="/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center">
              <Home className="w-4 h-4 mr-1" />
              Dashboard
            </Link>
          </li>
          <li className="flex items-center">
            <ChevronRight className="w-4 h-4 mx-1" />
            <Link href="/mcqs/quizzes" className="hover:text-blue-600 dark:hover:text-blue-400">
              Quizzes
            </Link>
          </li>
          <li className="flex items-center">
            <ChevronRight className="w-4 h-4 mx-1" />
            <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px]">
              {quiz.title}
            </span>
          </li>
        </ol>
      </nav>

      <div className="flex flex-wrap gap-4 mb-6">
        <Button asChild variant="outline" size="sm">
          <Link href="/mcqs/quizzes">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quizzes
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard">
            <Home className="w-4 h-4 mr-2" />
            Dashboard
          </Link>
        </Button>
        {quiz.user_id === parseInt(user?.id ?? '') && (
          <Button asChild variant="outline" size="sm">
            <Link href={`/mcqs/quizzes/${quiz.id}/edit`}>
              <Tag className="w-4 h-4 mr-2" />
              Edit Quiz
            </Link>
          </Button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {/* Quiz Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 px-6 py-6 text-white">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            {renderDifficultyBadge(quiz.difficulty_level)}
            {quiz.is_public && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-200 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                <Users className="w-4 h-4 mr-1.5" />
                Public
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold mb-4">{quiz.title}</h1>
          {quiz.description && (
            <p className="text-blue-100 dark:text-blue-200 mb-4">{quiz.description}</p>
          )}
          
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="inline-flex items-center text-sm text-blue-100">
              <ListChecks className="w-4 h-4 mr-1.5" />
              {quiz.question_count} Questions
            </div>
            <div className="inline-flex items-center text-sm text-blue-100">
              <CalendarClock className="w-4 h-4 mr-1.5" />
              Created: {new Date(quiz.created_at).toLocaleDateString()}
            </div>
            <div className="inline-flex items-center text-sm text-blue-100">
              <Clock className="w-4 h-4 mr-1.5" />
              Estimated time: {Math.max(5, quiz.question_count * 1.5)} minutes
            </div>
          </div>
        </div>

        {/* Quiz Info & Actions */}
        <div className="px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <h2 className="text-xl font-semibold mb-2">About this Quiz</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {quiz.description || `A ${quiz.difficulty_level.toLowerCase()} difficulty quiz with ${quiz.question_count} questions.`}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={startQuizSession} 
                disabled={startingSession}
                size="lg"
                className="w-full md:w-auto flex items-center justify-center gap-2"
              >
                {startingSession ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
                {startingSession ? "Starting..." : "Take Quiz"}
              </Button>
              
              <Button asChild variant="outline">
                <Link href="/mcqs/sessions" className="flex items-center gap-2">
                  <ListChecks className="w-4 h-4" />
                  View My History
                </Link>
              </Button>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h2 className="text-xl font-semibold mb-4">
              <div className="flex items-center">
                <ListChecks className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                What to Expect
              </div>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Format</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Multiple choice questions with single correct answers.
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Duration</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  No time limit. Take as long as you need to complete.
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Results</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Immediate feedback and score upon completion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 