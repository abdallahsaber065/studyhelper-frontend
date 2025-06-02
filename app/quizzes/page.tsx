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
  Loader2,
  Plus,
  Play,
  Eye,
  ListChecks,
  Search,
  Filter,
  X,
  Clock,
  Users,
  TrendingUp,
  CalendarClock,
  AlertCircle,
  BookOpen,
  Home,
  Tag,
  Edit,
  Trash2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

export default function QuizzesPage() {
  const router = useRouter();
  const { user } = useProtectedRoute();
  const { toast } = useToast();

  // State
  const [quizzes, setQuizzes] = useState<McqQuizRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [activeSessions, setActiveSessions] = useState<Map<number, QuizSessionRead>>(new Map());

  // Filters
  const [showMyQuizzes, setShowMyQuizzes] = useState(false);
  const [showPublicQuizzes, setShowPublicQuizzes] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevelEnum | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Modal for active session
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const [activeSession, setActiveSession] = useState<QuizSessionRead | null>(null);

  // Modal for quiz deletion
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<McqQuizRead | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Load quizzes and active sessions
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        setError(null);

        const params: any = {
          skip: (page - 1) * limit,
          limit,
        };

        if (showMyQuizzes) params.my_quizzes = true;
        if (showPublicQuizzes) params.is_public = true;

        const data = await mcqsService.getQuizzes(params);

        // Filter by difficulty if selected
        const filteredData = selectedDifficulty
          ? data.filter(quiz => quiz.difficulty_level === selectedDifficulty)
          : data;

        // Filter by search query if provided
        const searchedData = searchQuery.trim()
          ? filteredData.filter(quiz =>
            quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (quiz.description && quiz.description.toLowerCase().includes(searchQuery.toLowerCase()))
          )
          : filteredData;

        setQuizzes(searchedData);

        // For pagination
        setTotalPages(Math.max(1, Math.ceil(searchedData.length / limit)));

        // Also fetch active sessions for these quizzes
        const sessions = await mcqsService.getUserSessions();
        const activeSessionsMap = new Map<number, QuizSessionRead>();

        sessions.forEach(session => {
          if (!session.completed_at) {
            activeSessionsMap.set(session.quiz_id, session);
          }
        });

        setActiveSessions(activeSessionsMap);
      } catch (err) {
        console.error('Failed to fetch quizzes:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [page, limit, showMyQuizzes, showPublicQuizzes, selectedDifficulty, searchQuery]);

  // Clear all filters
  const clearFilters = () => {
    setShowMyQuizzes(false);
    setShowPublicQuizzes(false);
    setSelectedDifficulty(null);
    setSearchQuery('');
    setPage(1);
  };

  // Start a quiz session
  const startQuizSession = async (quizId: number) => {
    try {
      // Check if there's an active session for this quiz
      const existingSession = activeSessions.get(quizId);

      if (existingSession) {
        // Show modal with options to resume or start new
        setSelectedQuizId(quizId);
        setActiveSession(existingSession);
        setShowSessionModal(true);
        return;
      }

      // No active session, start a new one
      setLoading(true);
      const session = await mcqsService.startQuizSession(quizId);
      router.push(`/quizzes/${quizId}/take?session=${session.id}`);
    } catch (err) {
      console.error('Failed to start quiz session:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle resuming a session
  const resumeSession = (sessionId: number, quizId: number) => {
    router.push(`/quizzes/${quizId}/take?session=${sessionId}`);
    setShowSessionModal(false);
  };

  // Handle starting a new session
  const startNewSession = async () => {
    if (!selectedQuizId) return;

    try {
      setLoading(true);
      setShowSessionModal(false);

      const session = await mcqsService.startQuizSession(selectedQuizId);
      router.push(`/quizzes/${selectedQuizId}/take?session=${session.id}`);
    } catch (err) {
      console.error('Failed to start new quiz session:', err);
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

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already handled in the useEffect
  };

  // Handle quiz deletion
  const handleDeleteQuiz = async () => {
    if (!quizToDelete) return;

    try {
      setDeleting(true);
      await mcqsService.deleteQuiz(quizToDelete.id);

      // Remove the deleted quiz from the list
      setQuizzes(quizzes.filter(quiz => quiz.id !== quizToDelete.id));

      // Show success message
      toast({
        title: "Quiz deleted",
        description: "The quiz has been deleted successfully.",
        variant: "success",
      });

      // Close the modal
      setShowDeleteModal(false);
      setQuizToDelete(null);
    } catch (err) {
      console.error('Failed to delete quiz:', err);
      setError(err);

      toast({
        title: "Failed to delete quiz",
        description: "There was an error deleting the quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  // Open delete confirmation modal
  const confirmDelete = (quiz: McqQuizRead) => {
    setQuizToDelete(quiz);
    setShowDeleteModal(true);
  };

  if (loading && !quizzes.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          {
            label: 'Home',
            href: '/dashboard',
            icon: <Home className="w-4 h-4" />
          },
          {
            label: 'Quizzes',
            icon: <ListChecks className="w-4 h-4" />
          }
        ]}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quizzes</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create and manage your quizzes for MCQ practice
          </p>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
          <Button asChild variant="outline">
            <Link href="/quizzes/questions" className="flex items-center">
              <BookOpen className="w-4 h-4 mr-2" />
              Manage Questions
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/quizzes/sessions" className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Quiz History
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/quizzes/generate" className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Generate Quiz
            </Link>
          </Button>
          <Button asChild>
            <Link href="/quizzes/new" className="flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Create Manually
            </Link>
          </Button>
        </div>
      </div>

      {error && <ErrorAlert error={error} />}

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center mb-4">
          <Filter className="w-5 h-5 mr-2 text-gray-400" />
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Search & Filters</h2>
          {(showMyQuizzes || showPublicQuizzes || selectedDifficulty || searchQuery) && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto text-sm text-gray-500"
              onClick={clearFilters}
            >
              <X className="w-4 h-4 mr-1" /> Clear all
            </Button>
          )}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search quizzes by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Quiz Type Filter */}
          <div className="flex flex-col space-y-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quiz Type</span>
            <div className="flex items-center space-x-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-blue-600 dark:text-blue-500"
                  checked={showMyQuizzes}
                  onChange={() => setShowMyQuizzes(!showMyQuizzes)}
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">My Quizzes</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-blue-600 dark:text-blue-500"
                  checked={showPublicQuizzes}
                  onChange={() => setShowPublicQuizzes(!showPublicQuizzes)}
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Public Quizzes</span>
              </label>
            </div>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Difficulty
            </label>
            <select
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={selectedDifficulty || ''}
              onChange={e => setSelectedDifficulty(e.target.value as DifficultyLevelEnum || null)}
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quizzes List */}
      {quizzes.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
            <ListChecks className="w-8 h-8 text-gray-500 dark:text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No quizzes found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {showMyQuizzes || showPublicQuizzes || selectedDifficulty || searchQuery
              ? 'Try changing your filters or create your own quiz.'
              : 'Get started by creating your first quiz.'}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild variant="outline">
              <Link href="/quizzes/generate" className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Generate from Files
              </Link>
            </Button>
            <Button asChild>
              <Link href="/quizzes/new" className="flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Create Manually
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map(quiz => {
            const hasActiveSession = activeSessions.has(quiz.id);

            return (
              <div
                key={quiz.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
              >
                <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center">
                    <ListChecks className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                    <h3 className="font-medium text-gray-900 dark:text-white">Quiz</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    {renderDifficultyBadge(quiz.difficulty_level)}
                    {quiz.is_public && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        Public
                      </span>
                    )}
                    {hasActiveSession && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                        <Clock className="w-3 h-3 mr-1" />
                        In Progress
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 flex-grow">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {quiz.title}
                  </h2>
                  {quiz.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {quiz.description}
                    </p>
                  )}

                  <div className="mt-4 flex space-x-3">
                    <div className="inline-flex items-center text-gray-600 dark:text-gray-400 text-sm">
                      <ListChecks className="w-4 h-4 mr-1" />
                      <span>{quiz.question_count} questions</span>
                    </div>
                    <div className="inline-flex items-center text-gray-600 dark:text-gray-400 text-sm">
                      <CalendarClock className="w-4 h-4 mr-1" />
                      <span>{new Date(quiz.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => startQuizSession(quiz.id)}
                      className="flex-1 flex items-center justify-center"
                    >
                      {hasActiveSession ? (
                        <>
                          <Clock className="w-4 h-4 mr-2" />
                          Resume Quiz
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Take Quiz
                        </>
                      )}
                    </Button>
                    <Button asChild variant="outline" className="flex items-center justify-center">
                      <Link href={`/quizzes/${quiz.id}`}>
                        <Eye className="w-4 h-4" />
                      </Link>
                    </Button>

                    {/* Show edit/delete buttons for user's own quizzes */}
                    {user && quiz.user_id === parseInt(user.id) && (
                      <>
                        <Button asChild variant="outline" className="flex items-center justify-center">
                          <Link href={`/quizzes/${quiz.id}/edit`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          className="flex items-center justify-center text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDelete(quiz);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <span className="flex items-center px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

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
                onClick={() => resumeSession(activeSession.id, activeSession.quiz_id)}
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

      {/* Add Delete Confirmation Modal at the end */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Quiz</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{quizToDelete?.title}"? This action cannot be undone.
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
    </div>
  );
} 