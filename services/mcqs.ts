import apiClient from '@/lib/api-client';
import { 
  MCQGenerationRequest, 
  McqQuestionRead, 
  McqQuizRead, 
  McqQuizWithQuestions,
  QuizSessionRead,
  QuizSessionSubmit,
  QuestionTagRead
} from '@/types/mcqs';

class MCQsService {
  // MCQ Generation
  async generateMCQs(data: MCQGenerationRequest) {
    const response = await apiClient.post('/mcqs/generate', data);
    return response.data;
  }

  // Questions
  async getQuestions(params: { 
    skip?: number; 
    limit?: number; 
    tag_id?: number;
    difficulty?: string;
    my_questions?: boolean;
  } = {}) {
    const response = await apiClient.get<McqQuestionRead[]>('/mcqs/questions', { params });
    return response.data;
  }

  async getQuestionById(questionId: number) {
    const response = await apiClient.get<McqQuestionRead>(`/mcqs/questions/${questionId}`);
    return response.data;
  }

  // Quizzes
  async getQuizzes(params: {
    skip?: number;
    limit?: number;
    is_public?: boolean;
    my_quizzes?: boolean;
  } = {}) {
    const response = await apiClient.get<McqQuizRead[]>('/mcqs/quizzes', { params });
    return response.data;
  }

  async getQuizById(quizId: number) {
    const response = await apiClient.get<McqQuizWithQuestions>(`/mcqs/quizzes/${quizId}`);
    return response.data;
  }

  // Quiz Sessions
  async startQuizSession(quizId: number) {
    const response = await apiClient.post<QuizSessionRead>(`/mcqs/quizzes/${quizId}/sessions`);
    return response.data;
  }

  async getQuizSession(sessionId: number) {
    const response = await apiClient.get<QuizSessionRead>(`/mcqs/sessions/${sessionId}`);
    return response.data;
  }

  async submitQuizSession(sessionId: number, data: QuizSessionSubmit) {
    const response = await apiClient.post<QuizSessionRead>(`/mcqs/sessions/${sessionId}/submit`, data);
    return response.data;
  }

  async getMyQuizSessions(params: { skip?: number; limit?: number } = {}) {
    const response = await apiClient.get<QuizSessionRead[]>('/mcqs/sessions', { params });
    return response.data;
  }

  // Tags
  async getTags(params: { skip?: number; limit?: number; search?: string } = {}) {
    const response = await apiClient.get<QuestionTagRead[]>('/mcqs/tags', { params });
    return response.data;
  }
}

export const mcqsService = new MCQsService(); 