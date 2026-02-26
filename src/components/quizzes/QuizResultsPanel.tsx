import React, { useState } from 'react';
import { CheckCircle, XCircle, Trophy, RotateCcw, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { QuizAttemptResult } from '@/services/quizService';

interface Props {
    result: QuizAttemptResult;
    onRetry: () => void;
    onClose: () => void;
}

export const QuizResultsPanel: React.FC<Props> = ({ result, onRetry, onClose }) => {
    const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

    const scoreColor =
        result.percentage_score >= 80
            ? 'text-green-600'
            : result.percentage_score >= 60
                ? 'text-yellow-600'
                : 'text-red-600';

    const scoreBg =
        result.percentage_score >= 80
            ? 'bg-green-50 border-green-200'
            : result.percentage_score >= 60
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-red-50 border-red-200';

    const minutes = Math.floor((result.time_spent_seconds ?? 0) / 60);
    const seconds = (result.time_spent_seconds ?? 0) % 60;

    return (
        <div className="space-y-5">
            {/* Score card */}
            <div className={`rounded-lg border p-6 text-center ${scoreBg}`}>
                <Trophy className={`mx-auto h-10 w-10 ${scoreColor}`} />
                <p className={`mt-2 text-4xl font-bold ${scoreColor}`}>
                    {result.percentage_score.toFixed(1)}%
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                    {result.questions_correct} / {result.questions_total} correct
                </p>
                {result.passed !== undefined && (
                    <span
                        className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${result.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}
                    >
                        {result.passed ? 'Passed' : 'Not Passed'}
                    </span>
                )}
                {result.time_spent_seconds != null && (
                    <p className="mt-2 text-xs text-muted-foreground">
                        Time: {minutes}m {seconds}s
                    </p>
                )}
            </div>

            {/* Per-question breakdown */}
            {result.answers && result.answers.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Question Breakdown</h4>
                    {result.answers.map((a, i) => (
                        <div key={a.question_id} className="rounded-md border overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-muted/50 ${a.is_correct ? 'bg-green-50' : 'bg-red-50'
                                    }`}
                            >
                                {a.is_correct ? (
                                    <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
                                ) : (
                                    <XCircle className="h-4 w-4 shrink-0 text-red-600" />
                                )}
                                <span className="flex-1 line-clamp-1">{a.question_text}</span>
                                <span className="text-xs text-muted-foreground shrink-0">
                                    {a.points_earned}/{a.points_possible}
                                </span>
                                {expandedIdx === i
                                    ? <ChevronUp className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                    : <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                }
                            </button>
                            {expandedIdx === i && (
                                <div className="px-4 py-3 text-sm space-y-1 bg-background border-t">
                                    <p><span className="font-medium">Your answer:</span> <span className={a.is_correct ? 'text-green-700' : 'text-red-700'}>{a.user_answer || '(no answer)'}</span></p>
                                    {!a.is_correct && <p><span className="font-medium">Correct answer:</span> <span className="text-green-700">{a.correct_answer}</span></p>}
                                    {a.explanation && <p className="text-muted-foreground">{a.explanation}</p>}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={onClose}>
                    <X className="mr-1.5 h-4 w-4" />
                    Close
                </Button>
                <Button className="flex-1" onClick={onRetry}>
                    <RotateCcw className="mr-1.5 h-4 w-4" />
                    Try Again
                </Button>
            </div>
        </div>
    );
};
