'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ErrorAlert } from '@/components/ui/error-alert';
import { mcqsService } from '@/services/mcqs';
import { DifficultyLevelEnum, CorrectAnswerEnum, QuestionTagRead } from '@/types/mcqs';
import { Loader2, Save, X } from 'lucide-react';

interface QuestionFormProps {
    onQuestionCreated: (questionId: number) => void;
    onCancel: () => void;
    availableTags: QuestionTagRead[];
    isInline?: boolean;
}

export function QuestionForm({
    onQuestionCreated,
    onCancel,
    availableTags,
    isInline = true
}: QuestionFormProps) {
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

    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!questionText.trim() || !optionA.trim() || !optionB.trim()) {
            setError({ detail: 'Question text, Option A, and Option B are required.' });
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const question = {
                question_text: questionText,
                option_a: optionA,
                option_b: optionB,
                option_c: optionC || null,
                option_d: optionD || null,
                correct_option: correctOption,
                explanation: explanation || null,
                hint: hint || null,
                difficulty_level: difficultyLevel,
                tag_ids: selectedTagIds.length > 0 ? selectedTagIds : []
            };

            const createdQuestion = await mcqsService.createQuestion(question);

            // Call the callback with the created question ID
            onQuestionCreated(createdQuestion.id);

            // Reset form if inline
            if (isInline) {
                resetForm();
            }
        } catch (err) {
            console.error('Failed to create question:', err);
            setError(err);
        } finally {
            setLoading(false);
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

    // Reset form
    const resetForm = () => {
        setQuestionText('');
        setOptionA('');
        setOptionB('');
        setOptionC('');
        setOptionD('');
        setCorrectOption('A');
        setExplanation('');
        setHint('');
        setDifficultyLevel('Medium');
        setSelectedTagIds([]);
        setError(null);
    };

    return (
        <div className={`${isInline ? 'border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4 bg-gray-50 dark:bg-gray-800/50' : ''}`}>
            {isInline && (
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add New Question</h3>
                    <Button variant="ghost" size="sm" onClick={onCancel}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {error && <ErrorAlert error={error} />}

            <form onSubmit={handleSubmit}>
                {/* Question Text */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Option C
                        </label>
                        <Input
                            value={optionC}
                            onChange={e => setOptionC(e.target.value)}
                            placeholder="Enter option C (optional)..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Correct Answer *
                    </label>
                    <div className="flex flex-wrap gap-2">
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

                {/* Difficulty Level */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Difficulty Level *
                    </label>
                    <div className="flex flex-wrap gap-2">
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

                {/* Advanced Options Toggle */}
                <Button
                    type="button"
                    variant="ghost"
                    className="mb-4 text-sm"
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                >
                    {showAdvancedOptions ? 'Hide Advanced Options' : 'Show Advanced Options'}
                </Button>

                {/* Advanced Options */}
                {showAdvancedOptions && (
                    <>
                        {/* Explanation and Hint */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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

                        {/* Tags */}
                        {availableTags.length > 0 && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Tags
                                </label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {availableTags.map(tag => (
                                        <button
                                            key={tag.id}
                                            type="button"
                                            onClick={() => toggleTag(tag.id)}
                                            className={`px-3 py-1 rounded-full text-xs font-medium 
                        ${selectedTagIds.includes(tag.id)
                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`
                                            }
                                        >
                                            {tag.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2 mt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Question
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
} 