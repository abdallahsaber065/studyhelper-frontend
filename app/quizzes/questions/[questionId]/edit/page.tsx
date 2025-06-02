'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ErrorAlert } from '@/components/ui/error-alert';
import { useProtectedRoute } from '@/hooks/useAuth';
import { mcqsService } from '@/services/mcqs';
import { DifficultyLevelEnum, CorrectAnswerEnum, QuestionTagRead } from '@/types/mcqs';
import { ArrowLeft, Loader2, Save } from 'lucide-react';

export default function EditQuestionPage({ params }: { params: Promise<{ questionId: string }> }) {
  const router = useRouter();
  const { user } = useProtectedRoute();
  const { questionId } = use(params);
  const parsedId = parseInt(questionId);
  // Form state
  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctOption, setCorrectOption] = useState<CorrectAnswerEnum>('A');
  const [explanation, setExplanation] = useState('');
  const [hint, setHint] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevelEnum>('Medium');
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  // Tags for selection
  const [availableTags, setAvailableTags] = useState<QuestionTagRead[]>([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<any>(null);
  const [loadingTags, setLoadingTags] = useState(true);

  // Load question details and tags
  useEffect(() => {
    const fetchQuestionAndTags = async () => {
      try {
        setLoading(true);
        setError(null);

        // Handle invalid ID
        if (isNaN(parsedId)) {
          throw new Error("Invalid question ID");
        }

        const questionData = await mcqsService.getQuestionById(parsedId);

        // Set form values
        setQuestionText(questionData.question_text);
        setOptionA(questionData.option_a);
        setOptionB(questionData.option_b);
        setOptionC(questionData.option_c || '');
        setOptionD(questionData.option_d || '');
        setCorrectOption(questionData.correct_option);
        setExplanation(questionData.explanation || '');
        setHint(questionData.hint || '');
        setDifficultyLevel(questionData.difficulty_level);
        setSelectedTagIds(questionData.tags.map(tag => tag.id));

        // Fetch tags
        const tagsData = await mcqsService.getTags();
        setAvailableTags(tagsData);
      } catch (err) {
        console.error('Failed to fetch question or tags:', err);
        setError(err);
      } finally {
        setLoading(false);
        setLoadingTags(false);
      }
    };

    fetchQuestionAndTags();
  }, [parsedId]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!questionText.trim() || !optionA.trim() || !optionB.trim()) {
      setError({ detail: 'Question text, Option A, and Option B are required.' });
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (isNaN(parsedId)) {
        throw new Error("Invalid question ID");
      }

      const questionUpdate = {
        question_text: questionText,
        option_a: optionA,
        option_b: optionB,
        option_c: optionC || null,
        option_d: optionD || null,
        correct_option: correctOption,
        explanation: explanation || null,
        hint: hint || null,
        difficulty_level: difficultyLevel,
        tag_ids: selectedTagIds
      };

      await mcqsService.updateQuestion(parsedId, questionUpdate);

      // Redirect back to question details
      router.push(`/quizzes/questions/${questionId}`);
    } catch (err) {
      console.error('Failed to update question:', err);
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  // Toggle tag selection
  const toggleTag = (tagId: number) => {
    if (selectedTagIds.includes(tagId)) {
      setSelectedTagIds(selectedTagIds.filter(id => id !== tagId));
    } else {
      setSelectedTagIds([...selectedTagIds, tagId]);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button asChild variant="ghost" className="mr-4">
          <Link href={`/quizzes/questions/${questionId}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Question
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Question</h1>
      </div>

      {error && <ErrorAlert error={error} />}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit}>
          {/* Question Text */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Question Text *
            </label>
            <Textarea
              value={questionText}
              onChange={e => setQuestionText(e.target.value)}
              placeholder="Enter the question text..."
              className="min-h-20"
              required
            />
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Option A *
              </label>
              <Input
                value={optionA}
                onChange={e => setOptionA(e.target.value)}
                placeholder="Enter option A..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Option B *
              </label>
              <Input
                value={optionB}
                onChange={e => setOptionB(e.target.value)}
                placeholder="Enter option B..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Option C
              </label>
              <Input
                value={optionC}
                onChange={e => setOptionC(e.target.value)}
                placeholder="Enter option C (optional)..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Option D
              </label>
              <Input
                value={optionD}
                onChange={e => setOptionD(e.target.value)}
                placeholder="Enter option D (optional)..."
              />
            </div>
          </div>

          {/* Correct Option */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Correct Answer *
            </label>
            <div className="flex space-x-4">
              {['A', 'B', 'C', 'D'].map((option) => (
                <label key={option} className={`
                  flex items-center justify-center px-4 py-2 rounded-md border
                  ${correctOption === option
                    ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-400'
                    : 'bg-white border-gray-300 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300'}
                  ${(option === 'C' && !optionC) || (option === 'D' && !optionD) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}>
                  <input
                    type="radio"
                    className="sr-only"
                    value={option}
                    checked={correctOption === option as CorrectAnswerEnum}
                    onChange={() => setCorrectOption(option as CorrectAnswerEnum)}
                    disabled={(option === 'C' && !optionC) || (option === 'D' && !optionD)}
                  />
                  <span>Option {option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Explanation and Hint */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Explanation
              </label>
              <Textarea
                value={explanation}
                onChange={e => setExplanation(e.target.value)}
                placeholder="Explain why the correct answer is correct..."
                className="min-h-20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hint
              </label>
              <Textarea
                value={hint}
                onChange={e => setHint(e.target.value)}
                placeholder="Provide a hint for the question..."
                className="min-h-20"
              />
            </div>
          </div>

          {/* Difficulty Level */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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

          {/* Tags */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            {loadingTags ? (
              <div className="flex items-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Loading tags...</span>
              </div>
            ) : availableTags.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No tags available</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <label
                    key={tag.id}
                    className={`
                      inline-flex items-center px-3 py-1 rounded-full text-sm cursor-pointer
                      ${selectedTagIds.includes(tag.id)
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}
                    `}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={selectedTagIds.includes(tag.id)}
                      onChange={() => toggleTag(tag.id)}
                    />
                    {tag.name}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={saving} className="w-full sm:w-auto">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
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