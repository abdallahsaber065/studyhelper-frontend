import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';
import { fileService } from '@/services/fileService';
import { summaryService } from '@/services/summaryService';
import { quizService } from '@/services/quizService';

const DASHBOARD_KEY = 'dashboard';

export function useUserActivitySummary(days = 7) {
    return useQuery({
        queryKey: [DASHBOARD_KEY, 'user-activity', days],
        queryFn: () => dashboardService.getUserActivitySummary(days),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useRecentActivities(limit = 10) {
    return useQuery({
        queryKey: [DASHBOARD_KEY, 'recent-activities', limit],
        queryFn: () => dashboardService.getRecentActivities(limit),
        staleTime: 2 * 60 * 1000,
    });
}

/** Aggregate stats: file count, summary count, quiz count */
export function useDashboardStats() {
    const files = useQuery({
        queryKey: [DASHBOARD_KEY, 'stats', 'files'],
        queryFn: () => fileService.getFiles({ page: 1, per_page: 1 }),
        staleTime: 5 * 60 * 1000,
    });

    const summaries = useQuery({
        queryKey: [DASHBOARD_KEY, 'stats', 'summaries'],
        queryFn: () => summaryService.getSummaries({ page: 1, per_page: 1 }),
        staleTime: 5 * 60 * 1000,
    });

    const quizzes = useQuery({
        queryKey: [DASHBOARD_KEY, 'stats', 'quizzes'],
        queryFn: () => quizService.getQuizzes({ page: 1, page_size: 1 }),
        staleTime: 5 * 60 * 1000,
    });

    const analytics = useQuery({
        queryKey: [DASHBOARD_KEY, 'stats', 'quiz-analytics'],
        queryFn: () => quizService.getAnalytics(),
        staleTime: 5 * 60 * 1000,
    });

    return {
        filesCount: files.data?.total_count ?? null,
        summariesCount: summaries.data?.total_count ?? null,
        quizzesCount: quizzes.data?.total_count ?? null,
        averageScore: analytics.data?.average_score ?? null,
        isLoading:
            files.isLoading ||
            summaries.isLoading ||
            quizzes.isLoading ||
            analytics.isLoading,
    };
}
