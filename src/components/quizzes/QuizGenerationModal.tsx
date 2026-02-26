import React, { useEffect, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X, Loader2, CheckCircle, AlertCircle, Brain } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFiles } from '@/hooks/useFiles';
import { useGenerateQuiz } from '@/hooks/useQuizzes';
import { useQuizProgress } from '@/hooks/useQuizzes';
import type { QuizDifficulty, QuestionType } from '@/services/quizService';

const schema = z.object({
    file_id: z.string().min(1, 'Please select a file'),
    title: z.string().min(1, 'Title is required').max(255),
    description: z.string().max(1000).optional(),
    difficulty_level: z.enum(['beginner', 'intermediate', 'advanced', 'expert', 'adaptive']),
    question_count: z.coerce.number().int().min(1).max(50),
    ai_provider: z.enum(['openai', 'gemini', 'anthropic']).optional(),
    custom_instructions: z.string().max(2000).optional(),
    passing_score: z.coerce.number().int().min(0).max(100).optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
    open: boolean;
    onClose: () => void;
}

const DIFFICULTIES: { value: QuizDifficulty; label: string }[] = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' },
    { value: 'adaptive', label: 'Adaptive' },
];

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'true_false', label: 'True / False' },
    { value: 'short_answer', label: 'Short Answer' },
    { value: 'fill_in_blank', label: 'Fill in the Blank' },
];

export const QuizGenerationModal: React.FC<Props> = ({ open, onClose }) => {
    const { data: filesData } = useFiles({ per_page: 100 });
    const generateMutation = useGenerateQuiz();
    const [generatedQuizId, setGeneratedQuizId] = useState<string | null>(null);
    const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>(['multiple_choice']);

    const { data: progress } = useQuizProgress(
        generatedQuizId,
        !!generatedQuizId && generateMutation.isSuccess
    );

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            difficulty_level: 'intermediate',
            question_count: 10,
        },
    });

    // Auto-close once quiz generation completes
    useEffect(() => {
        if (progress?.status === 'completed') {
            const t = setTimeout(() => { handleClose(); }, 1500);
            return () => clearTimeout(t);
        }
    }, [progress?.status]);

    const handleClose = () => {
        reset();
        setGeneratedQuizId(null);
        generateMutation.reset();
        onClose();
    };

    const toggleType = (t: QuestionType) => {
        setSelectedTypes(prev =>
            prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
        );
    };

    const onSubmit = async (data: FormData) => {
        const result = await generateMutation.mutateAsync({
            ...data,
            question_types: selectedTypes.length > 0 ? selectedTypes : undefined,
        });
        setGeneratedQuizId(result.quiz_id);
    };

    const isGenerating = generateMutation.isPending || (!!generatedQuizId &&
        (progress?.status === 'pending' || progress?.status === 'processing'));

    const isDone = progress?.status === 'completed';
    const isFailed = progress?.status === 'failed' || generateMutation.isError;

    return (
        <DialogPrimitive.Root open={open} onOpenChange={(v) => !v && handleClose()}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background shadow-xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b px-6 py-4">
                        <div className="flex items-center gap-2">
                            <Brain className="h-5 w-5 text-primary" />
                            <DialogPrimitive.Title className="text-lg font-semibold">
                                Generate Quiz
                            </DialogPrimitive.Title>
                        </div>
                        <DialogPrimitive.Close asChild>
                            <button
                                onClick={handleClose}
                                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Close</span>
                            </button>
                        </DialogPrimitive.Close>
                    </div>

                    {/* Body */}
                    <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
                        {/* Progress state */}
                        {isGenerating && (
                            <div className="mb-4 rounded-md border bg-muted/50 p-4">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                    {progress?.current_step ?? 'Starting generation…'}
                                </div>
                                {progress && (
                                    <div className="mt-2">
                                        <div className="h-2 w-full rounded-full bg-background">
                                            <div
                                                className="h-2 rounded-full bg-primary transition-all"
                                                style={{ width: `${progress.progress_percentage}%` }}
                                            />
                                        </div>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {progress.questions_generated}/{progress.total_questions_target} questions
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {isDone && (
                            <div className="mb-4 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                                <CheckCircle className="h-4 w-4" />
                                Quiz generated successfully!
                            </div>
                        )}

                        {isFailed && (
                            <div className="mb-4 flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                                <AlertCircle className="h-4 w-4" />
                                {(generateMutation.error as Error)?.message ?? progress?.error_message ?? 'Generation failed.'}
                            </div>
                        )}

                        <form id="quiz-gen-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {/* File */}
                            <div className="space-y-1">
                                <Label htmlFor="qg-file">Source File *</Label>
                                <select
                                    id="qg-file"
                                    {...register('file_id')}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    <option value="">Select a file…</option>
                                    {filesData?.files.map(f => (
                                        <option key={f.id} value={f.id}>{f.original_filename}</option>
                                    ))}
                                </select>
                                {errors.file_id && (
                                    <p className="text-xs text-destructive">{errors.file_id.message}</p>
                                )}
                            </div>

                            {/* Title */}
                            <div className="space-y-1">
                                <Label htmlFor="qg-title">Quiz Title *</Label>
                                <Input
                                    id="qg-title"
                                    placeholder="e.g. Python Fundamentals Quiz"
                                    {...register('title')}
                                    className={errors.title ? 'border-destructive' : ''}
                                />
                                {errors.title && (
                                    <p className="text-xs text-destructive">{errors.title.message}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-1">
                                <Label htmlFor="qg-desc">Description (optional)</Label>
                                <Input
                                    id="qg-desc"
                                    placeholder="Brief description of the quiz"
                                    {...register('description')}
                                />
                            </div>

                            {/* Difficulty + Count */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="qg-diff">Difficulty</Label>
                                    <select
                                        id="qg-diff"
                                        {...register('difficulty_level')}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        {DIFFICULTIES.map(d => (
                                            <option key={d.value} value={d.value}>{d.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="qg-count">Questions</Label>
                                    <Input
                                        id="qg-count"
                                        type="number"
                                        min={1}
                                        max={50}
                                        {...register('question_count')}
                                        className={errors.question_count ? 'border-destructive' : ''}
                                    />
                                    {errors.question_count && (
                                        <p className="text-xs text-destructive">{errors.question_count.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Question types */}
                            <div className="space-y-2">
                                <Label>Question Types</Label>
                                <div className="flex flex-wrap gap-2">
                                    {QUESTION_TYPES.map(qt => (
                                        <button
                                            key={qt.value}
                                            type="button"
                                            onClick={() => toggleType(qt.value)}
                                            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${selectedTypes.includes(qt.value)
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'border border-input bg-background text-muted-foreground hover:bg-accent'
                                                }`}
                                        >
                                            {qt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* AI Provider */}
                            <div className="space-y-1">
                                <Label htmlFor="qg-provider">AI Provider (optional)</Label>
                                <select
                                    id="qg-provider"
                                    {...register('ai_provider')}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    <option value="">System default</option>
                                    <option value="openai">OpenAI</option>
                                    <option value="gemini">Gemini</option>
                                    <option value="anthropic">Anthropic</option>
                                </select>
                            </div>

                            {/* Passing score */}
                            <div className="space-y-1">
                                <Label htmlFor="qg-pass">Passing Score % (optional)</Label>
                                <Input
                                    id="qg-pass"
                                    type="number"
                                    min={0}
                                    max={100}
                                    placeholder="e.g. 70"
                                    {...register('passing_score')}
                                />
                            </div>

                            {/* Custom instructions */}
                            <div className="space-y-1">
                                <Label htmlFor="qg-instructions">Custom Instructions (optional)</Label>
                                <textarea
                                    id="qg-instructions"
                                    rows={3}
                                    placeholder="Any special instructions for the AI…"
                                    {...register('custom_instructions')}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                                />
                            </div>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 border-t px-6 py-4">
                        <Button variant="outline" onClick={handleClose} disabled={isGenerating}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            form="quiz-gen-form"
                            disabled={isGenerating || isDone || isSubmitting}
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating…
                                </>
                            ) : (
                                'Generate Quiz'
                            )}
                        </Button>
                    </div>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
};
