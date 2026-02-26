import React, { useState } from 'react';
import { Brain, Play, Trash2, RefreshCw, MoreVertical, Star } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Button } from '@/components/ui/button';
import { useDeleteQuiz, useRegenerateQuiz } from '@/hooks/useQuizzes';
import {
    getDifficultyColor,
    getDifficultyLabel,
    getStatusColor,
    type Quiz,
} from '@/services/quizService';

interface Props {
    quiz: Quiz;
    onTake: (quiz: Quiz) => void;
}

export const QuizCard: React.FC<Props> = ({ quiz, onTake }) => {
    const deleteMutation = useDeleteQuiz();
    const regenerateMutation = useRegenerateQuiz();
    const [confirmDelete, setConfirmDelete] = useState(false);

    const isReady = quiz.status === 'completed';
    const isGenerating = quiz.status === 'pending' || quiz.status === 'processing';

    return (
        <div className="rounded-lg border bg-card shadow-sm flex flex-col">
            <div className="p-5 flex-1">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                    <Brain className="h-7 w-7 text-primary shrink-0 mt-0.5" />
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getDifficultyColor(quiz.difficulty_level)}`}>
                            {getDifficultyLabel(quiz.difficulty_level)}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(quiz.status)}`}>
                            {quiz.status.charAt(0).toUpperCase() + quiz.status.slice(1)}
                        </span>
                    </div>
                </div>

                {/* Title */}
                <h3 className="mt-3 font-semibold leading-snug" title={quiz.title}>
                    {quiz.title}
                </h3>
                {quiz.description && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{quiz.description}</p>
                )}

                {/* Generating progress bar */}
                {isGenerating && (
                    <div className="mt-3">
                        <div className="h-1.5 w-full rounded-full bg-muted">
                            <div
                                className="h-1.5 rounded-full bg-primary transition-all"
                                style={{ width: `${quiz.progress_percentage ?? 20}%` }}
                            />
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">Generating questions…</p>
                    </div>
                )}

                {/* Meta */}
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{quiz.question_count} question{quiz.question_count !== 1 ? 's' : ''}</span>
                    {quiz.estimated_time_minutes && <span>~{quiz.estimated_time_minutes} min</span>}
                </div>

                {/* Score / attempts */}
                {quiz.total_attempts > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span>Best: {quiz.average_score?.toFixed(0) ?? '—'}%</span>
                        <span className="ml-1">· {quiz.total_attempts} attempt{quiz.total_attempts !== 1 ? 's' : ''}</span>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="border-t px-5 py-3 flex items-center gap-2">
                <Button
                    size="sm"
                    className="flex-1"
                    disabled={!isReady}
                    onClick={() => onTake(quiz)}
                >
                    <Play className="mr-1.5 h-3.5 w-3.5" />
                    {isReady ? 'Start Quiz' : 'Not Ready'}
                </Button>

                {/* Dropdown for extra actions */}
                <AlertDialog.Root open={confirmDelete} onOpenChange={setConfirmDelete}>
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                            <Button variant="outline" size="sm" className="px-2">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                            <DropdownMenu.Content
                                align="end"
                                sideOffset={4}
                                className="z-50 min-w-[140px] rounded-md border bg-background p-1 shadow-md"
                            >
                                <DropdownMenu.Item
                                    onSelect={() => regenerateMutation.mutate({ quizId: quiz.id })}
                                    className="flex cursor-pointer items-center gap-2 rounded-sm px-3 py-1.5 text-sm outline-none hover:bg-accent"
                                >
                                    <RefreshCw className="h-3.5 w-3.5" />
                                    Regenerate
                                </DropdownMenu.Item>
                                <DropdownMenu.Separator className="my-1 h-px bg-border" />
                                <AlertDialog.Trigger asChild>
                                    <DropdownMenu.Item
                                        onSelect={(e) => { e.preventDefault(); setConfirmDelete(true); }}
                                        className="flex cursor-pointer items-center gap-2 rounded-sm px-3 py-1.5 text-sm text-destructive outline-none hover:bg-destructive/10"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Delete
                                    </DropdownMenu.Item>
                                </AlertDialog.Trigger>
                            </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                    </DropdownMenu.Root>

                    <AlertDialog.Portal>
                        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
                        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background p-6 shadow-xl">
                            <AlertDialog.Title className="font-semibold">Delete Quiz?</AlertDialog.Title>
                            <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">
                                This will permanently delete <strong>"{quiz.title}"</strong> and all its attempts.
                            </AlertDialog.Description>
                            <div className="mt-4 flex justify-end gap-2">
                                <AlertDialog.Cancel asChild>
                                    <Button variant="outline" size="sm">Cancel</Button>
                                </AlertDialog.Cancel>
                                <AlertDialog.Action asChild>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => deleteMutation.mutate(quiz.id)}
                                    >
                                        Delete
                                    </Button>
                                </AlertDialog.Action>
                            </div>
                        </AlertDialog.Content>
                    </AlertDialog.Portal>
                </AlertDialog.Root>
            </div>
        </div>
    );
};
