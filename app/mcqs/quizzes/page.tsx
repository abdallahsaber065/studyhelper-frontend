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
  CalendarClock
} from 'lucide-react';

export default function QuizzesPage() {
  const router = useRouter();
  const { user } = useProtectedRoute();

  // State
  const [quizzes, setQuizzes] = useState<McqQuizRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  // Filters
  const [showMyQuizzes, setShowMyQuizzes] = useState(false);
  const [showPublicQuizzes, setShowPublicQuizzes] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevelEnum | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Load quizzes
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
      setLoading(true);
      const session = await mcqsService.startQuizSession(quizId);
      router.push(`/mcqs/quizzes/${quizId}/take?session=${session.id}`);
    } catch (err) {
      console.error('Failed to start quiz session:', err);
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

  if (loading && !quizzes.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quizzes</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Browse and take quizzes to test your knowledge
          </p>
        </div>
        <Button asChild className="mt-4 sm:mt-0">
          <Link href="/mcqs/quizzes/new" className="flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Create Quiz
          </Link>
        </Button>
      </div>

      {error && <ErrorAlert error={error} className="mb-6" />}

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
            {showMyQuizzes 
              ? "You haven't created any quizzes yet."
              : showPublicQuizzes
                ? "There are no public quizzes available."
                : selectedDifficulty
                  ? `No ${selectedDifficulty} difficulty quizzes found.`
                  : searchQuery
                    ? `No quizzes matching "${searchQuery}" found.`
                    : "No quizzes available."}
          </p>
          <Button asChild>
            <Link href="/mcqs/quizzes/new">Create your first quiz</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map(quiz => (
            <div 
              key={quiz.id} 
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center">
                  <ListChecks className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                  <h3 className="font-medium text-gray-900 dark:text-white">Quiz</h3>
                </div>
                <div className="flex items-center space-x-2">
                  {renderDifficultyBadge(quiz.difficulty_level)}
                  {quiz.is_public && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      <Users className="w-3 h-3 mr-1" />
                      Public
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {quiz.title}
                </h2>
                
                {quiz.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {quiz.description}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    <ListChecks className="w-3 h-3 mr-1" />
                    {quiz.question_count} questions
                  </div>
                  
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    <CalendarClock className="w-3 h-3 mr-1" />
                    {new Date(quiz.created_at).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => startQuizSession(quiz.id)}
                    className="flex-1 flex items-center justify-center"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Take Quiz
                  </Button>
                  
                  <Button asChild variant="outline" className="flex items-center justify-center">
                    <Link href={`/mcqs/quizzes/${quiz.id}`}>
                      <Eye className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
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
    </div>
  );
} 