import { useMutation, useQueryClient } from '@tanstack/react-query';
import { quizService } from '@/services/quizService';
import { useToast } from '@/hooks/useToast';

export function useStartAttempt() {
    const { toast } = useToast();
    return useMutation({
        mutationFn: (quizId: string) => quizService.startAttempt(quizId),
        onError: (err: Error) => {
            toast({ title: 'Could not start quiz', description: err.message, variant: 'destructive' });
        },
    });
}

export function useAnswerQuestion() {
    return useMutation({
        mutationFn: ({
            quizId,
            attemptId,
            questionId,
            answer,
        }: {
            quizId: string;
            attemptId: string;
            questionId: string;
            answer: string;
        }) => quizService.answerQuestion(quizId, attemptId, questionId, answer),
    });
}

export function useCompleteAttempt() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: ({ quizId, attemptId }: { quizId: string; attemptId: string }) =>
            quizService.completeAttempt(quizId, attemptId),
        onSuccess: (_data, vars) => {
            queryClient.invalidateQueries({ queryKey: ['quizzes', vars.quizId] });
            queryClient.invalidateQueries({ queryKey: ['quizzes'] });
        },
        onError: (err: Error) => {
            toast({ title: 'Could not complete quiz', description: err.message, variant: 'destructive' });
        },
    });
}
