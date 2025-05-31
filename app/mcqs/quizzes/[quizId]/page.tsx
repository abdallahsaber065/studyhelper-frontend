'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ErrorAlert } from '@/components/ui/error-alert';
import { useProtectedRoute } from '@/hooks/useAuth';
import { mcqsService } from '@/services/mcqs';
import { McqQuizRead, DifficultyLevelEnum, QuizSessionRead } from '@/types/mcqs';
import { Breadcrumb } from '@/components/ui/breadcrumb';
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
  ChevronRight,
  BookOpen,
  Eye
} from 'lucide-react';

export default function QuizDetailsPage({ params }: { params: { quizId: string } }) {
  const router = useRouter();
  const { user } = useProtectedRoute();
  
  const [quiz, setQuiz] = useState<McqQuizRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingSession, setStartingSession] = useState(false);
  const [error, setError] = useState<any>(null);
  const [activeSession, setActiveSession] = useState<QuizSessionRead | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);

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
        
        // Check for active session for this quiz
        const session = await mcqsService.getActiveSessionForQuiz(quizId);
        setActiveSession(session);
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
    
    // If there's an active session, ask the user if they want to resume it
    if (activeSession) {
      setShowSessionModal(true);
      return;
    }
    
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
  
  // Resume an existing session
  const resumeSession = () => {
    if (!activeSession || !quiz) return;
    
    router.push(`/mcqs/quizzes/${quiz.id}/take?session=${activeSession.id}`);
    setShowSessionModal(false);
  };
  
  // Start a new session and abandon the existing one
  const startNewSession = async () => {
    if (!quiz) return;
    
    try {
      setStartingSession(true);
      setShowSessionModal(false);
      
      const session = await mcqsService.startQuizSession(quiz.id);
      router.push(`/mcqs/quizzes/${quiz.id}/take?session=${session.id}`);
    } catch (err) {
      console.error('Failed to start new quiz session:', err);
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
      <Breadcrumb
        items={[
          {
            label: 'MCQs',
            href: '/mcqs/questions',
            icon: <BookOpen className="w-4 h-4" />
          },
          {
            label: 'Quizzes',
            href: '/mcqs/quizzes',
            icon: <ListChecks className="w-4 h-4" />
          },
          {
            label: quiz.title,
            icon: <Eye className="w-4 h-4" />
          }
        ]}
      />

      <div className="flex flex-wrap gap-4 mb-6">
        <Button asChild variant="outline" size="sm">
          <Link href="/mcqs/quizzes">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quizzes
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/mcqs/sessions">
            <Clock className="w-4 h-4 mr-2" />
            Quiz History
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
            {activeSession && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-200 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                <Clock className="w-4 h-4 mr-1.5" />
                In Progress
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
                ) : activeSession ? (
                  <Clock className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
                {startingSession ? "Starting..." : activeSession ? "Resume Quiz" : "Take Quiz"}
              </Button>
              
              <Button asChild variant="outline">
                <Link href="/mcqs/quizzes" className="w-full md:w-auto">
                  Browse More Quizzes
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Active Session Modal */}
      {showSessionModal && activeSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="mb-4 flex items-center justify-center">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
              Active Quiz Session Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
              You have an in-progress quiz session for this quiz. Would you like to resume it or start a new one?
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button 
                onClick={resumeSession}
                className="flex-1 flex items-center justify-center"
              >
                <Clock className="w-4 h-4 mr-2" />
                Resume Session
              </Button>
              <Button 
                onClick={startNewSession}
                variant="outline" 
                className="flex-1 flex items-center justify-center"
              >
                <Play className="w-4 h-4 mr-2" />
                Start New Session
              </Button>
            </div>
            <div className="mt-4 text-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowSessionModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 