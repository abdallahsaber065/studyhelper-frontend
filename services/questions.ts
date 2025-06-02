import apiClient from '@/lib/api-client';
import { MCQGenerationRequest, McqQuestionRead, QuestionTagRead } from '@/types/mcqs';

class QuestionsService {
    // Questions
    async getQuestions(params: { skip?: number; limit?: number; search?: string } = {}) {
        const response = await apiClient.get<McqQuestionRead[]>('/mcqs/questions', { params });
        return response.data;
    }

    async getQuestionById(questionId: number) {
        const response = await apiClient.get<McqQuestionRead>(`/mcqs/questions/${questionId}`);
        return response.data;
    }

    async createQuestion(questionData: any) {
        const response = await apiClient.post<McqQuestionRead>('/mcqs/questions', questionData);
        return response.data;
    }

    async updateQuestion(questionId: number, questionData: any) {
        const response = await apiClient.put<McqQuestionRead>(`/mcqs/questions/${questionId}`, questionData);
        return response.data;
    }

    async deleteQuestion(questionId: number) {
        const response = await apiClient.delete(`/mcqs/questions/${questionId}`);
        return response.data;
    }
}

export const questionsService = new QuestionsService(); 