'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ErrorAlert } from '@/components/ui/alert';
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
  Eye,
  Trash2,
  Edit
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function QuizDetailsPage({ params }: { params: Promise<{ quizId: string }> }) {
  const router = useRouter();
  const { user } = useProtectedRoute();

  const [quiz, setQuiz] = useState<McqQuizRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingSession, setStartingSession] = useState(false);
  const [error, setError] = useState<any>(null);
  const [activeSession, setActiveSession] = useState<QuizSessionRead | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { quizId } = use(params);
  const parsedQuizId = parseInt(quizId, 10);
  // Add a state to store user's attempts
  const [attempts, setAttempts] = useState<QuizSessionRead[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  // Load quiz details and user attempts
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        setError(null);
        // Convert params.quizId to a number safely
        if (isNaN(parsedQuizId)) {
          throw new Error("Invalid quiz ID");
        }
        const data = await mcqsService.getQuizById(parsedQuizId);
        setQuiz(data);

        // Check for active session for this quiz
        const session = await mcqsService.getActiveSessionForQuiz(parsedQuizId);
        setActiveSession(session);

        // Fetch user's attempts for this quiz
        setLoadingAttempts(true);
        const sessions = await mcqsService.getUserSessions();
        const quizAttempts = sessions.filter(s => s.quiz_id === parsedQuizId);
        setAttempts(quizAttempts);
        setLoadingAttempts(false);
      } catch (err) {
        console.error('Failed to fetch quiz:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [parsedQuizId]);

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
      router.push(`/quizzes/${quiz.id}/take?session=${session.id}`);
    } catch (err) {
      console.error('Failed to start quiz session:', err);
      setError(err);
      setStartingSession(false);
    }
  };

  // Resume an existing session
  const resumeSession = () => {
    if (!activeSession || !quiz) return;

    router.push(`/quizzes/${quiz.id}/take?session=${activeSession.id}`);
    setShowSessionModal(false);
  };

  // Start a new session and abandon the existing one
  const startNewSession = async () => {
    if (!quiz) return;

    try {
      setStartingSession(true);
      setShowSessionModal(false);

      const session = await mcqsService.startQuizSession(quiz.id);
      router.push(`/quizzes/${quiz.id}/take?session=${session.id}`);
    } catch (err) {
      console.error('Failed to start new quiz session:', err);
      setError(err);
      setStartingSession(false);
    }
  };

  // Handle quiz deletion
  const handleDeleteQuiz = async () => {
    if (!quiz) return;

    try {
      setDeleting(true);
      await mcqsService.deleteQuiz(quiz.id);
      router.push('/quizzes');
    } catch (err) {
      console.error('Failed to delete quiz:', err);
      setError(err);
      setDeleting(false);
      setShowDeleteModal(false);
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
            <Link href="/quizzes">Back to Quizzes</Link>
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
            <Link href="/quizzes">Back to Quizzes</Link>
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
            label: 'Quizzes',
            href: '/quizzes',
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
          <Link href="/quizzes">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quizzes
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/quizzes/sessions">
            <Clock className="w-4 h-4 mr-2" />
            Quiz History
          </Link>
        </Button>
        {quiz.user_id === parseInt(user?.id ?? '') && (
          <>
            <Button asChild variant="outline" size="sm">
              <Link href={`/quizzes/${quiz.id}/edit`}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Quiz
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Quiz
            </Button>
          </>
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
                <Link href="/quizzes" className="w-full md:w-auto">
                  Browse More Quizzes
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* User Attempts Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mt-6">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <ListChecks className="w-5 h-5 mr-2 text-blue-500" />
            Your Attempts
          </h2>
        </div>

        <div className="px-6 py-4">
          {loadingAttempts ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : attempts.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500 dark:text-gray-400">You haven't attempted this quiz yet.</p>
              <Button onClick={startQuizSession} className="mt-4">
                <Play className="w-4 h-4 mr-2" />
                Start Quiz
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {attempts.map((attempt) => (
                <div key={attempt.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <div className="flex items-center mb-1">
                      <CalendarClock className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {new Date(attempt.started_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      {attempt.completed_at ? (
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      ) : (
                        <Clock className="w-4 h-4 mr-2 text-amber-500" />
                      )}
                      <span className="text-sm font-medium">
                        {attempt.completed_at ? 'Completed' : 'In Progress'}
                        {attempt.score !== null && attempt.score !== undefined && attempt.completed_at && attempt.total_questions && (
                          <span className="ml-2 text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-2.5 py-0.5 rounded-full">
                            Score: {Math.round((attempt.score / attempt.total_questions) * 100)}%
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (attempt.completed_at) {
                        // View results
                        router.push(`/quizzes/${quiz.id}/take?session=${attempt.id}`);
                      } else {
                        // Continue session
                        router.push(`/quizzes/${quiz.id}/take?session=${attempt.id}`);
                      }
                    }}
                  >
                    {attempt.completed_at ? (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        View Results
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 mr-2" />
                        Continue
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Quiz Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Quiz</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this quiz? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteQuiz}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Quiz
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Active Session Modal */}
      <Dialog open={showSessionModal} onOpenChange={setShowSessionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quiz in Progress</DialogTitle>
            <DialogDescription>
              You already have an active session for this quiz.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm">
                Started on {activeSession ? new Date(activeSession.started_at).toLocaleString() : 'N/A'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <ListChecks className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm">
                {activeSession?.answers_json?.length || 0} of {activeSession?.total_questions || 0} questions answered
              </span>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={resumeSession}
            >
              <Clock className="w-4 h-4 mr-2" />
              Continue Session
            </Button>
            <Button
              variant="outline"
              className="flex-1 sm:flex-none text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={async () => {
                try {
                  if (activeSession) {
                    await mcqsService.deleteSession(activeSession.id);
                    setActiveSession(null);
                    setShowSessionModal(false);

                    // Start a new session
                    startNewSession();
                  }
                } catch (err) {
                  console.error('Failed to delete session:', err);
                  setError(err);
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete & Start New
            </Button>
            <Button
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={() => setShowSessionModal(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 