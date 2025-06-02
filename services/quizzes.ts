import apiClient from '@/lib/api-client';
import { McqQuizRead, QuizSessionRead } from '@/types/mcqs';

class QuizzesService {
    // Quizzes
    async getQuizzes(params: { skip?: number; limit?: number; my_quizzes?: boolean; is_public?: boolean } = {}) {
        const response = await apiClient.get<McqQuizRead[]>('/quizzes', { params });
        return response.data;
    }

    async getQuizById(quizId: number) {
        const response = await apiClient.get<McqQuizRead>(`/quizzes/${quizId}`);
        return response.data;
    }

    async createQuiz(quizData: any) {
        const response = await apiClient.post<McqQuizRead>('/quizzes', quizData);
        return response.data;
    }

    async updateQuiz(quizId: number, quizData: any) {
        const response = await apiClient.put<McqQuizRead>(`/quizzes/${quizId}`, quizData);
        return response.data;
    }

    async deleteQuiz(quizId: number) {
        await apiClient.delete(`/quizzes/${quizId}`);
        return true;
    }

    // Generate Quizzes
    async generateQuiz(generationData: any) {
        const response = await apiClient.post<McqQuizRead>('/quizzes/generate', generationData);
        return response.data;
    }

    // Quiz Sessions
    async startQuizSession(quizId: number) {
        const response = await apiClient.post<QuizSessionRead>(`/quizzes/${quizId}/sessions`);
        return response.data;
    }

    async getSession(sessionId: number) {
        const response = await apiClient.get<QuizSessionRead>(`/quizzes/sessions/${sessionId}`);
        return response.data;
    }

    async submitSession(sessionId: number, answers: { [key: number]: string }) {
        // Transform the answers format to match the API expectation
        const formattedAnswers = Object.entries(answers).map(([questionId, selectedOption]) => ({
            question_id: parseInt(questionId, 10),
            selected_option: selectedOption
        }));

        const response = await apiClient.post<QuizSessionRead>(
            `/quizzes/sessions/${sessionId}/submit`,
            { answers: formattedAnswers }
        );
        return response.data;
    }

    async updateSession(sessionId: number, answers: { [key: number]: string }) {
        // Transform the answers format to match the API expectation
        const formattedAnswers = Object.entries(answers).map(([questionId, selectedOption]) => ({
            question_id: parseInt(questionId, 10),
            selected_option: selectedOption
        }));

        const response = await apiClient.put<QuizSessionRead>(
            `/quizzes/sessions/${sessionId}`,
            { answers: formattedAnswers }
        );
        return response.data;
    }

    async deleteSession(sessionId: number) {
        await apiClient.delete(`/quizzes/sessions/${sessionId}`);
        return true;
    }

    async getUserSessions(params: { skip?: number; limit?: number } = {}) {
        const response = await apiClient.get<QuizSessionRead[]>('/quizzes/sessions', { params });
        return response.data;
    }

    async getActiveSessionForQuiz(quizId: number) {
        // Get all user sessions
        const sessions = await this.getUserSessions();

        // Find an active (not completed) session for the specific quiz
        const activeSession = sessions.find(session =>
            session.quiz_id === quizId &&
            !session.completed_at
        );

        return activeSession || null;
    }

    async hasActiveQuizSessions() {
        // Get all user sessions
        const sessions = await this.getUserSessions();

        // Check if there are any active (not completed) sessions
        const hasActiveSessions = sessions.some(session => !session.completed_at);

        return hasActiveSessions;
    }
}

export const quizzesService = new QuizzesService(); 