'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { ErrorAlert } from '@/components/ui/error-alert';
import { useProtectedRoute } from '@/hooks/useAuth';
import { mcqsService } from '@/services/mcqs';
import { McqQuizRead, DifficultyLevelEnum, McqQuestionRead } from '@/types/mcqs';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import {
  ArrowLeft,
  Loader2,
  Save,
  Trash,
  CheckSquare,
  X,
  ListChecks,
  BookOpen,
  Edit,
  Plus,
  Home
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface FormData {
  title: string;
  description: string;
  difficulty_level: DifficultyLevelEnum;
  is_active: boolean;
  is_public: boolean;
  question_ids: number[];
}

export default function EditQuizPage({ params }: { params: Promise<{ quizId: string }> }) {
  const router = useRouter();
  const { user } = useProtectedRoute();

  const [quiz, setQuiz] = useState<McqQuizRead | null>(null);
  const [questions, setQuestions] = useState<McqQuestionRead[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<McqQuestionRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<any>(null);
  const { quizId } = use(params);
  const parsedQuizId = parseInt(quizId, 10);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>();
  const selectedQuestionIds = watch('question_ids', []);

  // Load quiz and questions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (isNaN(parsedQuizId)) {
          throw new Error("Invalid quiz ID");
        }

        // Fetch the quiz data
        const quizData = await mcqsService.getQuizById(parsedQuizId);
        setQuiz(quizData);

        // Populate form fields
        setValue('title', quizData.title);
        setValue('description', quizData.description || '');
        setValue('difficulty_level', quizData.difficulty_level);
        setValue('is_active', quizData.is_active);
        setValue('is_public', quizData.is_public);

        // Fetch all questions for selection
        const allQuestions = await mcqsService.getQuestions();
        setAvailableQuestions(allQuestions);

        // Fetch the quiz details to get the questions
        const quizWithQuestions = await mcqsService.getQuizById(parsedQuizId);
        if ('questions' in quizWithQuestions) {
          setQuestions(quizWithQuestions.questions as McqQuestionRead[]);

          // Set selected question IDs
          const questionIds = (quizWithQuestions.questions as McqQuestionRead[]).map(q => q.id);
          setValue('question_ids', questionIds);
        }
      } catch (err) {
        console.error('Failed to fetch quiz data:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [parsedQuizId, setValue]);

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    if (!quiz) return;

    // Validate that at least one question is selected
    if (!data.question_ids || data.question_ids.length === 0) {
      setError({
        message: "Please select at least one question for your quiz."
      });
      // Auto-switch to the questions tab if there's an error
      const questionsTab = document.querySelector('[value="questions"]') as HTMLElement;
      if (questionsTab) questionsTab.click();
      return;
    }

    try {
      setSaving(true);

      // Update the quiz
      await mcqsService.updateQuiz(quiz.id, {
        title: data.title,
        description: data.description || null,
        difficulty_level: data.difficulty_level,
        is_active: data.is_active,
        is_public: data.is_public,
        question_ids: data.question_ids
      });

      router.push(`/quizzes/${quiz.id}`);
    } catch (err) {
      console.error('Failed to update quiz:', err);
      setError(err);
      setSaving(false);
    }
  };

  // Toggle a question in the selection
  const toggleQuestion = (questionId: number) => {
    const currentIds = [...(watch('question_ids') || [])];

    if (currentIds.includes(questionId)) {
      setValue('question_ids', currentIds.filter(id => id !== questionId));
    } else {
      setValue('question_ids', [...currentIds, questionId]);
    }
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

  if (!quiz || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Quiz Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The quiz you're looking for doesn't exist or you don't have permission to edit it.
          </p>
          <Button asChild>
            <Link href="/quizzes">Back to Quizzes</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Check if user has permission to edit
  if (quiz.user_id !== parseInt(user.id)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don't have permission to edit this quiz.
          </p>
          <Button asChild>
            <Link href={`/quizzes/${quiz.id}`}>Back to Quiz</Link>
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
            label: 'Home',
            href: '/dashboard',
            icon: <Home className="w-4 h-4" />
          },
          {
            label: 'Quizzes',
            href: '/quizzes',
            icon: <ListChecks className="w-4 h-4" />
          },
          {
            label: quiz.title,
            href: `/quizzes/${quiz.id}`,
            icon: <CheckSquare className="w-4 h-4" />
          },
          {
            label: 'Edit',
            icon: <Edit className="w-4 h-4" />
          }
        ]}
      />

      <div className="flex items-center mb-6">
        <Button asChild variant="outline" size="sm">
          <Link href={`/quizzes/${quiz.id}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quiz
          </Link>
        </Button>
      </div>

      {error && <ErrorAlert error={error} />}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Quiz</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="details">Quiz Details</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    {...register('title', { required: 'Title is required' })}
                    placeholder="Quiz Title"
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Quiz description (optional)"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="difficulty_level">Difficulty Level</Label>
                  <Select
                    value={watch('difficulty_level')}
                    onValueChange={(value: DifficultyLevelEnum) => setValue('difficulty_level', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={watch('is_active')}
                    onCheckedChange={(checked: boolean) => setValue('is_active', checked)}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_public"
                    checked={watch('is_public')}
                    onCheckedChange={(checked: boolean) => setValue('is_public', checked)}
                  />
                  <Label htmlFor="is_public">Public</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="questions">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-medium">Select Questions</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Selected: <span className={`font-semibold ${selectedQuestionIds.length === 0 ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        {selectedQuestionIds.length} questions
                      </span>
                      <span className="ml-1 text-xs text-red-500 dark:text-red-400">
                        {selectedQuestionIds.length === 0 && '(At least one question is required)'}
                      </span>
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    <Link href="/quizzes/questions/new">
                      <Plus className="w-4 h-4 mr-1" />
                      Add New Question
                    </Link>
                  </Button>
                </div>

                {/* Filter options for questions */}
                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={selectedQuestionIds.length > 0 ? "default" : "destructive"}
                      size="sm"
                      onClick={() => {
                        if (availableQuestions.length > 0) {
                          const allIds = availableQuestions.map(q => q.id);
                          setValue('question_ids', allIds);
                        }
                      }}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setValue('question_ids', [])}
                    >
                      Clear Selection
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4">
                  {availableQuestions.length === 0 ? (
                    <div className="border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 rounded-md p-4 text-center">
                      <p className="mb-2 text-yellow-800 dark:text-yellow-300">No questions available.</p>
                      <p>You need to <Link href="/quizzes/questions/new" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">create some questions</Link> before you can add them to your quiz.</p>
                    </div>
                  ) : (
                    availableQuestions.map(question => (
                      <Card key={question.id} className={`border ${selectedQuestionIds.includes(question.id) ? 'border-primary' : 'border-gray-200 dark:border-gray-700'}`}>
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-base font-medium">{question.question_text}</CardTitle>
                            <Checkbox
                              checked={selectedQuestionIds.includes(question.id)}
                              onCheckedChange={() => toggleQuestion(question.id)}
                            />
                          </div>
                          <CardDescription className="flex flex-wrap gap-1 mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                              {question.difficulty_level}
                            </span>
                            {question.tags.map(tag => (
                              <span key={tag.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                {tag.name}
                              </span>
                            ))}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm pt-0">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className={`p-2 rounded ${question.correct_option === 'A' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-50 dark:bg-gray-800'}`}>
                              A: {question.option_a}
                            </div>
                            <div className={`p-2 rounded ${question.correct_option === 'B' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-50 dark:bg-gray-800'}`}>
                              B: {question.option_b}
                            </div>
                            {question.option_c && (
                              <div className={`p-2 rounded ${question.correct_option === 'C' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-50 dark:bg-gray-800'}`}>
                                C: {question.option_c}
                              </div>
                            )}
                            {question.option_d && (
                              <div className={`p-2 rounded ${question.correct_option === 'D' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-50 dark:bg-gray-800'}`}>
                                D: {question.option_d}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-8 flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/quizzes/${quiz.id}`)}
              disabled={saving}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 