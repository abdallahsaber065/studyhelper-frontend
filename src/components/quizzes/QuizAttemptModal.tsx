import React, { useState, useEffect } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X, ChevronLeft, ChevronRight, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStartAttempt, useAnswerQuestion, useCompleteAttempt } from '@/hooks/useQuizAttempts';
import type { Quiz, QuizAttempt, QuizAttemptResult, QuizAttemptQuestion } from '@/services/quizService';
import { QuizResultsPanel } from './QuizResultsPanel';

interface Props {
    quiz: Quiz | null;
    open: boolean;
    onClose: () => void;
}

export const QuizAttemptModal: React.FC<Props> = ({ quiz, open, onClose }) => {
    const startMutation = useStartAttempt();
    const answerMutation = useAnswerQuestion();
    const completeMutation = useCompleteAttempt();

    const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [result, setResult] = useState<QuizAttemptResult | null>(null);
    const [submittingAnswer, setSubmittingAnswer] = useState(false);

    // Start attempt when modal opens
    useEffect(() => {
        if (open && quiz && !attempt && !startMutation.isPending) {
            startMutation.mutateAsync(quiz.id).then(a => {
                setAttempt(a);
                setCurrentIndex(0);
                setAnswers({});
                setResult(null);
            });
        }
    }, [open, quiz]);

    const handleClose = () => {
        setAttempt(null);
        setCurrentIndex(0);
        setAnswers({});
        setResult(null);
        startMutation.reset();
        completeMutation.reset();
        onClose();
    };

    if (!quiz) return null;

    const question: QuizAttemptQuestion | undefined = attempt?.questions[currentIndex];
    const totalQuestions = attempt?.questions.length ?? quiz.question_count;
    const currentAnswer = question ? (answers[question.id] ?? '') : '';
    const isLastQuestion = currentIndex === totalQuestions - 1;

    const handleAnswer = (value: string) => {
        if (!question) return;
        setAnswers(prev => ({ ...prev, [question.id]: value }));
    };

    const handleNext = async () => {
        if (!attempt || !question) return;
        const ans = answers[question.id] ?? '';
        if (!ans) return;

        setSubmittingAnswer(true);
        try {
            await answerMutation.mutateAsync({
                quizId: quiz.id,
                attemptId: attempt.id,
                questionId: question.id,
                answer: ans,
            });
        } catch { /* Best-effort; submit remaining on complete */ }
        setSubmittingAnswer(false);

        if (isLastQuestion) {
            // Complete the attempt
            const res = await completeMutation.mutateAsync({ quizId: quiz.id, attemptId: attempt.id });
            setResult(res);
        } else {
            setCurrentIndex(i => i + 1);
        }
    };

    const renderQuestion = (q: QuizAttemptQuestion) => {
        const ans = answers[q.id] ?? '';

        if (q.question_type === 'multiple_choice' && q.options) {
            return (
                <div className="mt-4 space-y-2">
                    {q.options.map((opt, i) => (
                        <label key={i} className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="radio"
                                name={`question-${q.id}`}
                                value={opt}
                                checked={ans === opt}
                                onChange={() => handleAnswer(opt)}
                                className="mt-0.5 accent-primary"
                            />
                            <span className="text-sm">{opt}</span>
                        </label>
                    ))}
                </div>
            );
        }

        if (q.question_type === 'true_false') {
            return (
                <div className="mt-4 flex gap-4">
                    {['True', 'False'].map(opt => (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => handleAnswer(opt)}
                            className={`flex-1 rounded-md border py-2.5 text-sm font-medium transition-colors ${ans === opt
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-input bg-background hover:bg-accent'
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            );
        }

        // short_answer / fill_in_blank / long_answer
        return (
            <div className="mt-4">
                <textarea
                    rows={q.question_type === 'short_answer' ? 3 : 5}
                    value={ans}
                    onChange={e => handleAnswer(e.target.value)}
                    placeholder="Type your answer…"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                />
            </div>
        );
    };

    return (
        <DialogPrimitive.Root open={open} onOpenChange={(v) => !v && handleClose()}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
                <DialogPrimitive.Content className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-2xl sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 flex flex-col rounded-lg border bg-background shadow-xl focus:outline-none">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b px-6 py-4 shrink-0">
                        <DialogPrimitive.Title className="font-semibold truncate max-w-xs">
                            {quiz.title}
                        </DialogPrimitive.Title>
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
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                        {/* Loading state */}
                        {startMutation.isPending && (
                            <div className="flex flex-col items-center justify-center gap-3 py-16">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="text-sm text-muted-foreground">Preparing your quiz…</p>
                            </div>
                        )}

                        {startMutation.isError && (
                            <div className="flex flex-col items-center justify-center gap-3 py-16 text-destructive">
                                <p className="font-medium">Could not start quiz.</p>
                                <p className="text-sm">{(startMutation.error as Error).message}</p>
                            </div>
                        )}

                        {/* Results */}
                        {result && (
                            <QuizResultsPanel result={result} onRetry={handleClose} onClose={handleClose} />
                        )}

                        {/* Active question */}
                        {attempt && question && !result && (
                            <div className="space-y-4">
                                {/* Progress */}
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>Question {currentIndex + 1} of {totalQuestions}</span>
                                    <span>{question.points} pt{question.points !== 1 ? 's' : ''}</span>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-muted">
                                    <div
                                        className="h-1.5 rounded-full bg-primary transition-all"
                                        style={{ width: `${((currentIndex) / totalQuestions) * 100}%` }}
                                    />
                                </div>

                                {/* Question text */}
                                <p className="text-base font-medium leading-relaxed">{question.question_text}</p>

                                {/* Answer input */}
                                {renderQuestion(question)}

                                {/* Complete loading */}
                                {completeMutation.isPending && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Submitting…
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {attempt && question && !result && (
                        <div className="flex items-center justify-between border-t px-6 py-4 shrink-0">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentIndex === 0}
                                onClick={() => setCurrentIndex(i => i - 1)}
                            >
                                <ChevronLeft className="mr-1 h-4 w-4" />
                                Previous
                            </Button>

                            <Button
                                size="sm"
                                disabled={!currentAnswer || submittingAnswer || completeMutation.isPending}
                                onClick={handleNext}
                            >
                                {submittingAnswer || completeMutation.isPending ? (
                                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                                ) : isLastQuestion ? (
                                    <CheckCircle className="mr-1.5 h-4 w-4" />
                                ) : (
                                    <ChevronRight className="mr-1.5 h-4 w-4" />
                                )}
                                {isLastQuestion ? 'Finish' : 'Next'}
                            </Button>
                        </div>
                    )}
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
};
