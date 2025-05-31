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

  // Quizzes
  async getQuizzes(params: { skip?: number; limit?: number; my_quizzes?: boolean; is_public?: boolean } = {}) {
    const response = await apiClient.get<McqQuizRead[]>('/mcqs/quizzes', { params });
    return response.data;
  }

  async getQuizById(quizId: number) {
    const response = await apiClient.get<McqQuizRead>(`/mcqs/quizzes/${quizId}`);
    return response.data;
  }

  async createQuiz(quizData: any) {
    const response = await apiClient.post<McqQuizRead>('/mcqs/quizzes', quizData);
    return response.data;
  }

  async updateQuiz(quizId: number, quizData: any) {
    const response = await apiClient.put<McqQuizRead>(`/mcqs/quizzes/${quizId}`, quizData);
    return response.data;
  }

  async deleteQuiz(quizId: number) {
    await apiClient.delete(`/mcqs/quizzes/${quizId}`);
    return true;
  }

  // Quiz Sessions
  async startQuizSession(quizId: number) {
    const response = await apiClient.post<QuizSessionRead>(`/mcqs/quizzes/${quizId}/sessions`);
    return response.data;
  }

  async getSession(sessionId: number) {
    const response = await apiClient.get<QuizSessionRead>(`/mcqs/sessions/${sessionId}`);
    return response.data;
  }

  async submitSession(sessionId: number, answers: { [key: number]: string }) {
    // Transform the answers format to match the API expectation
    const formattedAnswers = Object.entries(answers).map(([questionId, selectedOption]) => ({
      question_id: parseInt(questionId, 10),
      selected_option: selectedOption
    }));
    
    const response = await apiClient.post<QuizSessionRead>(
      `/mcqs/sessions/${sessionId}/submit`, 
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
      `/mcqs/sessions/${sessionId}`, 
      { answers: formattedAnswers }
    );
    return response.data;
  }

  async deleteSession(sessionId: number) {
    await apiClient.delete(`/mcqs/sessions/${sessionId}`);
    return true;
  }

  async getUserSessions(params: { skip?: number; limit?: number } = {}) {
    const response = await apiClient.get<QuizSessionRead[]>('/mcqs/sessions', { params });
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

  // Tags
  async getTags(params: { skip?: number; limit?: number; search?: string } = {}) {
    const response = await apiClient.get<QuestionTagRead[]>('/mcqs/tags', { params });
    return response.data;
  }

  async createTag(tagData: { name: string; description?: string | null }) {
    const response = await apiClient.post<QuestionTagRead>('/mcqs/tags', tagData);
    return response.data;
  }

  async updateTag(tagId: number, tagData: { name?: string; description?: string | null }) {
    const response = await apiClient.put<QuestionTagRead>(`/mcqs/tags/${tagId}`, tagData);
    return response.data;
  }

  async deleteTag(tagId: number) {
    const response = await apiClient.delete(`/mcqs/tags/${tagId}`);
    return response.data;
  }
}

export const mcqsService = new MCQsService(); 