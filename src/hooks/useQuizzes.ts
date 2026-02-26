import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quizService, type QuizGenerateRequest, type QuizUpdateRequest } from '@/services/quizService';
import { useToast } from '@/hooks/useToast';

const QUIZZES_KEY = 'quizzes';

export function useQuizzes(params?: Parameters<typeof quizService.getQuizzes>[0]) {
    return useQuery({
        queryKey: [QUIZZES_KEY, params],
        queryFn: () => quizService.getQuizzes(params),
    });
}

export function useQuiz(quizId: string | null) {
    return useQuery({
        queryKey: [QUIZZES_KEY, quizId],
        queryFn: () => quizService.getQuiz(quizId!),
        enabled: !!quizId,
    });
}

export function useQuizProgress(quizId: string | null, enabled = false) {
    return useQuery({
        queryKey: [QUIZZES_KEY, quizId, 'progress'],
        queryFn: () => quizService.getQuizProgress(quizId!),
        enabled: !!quizId && enabled,
        refetchInterval: (query) => {
            const status = query.state.data?.status;
            return status === 'pending' || status === 'processing' ? 2000 : false;
        },
    });
}

export function useGenerateQuiz() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: (req: QuizGenerateRequest) => quizService.generateQuiz(req),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUIZZES_KEY] });
            toast({ title: 'Quiz generation started', description: 'We will notify you when it is ready.' });
        },
        onError: (err: Error) => {
            toast({ title: 'Generation failed', description: err.message, variant: 'destructive' });
        },
    });
}

export function useUpdateQuiz() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: ({ quizId, data }: { quizId: string; data: QuizUpdateRequest }) =>
            quizService.updateQuiz(quizId, data),
        onSuccess: (_data, vars) => {
            queryClient.invalidateQueries({ queryKey: [QUIZZES_KEY, vars.quizId] });
            queryClient.invalidateQueries({ queryKey: [QUIZZES_KEY] });
        },
        onError: (err: Error) => {
            toast({ title: 'Update failed', description: err.message, variant: 'destructive' });
        },
    });
}

export function useDeleteQuiz() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: (quizId: string) => quizService.deleteQuiz(quizId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUIZZES_KEY] });
            toast({ title: 'Quiz deleted' });
        },
        onError: (err: Error) => {
            toast({ title: 'Delete failed', description: err.message, variant: 'destructive' });
        },
    });
}

export function useRegenerateQuiz() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: ({ quizId, data }: { quizId: string; data?: Partial<QuizGenerateRequest> }) =>
            quizService.regenerateQuiz(quizId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUIZZES_KEY] });
            toast({ title: 'Regeneration started', description: 'New questions are being generated.' });
        },
        onError: (err: Error) => {
            toast({ title: 'Regeneration failed', description: err.message, variant: 'destructive' });
        },
    });
}

export function useQuizAnalytics() {
    return useQuery({
        queryKey: [QUIZZES_KEY, 'analytics'],
        queryFn: () => quizService.getAnalytics(),
    });
}
