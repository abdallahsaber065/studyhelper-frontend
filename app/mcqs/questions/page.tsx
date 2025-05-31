'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ErrorAlert } from '@/components/ui/error-alert';
import { useProtectedRoute } from '@/hooks/useAuth';
import { mcqsService } from '@/services/mcqs';
import { McqQuestionRead, QuestionTagRead, DifficultyLevelEnum } from '@/types/mcqs';
import { 
  Loader2, 
  Plus, 
  Edit, 
  Trash2, 
  Tag, 
  Filter, 
  X, 
  Home, 
  ChevronRight,
  BookOpen,
  ArrowUpRight
} from 'lucide-react';

export default function McqQuestionsPage() {
  const router = useRouter();
  const { user } = useProtectedRoute();

  // State for questions and loading
  const [questions, setQuestions] = useState<McqQuestionRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  
  // State for filters
  const [tags, setTags] = useState<QuestionTagRead[]>([]);
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevelEnum | null>(null);
  const [showMyQuestions, setShowMyQuestions] = useState(false);
  
  // State for pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Load questions based on filters
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params: any = {
          skip: (page - 1) * limit,
          limit,
        };
        
        if (selectedTagId) params.tag_id = selectedTagId;
        if (selectedDifficulty) params.difficulty = selectedDifficulty;
        if (showMyQuestions) params.my_questions = true;
        
        const data = await mcqsService.getQuestions(params);
        setQuestions(data);
        
        // For pagination, we need to know the total number of questions
        // This is normally returned from the API, but if not, we can estimate
        setTotalPages(Math.max(1, Math.ceil(data.length / limit)));
      } catch (err) {
        console.error('Failed to fetch questions:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, [page, limit, selectedTagId, selectedDifficulty, showMyQuestions]);
  
  // Load tags for filtering
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const data = await mcqsService.getTags();
        setTags(data);
      } catch (err) {
        console.error('Failed to fetch tags:', err);
      }
    };
    
    fetchTags();
  }, []);

  // Handle deleting a question
  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return;
    }
    
    try {
      setLoading(true);
      await mcqsService.deleteQuestion(questionId);
      // Refresh the questions after deletion
      setQuestions(questions.filter(q => q.id !== questionId));
    } catch (err) {
      console.error('Failed to delete question:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedTagId(null);
    setSelectedDifficulty(null);
    setShowMyQuestions(false);
    setPage(1);
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

  if (loading && !questions.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
            <span className="text-gray-900 dark:text-white font-medium">
              MCQ Questions
            </span>
          </li>
        </ol>
      </nav>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">MCQ Questions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your multiple-choice questions
          </p>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
          <Button asChild variant="outline">
            <Link href="/mcqs/tags" className="flex items-center">
              <Tag className="w-4 h-4 mr-2" />
              Manage Tags
            </Link>
          </Button>
          <Button asChild>
            <Link href="/mcqs/questions/new" className="flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              New Question
            </Link>
          </Button>
        </div>
      </div>

      {error && <ErrorAlert error={error} className="mb-6" />}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6">
        <div className="flex items-center mb-4">
          <Filter className="w-5 h-5 mr-2 text-gray-400" />
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Filters</h2>
          {(selectedTagId || selectedDifficulty || showMyQuestions) && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto text-sm text-gray-500"
              onClick={clearFilters}
            >
              <X className="w-4 h-4 mr-1" /> Clear filters
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tag filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tag
            </label>
            <select
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={selectedTagId || ''}
              onChange={e => setSelectedTagId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">All Tags</option>
              {tags.map(tag => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Difficulty filter */}
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
          
          {/* My Questions filter */}
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-600 dark:text-blue-500"
                checked={showMyQuestions}
                onChange={() => setShowMyQuestions(!showMyQuestions)}
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Show only my questions
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Questions list */}
      {questions.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-gray-500 dark:text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No questions found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {selectedTagId || selectedDifficulty || showMyQuestions 
              ? 'Try changing your filters or create a new question.' 
              : 'Get started by creating your first question.'}
          </p>
          <Button asChild>
            <Link href="/mcqs/questions/new">
              <Plus className="w-4 h-4 mr-2" />
              Create New Question
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {questions.map(question => (
              <div 
                key={question.id} 
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
              >
                <div className="p-6 flex-grow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {question.question_text}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {renderDifficultyBadge(question.difficulty_level)}
                        
                        {question.tags && question.tags.map(tag => (
                          <span 
                            key={tag.id}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2 mb-4">
                    {['A', 'B', 'C', 'D'].map(option => {
                      const optionKey = `option_${option.toLowerCase()}` as keyof typeof question;
                      const optionValue = question[optionKey] as string;
                      const isCorrect = question.correct_option === option;
                      
                      return (
                        <div 
                          key={option}
                          className={`p-2 rounded-md text-sm ${
                            isCorrect 
                              ? 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400' 
                              : 'bg-gray-50 border border-gray-200 text-gray-700 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-300'
                          }`}
                        >
                          <div className="flex items-start">
                            <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full mr-2 ${
                              isCorrect 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400' 
                                : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
                            } flex-shrink-0 text-xs`}>
                              {option}
                            </span>
                            <span className="line-clamp-1">{optionValue}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <div className="flex justify-between items-center">
                    <Button asChild variant="outline" size="sm" className="text-gray-700 dark:text-gray-300">
                      <Link href={`/mcqs/questions/${question.id}`}>
                        View Details
                      </Link>
                    </Button>
                    
                    <div className="flex space-x-2">
                      <Button 
                        asChild
                        variant="ghost" 
                        size="sm"
                        className="text-blue-600 dark:text-blue-400"
                      >
                        <Link href={`/mcqs/questions/${question.id}/edit`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-600 dark:text-red-400"
                        onClick={() => handleDeleteQuestion(question.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                
                <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                  Page {page} of {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 