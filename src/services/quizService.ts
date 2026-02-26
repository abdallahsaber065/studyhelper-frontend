import { apiClient } from '@/api/client';

// ── Enums ─────────────────────────────────────────────────────────────────────

export type QuizStatus =
    | 'pending'
    | 'processing'
    | 'completed'
    | 'failed'
    | 'cancelled'
    | 'archived';

export type QuizDifficulty =
    | 'beginner'
    | 'intermediate'
    | 'advanced'
    | 'expert'
    | 'adaptive';

export type QuestionType =
    | 'multiple_choice'
    | 'true_false'
    | 'short_answer'
    | 'long_answer'
    | 'fill_in_blank';

export type AttemptStatus =
    | 'in_progress'
    | 'completed'
    | 'abandoned'
    | 'time_expired';

// ── Request Shapes ────────────────────────────────────────────────────────────

export interface QuizGenerateRequest {
    file_id: string;
    title: string;
    description?: string;
    difficulty_level?: QuizDifficulty;
    question_count?: number;
    estimated_time_minutes?: number;
    time_limit_minutes?: number;
    question_types?: QuestionType[];
    topics_to_focus?: string[];
    ai_provider?: 'openai' | 'gemini' | 'anthropic';
    ai_model?: string;
    custom_instructions?: string;
    shuffle_questions?: boolean;
    shuffle_answers?: boolean;
    show_correct_answers?: boolean;
    allow_retries?: boolean;
    passing_score?: number;
}

export interface QuizUpdateRequest {
    title?: string;
    description?: string;
    difficulty_level?: QuizDifficulty;
    time_limit_minutes?: number;
    shuffle_questions?: boolean;
    shuffle_answers?: boolean;
    show_correct_answers?: boolean;
    allow_retries?: boolean;
    max_attempts?: number;
    passing_score?: number;
    user_rating?: number;
    user_feedback?: string;
}

// ── Response Shapes ───────────────────────────────────────────────────────────

export interface QuizQuestion {
    id: string;
    question_text: string;
    question_type: QuestionType;
    options?: string[];       // for multiple_choice / true_false
    correct_answer?: string;  // shown only when show_correct_answers is true
    explanation?: string;
    points: number;
    difficulty_level?: string;
    topic?: string;
    order_index: number;
}

export interface Quiz {
    id: string;
    user_id: number;
    file_id: string;
    title: string;
    description?: string;
    status: QuizStatus;
    difficulty_level: QuizDifficulty;
    question_count: number;
    questions?: QuizQuestion[];
    estimated_time_minutes?: number;
    time_limit_minutes?: number;
    ai_provider?: string;
    ai_model_used?: string;
    quality_score?: number;
    pass_rate?: number;
    average_score?: number;
    total_attempts: number;
    task_id?: string;
    progress_percentage?: number;
    created_at: string;
    updated_at?: string;
}

export interface QuizListResponse {
    quizzes: Quiz[];
    total_count: number;
    page: number;
    page_size: number;
    has_next: boolean;
}

export interface QuizProgressResponse {
    task_id: string;
    quiz_id: string;
    status: QuizStatus;
    progress_percentage: number;
    current_step: string;
    estimated_time_remaining?: number;
    questions_generated: number;
    total_questions_target: number;
    error_message?: string;
}

export interface QuizAttemptQuestion {
    id: string;
    question_text: string;
    question_type: QuestionType;
    options?: string[];
    points: number;
    order_index: number;
}

export interface QuizAttempt {
    id: string;
    quiz_id: string;
    user_id: number;
    status: AttemptStatus;
    score?: number;
    percentage_score?: number;
    time_spent_seconds?: number;
    started_at: string;
    completed_at?: string;
    questions: QuizAttemptQuestion[];
}

export interface QuizAttemptResult {
    attempt_id: string;
    quiz_id: string;
    score: number;
    percentage_score: number;
    passed: boolean;
    time_spent_seconds: number;
    questions_correct: number;
    questions_total: number;
    answers: AnswerResult[];
}

export interface AnswerResult {
    question_id: string;
    question_text: string;
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
    points_earned: number;
    points_possible: number;
    explanation?: string;
}

export interface QuizAnalytics {
    total_quizzes: number;
    completed_quizzes: number;
    total_attempts: number;
    average_score: number;
    quizzes_by_difficulty: Record<string, number>;
    quizzes_by_status: Record<string, number>;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const quizService = {
    async generateQuiz(request: QuizGenerateRequest): Promise<QuizProgressResponse> {
        return apiClient.post<QuizProgressResponse>('/quizzes/generate', request);
    },

    async getQuizzes(params?: {
        page?: number;
        page_size?: number;
        search_query?: string;
        status?: string[];
        difficulty_level?: string[];
    }): Promise<QuizListResponse> {
        const sp = new URLSearchParams();
        if (params?.page) sp.set('page', String(params.page));
        if (params?.page_size) sp.set('page_size', String(params.page_size));
        if (params?.search_query) sp.set('search_query', params.search_query);
        if (params?.status) params.status.forEach(s => sp.append('status', s));
        if (params?.difficulty_level) params.difficulty_level.forEach(d => sp.append('difficulty_level', d));
        const qs = sp.toString();
        return apiClient.get<QuizListResponse>(qs ? `/quizzes?${qs}` : '/quizzes');
    },

    async getQuiz(quizId: string): Promise<Quiz> {
        return apiClient.get<Quiz>(`/quizzes/${quizId}`);
    },

    async getQuizProgress(quizId: string): Promise<QuizProgressResponse> {
        return apiClient.get<QuizProgressResponse>(`/quizzes/${quizId}/progress`);
    },

    async updateQuiz(quizId: string, data: QuizUpdateRequest): Promise<Quiz> {
        return apiClient.put<Quiz>(`/quizzes/${quizId}`, data);
    },

    async deleteQuiz(quizId: string): Promise<{ message: string }> {
        return apiClient.delete<{ message: string }>(`/quizzes/${quizId}`);
    },

    async regenerateQuiz(quizId: string, data?: Partial<QuizGenerateRequest>): Promise<QuizProgressResponse> {
        return apiClient.post<QuizProgressResponse>(`/quizzes/${quizId}/regenerate`, data ?? {});
    },

    async startAttempt(quizId: string): Promise<QuizAttempt> {
        return apiClient.post<QuizAttempt>(`/quizzes/${quizId}/attempts/start`, {});
    },

    async answerQuestion(
        quizId: string,
        attemptId: string,
        questionId: string,
        answer: string
    ): Promise<{ is_correct?: boolean; points_earned?: number }> {
        return apiClient.post(`/quizzes/${quizId}/attempts/${attemptId}/answer`, {
            question_id: questionId,
            answer,
        });
    },

    async completeAttempt(quizId: string, attemptId: string): Promise<QuizAttemptResult> {
        return apiClient.post<QuizAttemptResult>(`/quizzes/${quizId}/attempts/${attemptId}/complete`, {});
    },

    async getAnalytics(): Promise<QuizAnalytics> {
        return apiClient.get<QuizAnalytics>('/quizzes/analytics');
    },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

export const getDifficultyLabel = (d: QuizDifficulty): string => ({
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    expert: 'Expert',
    adaptive: 'Adaptive',
}[d] ?? d);

export const getDifficultyColor = (d: QuizDifficulty): string => ({
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-blue-100 text-blue-700',
    advanced: 'bg-orange-100 text-orange-700',
    expert: 'bg-red-100 text-red-700',
    adaptive: 'bg-purple-100 text-purple-700',
}[d] ?? 'bg-gray-100 text-gray-700');

export const getStatusColor = (s: QuizStatus): string => ({
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-700',
    archived: 'bg-gray-100 text-gray-500',
}[s] ?? 'bg-gray-100 text-gray-700');
