'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ErrorAlert } from '@/components/ui/alert';
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
  Trash2,
  Sparkles,
  BarChart3,
  ArrowUpDown,
  Info,
  Bookmark,
  Star,
  BrainCircuit,
  Check
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { WelcomeDialog } from '@/components/ui/welcome-dialog';

export default function QuizzesPage() {
  const router = useRouter();
  const { user } = useProtectedRoute();
  const { toast } = useToast();

  // State
  const [quizzes, setQuizzes] = useState<McqQuizRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [activeSessions, setActiveSessions] = useState<Map<number, QuizSessionRead>>(new Map());
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    inProgress: 0,
    completed: 0
  });

  // Filters
  const [showMyQuizzes, setShowMyQuizzes] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevelEnum | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<string>('newest');

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

        // Sort quizzes based on selected option
        const sortedData = [...searchedData].sort((a, b) => {
          switch (sortOption) {
            case 'newest':
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            case 'oldest':
              return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            case 'title-asc':
              return a.title.localeCompare(b.title);
            case 'title-desc':
              return b.title.localeCompare(a.title);
            case 'questions-desc':
              return b.question_count - a.question_count;
            case 'questions-asc':
              return a.question_count - b.question_count;
            default:
              return 0;
          }
        });

        setQuizzes(sortedData);

        // For pagination
        setTotalPages(Math.max(1, Math.ceil(searchedData.length / limit)));

        // Also fetch active sessions for these quizzes
        const sessions = await mcqsService.getUserSessions();
        const activeSessionsMap = new Map<number, QuizSessionRead>();
        let inProgressCount = 0;
        let completedCount = 0;

        sessions.forEach(session => {
          if (!session.completed_at) {
            activeSessionsMap.set(session.quiz_id, session);
            inProgressCount++;
          } else {
            completedCount++;
          }
        });

        setActiveSessions(activeSessionsMap);

        // Update stats
        setStats({
          totalQuizzes: data.length,
          inProgress: inProgressCount,
          completed: completedCount
        });
      } catch (err) {
        console.error('Failed to fetch quizzes:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [page, limit, showMyQuizzes, selectedDifficulty, searchQuery, sortOption]);

  // Clear all filters
  const clearFilters = () => {
    setShowMyQuizzes(true);
    setSelectedDifficulty(null);
    setSearchQuery('');
    setSortOption('newest');
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
    let icon = null;

    switch (difficulty) {
      case 'Easy':
        colorClass = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        icon = <Sparkles className="w-3 h-3 mr-1" />;
        break;
      case 'Medium':
        colorClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        icon = <BarChart3 className="w-3 h-3 mr-1" />;
        break;
      case 'Hard':
        colorClass = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        icon = <BrainCircuit className="w-3 h-3 mr-1" />;
        break;
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {icon}
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
      {/* Welcome Dialog for first-time users */}
      <WelcomeDialog id="quizzes-main" />

      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          {
            label: 'Quizzes',
            icon: <ListChecks className="w-4 h-4" />
          }
        ]}
      />

      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quizzes</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create and manage your quizzes for MCQ practice
          </p>
        </div>
      </div>

      {error && <ErrorAlert error={error} />}

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-blue-100 dark:border-blue-900/30">
          <div className="flex items-center">
            <div className="rounded-full p-3 bg-blue-100 dark:bg-blue-900/30">
              <ListChecks className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Quizzes</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalQuizzes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-amber-100 dark:border-amber-900/30">
          <div className="flex items-center">
            <div className="rounded-full p-3 bg-amber-100 dark:bg-amber-900/30">
              <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-green-100 dark:border-green-900/30">
          <div className="flex items-center">
            <div className="rounded-full p-3 bg-green-100 dark:bg-green-900/30">
              <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 mb-6 border border-blue-100 dark:border-blue-900/20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-medium text-blue-800 dark:text-blue-300 flex items-center">
            <Sparkles className="mr-2 h-5 w-5" />
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="bg-white dark:bg-gray-800">
              <Link href="/quizzes/questions">
                <BookOpen className="w-4 h-4 mr-2" />
                Questions
              </Link>
            </Button>
            <Button asChild variant="outline" className="bg-white dark:bg-gray-800">
              <Link href="/quizzes/sessions">
                <Clock className="w-4 h-4 mr-2" />
                History
              </Link>
            </Button>
            <Button asChild variant="outline" className="bg-white dark:bg-gray-800">
              <Link href="/quizzes/tags">
                <Tag className="w-4 h-4 mr-2" />
                Tags
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/quizzes/generate">
                <TrendingUp className="w-4 h-4 mr-2" />
                Generate Quiz
              </Link>
            </Button>
            <Button asChild>
              <Link href="/quizzes/new">
                <Plus className="w-4 h-4 mr-2" />
                Create Quiz
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center mb-4">
          <Filter className="w-5 h-5 mr-2 text-gray-400" />
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Search & Filters</h2>
          {(showMyQuizzes || selectedDifficulty || searchQuery || sortOption !== 'newest') && (
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Quiz Type Filter */}
          <div className="flex flex-col space-y-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quiz Type</span>
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-blue-600 dark:text-blue-500"
                  checked={showMyQuizzes}
                  onChange={() => setShowMyQuizzes(!showMyQuizzes)}
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">My Quizzes Only</span>
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

          {/* Sort Order */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
              <ArrowUpDown className="w-4 h-4 mr-1" />
              Sort By
            </label>
            <select
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={sortOption}
              onChange={e => setSortOption(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
              <option value="questions-desc">Most Questions</option>
              <option value="questions-asc">Fewest Questions</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quizzes List */}
      {quizzes.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <ListChecks className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No quizzes found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            {showMyQuizzes || selectedDifficulty || searchQuery
              ? 'Try changing your filters or create your own quiz.'
              : 'Get started by creating your first quiz or generating one from your files.'}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild variant="outline" className="flex items-center">
              <Link href="/quizzes/generate">
                <TrendingUp className="w-4 h-4 mr-2" />
                Generate from Files
              </Link>
            </Button>
            <Button asChild className="flex items-center">
              <Link href="/quizzes/new">
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
            const isUserQuiz = user && quiz.user_id === parseInt(user.id);

            return (
              <div
                key={quiz.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1 flex flex-col h-full"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="rounded-full p-2 bg-blue-100 dark:bg-blue-900/30">
                      <ListChecks className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-medium text-gray-900 dark:text-white ml-2">Quiz</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    {renderDifficultyBadge(quiz.difficulty_level)}
                    {isUserQuiz && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                              <Bookmark className="w-3 h-3 mr-1" />
                              Mine
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>You created this quiz</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {hasActiveSession && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                              <Clock className="w-3 h-3 mr-1" />
                              Active
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>You have an active session for this quiz</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>

                <div className="p-5 flex-grow">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {quiz.title}
                  </h2>
                  {quiz.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 text-sm">
                      {quiz.description}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-y-2 gap-x-3">
                    <div className="inline-flex items-center text-gray-600 dark:text-gray-400 text-sm">
                      <ListChecks className="w-4 h-4 mr-1 text-blue-500" />
                      <span>{quiz.question_count} questions</span>
                    </div>
                    <div className="inline-flex items-center text-gray-600 dark:text-gray-400 text-sm">
                      <CalendarClock className="w-4 h-4 mr-1 text-blue-500" />
                      <span>{new Date(quiz.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => startQuizSession(quiz.id)}
                      className="flex-1 flex items-center justify-center"
                      size="sm"
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

                    <div className="flex gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button asChild variant="outline" size="icon" className="h-9 w-9">
                              <Link href={`/quizzes/${quiz.id}`}>
                                <Eye className="w-4 h-4" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View quiz details</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {/* Show edit/delete buttons for user's own quizzes */}
                      {isUserQuiz && (
                        <>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button asChild variant="outline" size="icon" className="h-9 w-9">
                                  <Link href={`/quizzes/${quiz.id}/edit`}>
                                    <Edit className="w-4 h-4" />
                                  </Link>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit quiz</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-9 w-9 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    confirmDelete(quiz);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete quiz</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </>
                      )}
                    </div>
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