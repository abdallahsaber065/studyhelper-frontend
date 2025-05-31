'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ErrorAlert } from '@/components/ui/error-alert';
import { useProtectedRoute } from '@/hooks/useAuth';
import { mcqsService } from '@/services/mcqs';
import { DifficultyLevelEnum, McqQuestionRead, McqQuizRead } from '@/types/mcqs';
import {
  ArrowLeft,
  Loader2,
  Plus,
  Check,
  Search,
  Filter,
  ListChecks,
  Tag as TagIcon,
  Save,
  ChevronUp,
  ChevronDown,
  CheckCircle,
  Edit
} from 'lucide-react';

export default function CreateQuizPage() {
  const router = useRouter();
  const { user } = useProtectedRoute();
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevelEnum>('Medium');
  const [isPublic, setIsPublic] = useState(false);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);
  
  // Questions state
  const [availableQuestions, setAvailableQuestions] = useState<McqQuestionRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<any>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevelEnum | null>(null);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [availableTags, setAvailableTags] = useState<{ id: number; name: string }[]>([]);
  
  // UI state
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  
  // Load questions and tags
  useEffect(() => {
    const fetchQuestionsAndTags = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch questions
        const questions = await mcqsService.getQuestions();
        setAvailableQuestions(questions);
        
        // Fetch tags
        const tags = await mcqsService.getTags();
        setAvailableTags(tags);
      } catch (err) {
        console.error('Failed to fetch questions or tags:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestionsAndTags();
  }, []);
  
  // Filter questions based on search and filters
  const filteredQuestions = availableQuestions
    .filter(q => {
      // Apply search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesQuery = 
          q.question_text.toLowerCase().includes(searchLower) || 
          q.option_a.toLowerCase().includes(searchLower) || 
          q.option_b.toLowerCase().includes(searchLower) ||
          (q.option_c && q.option_c.toLowerCase().includes(searchLower)) ||
          (q.option_d && q.option_d.toLowerCase().includes(searchLower));
        
        if (!matchesQuery) return false;
      }
      
      // Apply difficulty filter
      if (selectedDifficulty && q.difficulty_level !== selectedDifficulty) {
        return false;
      }
      
      // Apply tag filter
      if (selectedTags.length > 0) {
        const questionHasSelectedTag = q.tags.some(tag => selectedTags.includes(tag.id));
        if (!questionHasSelectedTag) return false;
      }
      
      return true;
    });
  
  // Toggle question selection
  const toggleQuestionSelection = (questionId: number) => {
    if (selectedQuestionIds.includes(questionId)) {
      setSelectedQuestionIds(selectedQuestionIds.filter(id => id !== questionId));
    } else {
      setSelectedQuestionIds([...selectedQuestionIds, questionId]);
    }
  };
  
  // Toggle tag selection for filtering
  const toggleTagSelection = (tagId: number) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDifficulty(null);
    setSelectedTags([]);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!title.trim()) {
      setError({ detail: 'Title is required.' });
      return;
    }
    
    if (selectedQuestionIds.length === 0) {
      setError({ detail: 'Please select at least one question for the quiz.' });
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      const quizData = {
        title: title.trim(),
        description: description.trim() || null,
        difficulty_level: difficultyLevel,
        is_public: isPublic,
        question_ids: selectedQuestionIds
      };
      
      const createdQuiz = await mcqsService.createQuiz(quizData);
      
      // Redirect to the quiz details page
      router.push(`/mcqs/quizzes/${createdQuiz.id}`);
    } catch (err) {
      console.error('Failed to create quiz:', err);
      setError(err);
      setSaving(false);
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
  
  // Sort selected questions to appear first
  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    const aSelected = selectedQuestionIds.includes(a.id);
    const bSelected = selectedQuestionIds.includes(b.id);
    
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return 0;
  });
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button asChild variant="ghost" className="mr-4">
          <Link href="/mcqs/quizzes">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quizzes
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Quiz</h1>
      </div>
      
      {error && <ErrorAlert error={error} className="mb-6" />}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quiz Details Form */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quiz Details</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title *
                  </label>
                  <Input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Enter quiz title..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <Textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Enter quiz description (optional)..."
                    className="min-h-20"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Difficulty Level *
                  </label>
                  <div className="flex space-x-4">
                    {['Easy', 'Medium', 'Hard'].map((level) => (
                      <label key={level} className={`
                        flex items-center justify-center px-4 py-2 rounded-md border cursor-pointer
                        ${difficultyLevel === level 
                          ? level === 'Easy' 
                            ? 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900/30 dark:border-green-500 dark:text-green-400'
                            : level === 'Medium'
                              ? 'bg-yellow-100 border-yellow-500 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-500 dark:text-yellow-400'
                              : 'bg-red-100 border-red-500 text-red-700 dark:bg-red-900/30 dark:border-red-500 dark:text-red-400'
                          : 'bg-white border-gray-300 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300'}
                      `}>
                        <input
                          type="radio"
                          className="sr-only"
                          value={level}
                          checked={difficultyLevel === level as DifficultyLevelEnum}
                          onChange={() => setDifficultyLevel(level as DifficultyLevelEnum)}
                        />
                        <span>{level}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Checkbox
                    id="is-public"
                    checked={isPublic}
                    onCheckedChange={(checked) => setIsPublic(!!checked)}
                    className="mt-1"
                  />
                  <label
                    htmlFor="is-public"
                    className="ml-2 block text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
                  >
                    Make this quiz public
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      Public quizzes can be viewed and taken by all users
                    </span>
                  </label>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Selected Questions
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedQuestionIds.length} selected
                    </span>
                  </div>
                  
                  {selectedQuestionIds.length === 0 ? (
                    <div className="p-4 rounded-md bg-gray-50 dark:bg-gray-800 text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No questions selected yet
                      </p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-60 overflow-y-auto rounded-md border border-gray-200 dark:border-gray-700">
                      {availableQuestions
                        .filter(q => selectedQuestionIds.includes(q.id))
                        .map(question => (
                          <li key={question.id} className="py-2 px-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <div className="flex items-center truncate">
                              <Check className="w-4 h-4 text-green-500 flex-shrink-0 mr-2" />
                              <span className="truncate text-sm text-gray-700 dark:text-gray-300">
                                {question.question_text}
                              </span>
                            </div>
                            <button
                              type="button"
                              className="ml-2 flex-shrink-0 text-red-500 hover:text-red-700"
                              onClick={() => toggleQuestionSelection(question.id)}
                            >
                              <span className="sr-only">Remove</span>
                              &times;
                            </button>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
                
                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={saving || selectedQuestionIds.length === 0}
                    className="w-full"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Creating Quiz...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Create Quiz
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
        
        {/* Question Selection Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Select Questions</h2>
                
                <div className="flex items-center gap-2">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Search className="w-4 h-4 text-gray-400" />
                    </div>
                    <Input
                      type="text"
                      placeholder="Search questions..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowFilterPanel(!showFilterPanel)}
                    className={showFilterPanel ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' : ''}
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Filter Panel */}
              {showFilterPanel && (
                <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters</h3>
                    {(selectedDifficulty || selectedTags.length > 0) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-xs"
                      >
                        Clear all
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    
                    {/* Tags Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tags
                      </label>
                      <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700">
                        {availableTags.length === 0 ? (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            No tags available
                          </span>
                        ) : (
                          availableTags.map(tag => (
                            <label
                              key={tag.id}
                              className={`
                                inline-flex items-center px-2 py-1 rounded-full text-xs cursor-pointer
                                ${selectedTags.includes(tag.id)
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}
                              `}
                            >
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={selectedTags.includes(tag.id)}
                                onChange={() => toggleTagSelection(tag.id)}
                              />
                              {tag.name}
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Questions List */}
            {loading ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                  <ListChecks className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No questions found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {searchQuery || selectedDifficulty || selectedTags.length > 0 
                    ? "Try adjusting your filters or search query." 
                    : "There are no questions available."}
                </p>
                <Button asChild>
                  <Link href="/mcqs/questions/new">Create a new question</Link>
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[500px] overflow-y-auto">
                {sortedQuestions.map(question => {
                  const isSelected = selectedQuestionIds.includes(question.id);
                  
                  return (
                    <li 
                      key={question.id} 
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                        isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 pt-1">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleQuestionSelection(question.id)}
                            id={`question-${question.id}`}
                          />
                        </div>
                        <div className="ml-3 flex-grow">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            {renderDifficultyBadge(question.difficulty_level)}
                            {question.tags.map(tag => (
                              <span 
                                key={tag.id}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                              >
                                <TagIcon className="w-3 h-3 mr-1" />
                                {tag.name}
                              </span>
                            ))}
                          </div>
                          <label 
                            htmlFor={`question-${question.id}`}
                            className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer"
                          >
                            {question.question_text}
                          </label>
                          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 mr-1.5">A</span>
                              {question.option_a}
                            </div>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 mr-1.5">B</span>
                              {question.option_b}
                            </div>
                            {question.option_c && (
                              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 mr-1.5">C</span>
                                {question.option_c}
                              </div>
                            )}
                            {question.option_d && (
                              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 mr-1.5">D</span>
                                {question.option_d}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex items-center">
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <Link href={`/mcqs/questions/${question.id}`}>
                              <span className="sr-only">View</span>
                              <Edit className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            
            {/* Question Count Summary */}
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredQuestions.length} of {availableQuestions.length} questions
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 