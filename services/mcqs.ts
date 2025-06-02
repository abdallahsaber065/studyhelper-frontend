import { questionsService } from './questions';
import { tagsService } from './tags';
import { quizzesService } from './quizzes';

// Re-export the separate services
export {
    questionsService,
    tagsService,
    quizzesService
};

// For backward compatibility, export a combined service
export const mcqsService = {
    // Questions methods
    getQuestions: questionsService.getQuestions.bind(questionsService),
    getQuestionById: questionsService.getQuestionById.bind(questionsService),
    createQuestion: questionsService.createQuestion.bind(questionsService),
    updateQuestion: questionsService.updateQuestion.bind(questionsService),
    deleteQuestion: questionsService.deleteQuestion.bind(questionsService),

    // Tags methods
    getTags: tagsService.getTags.bind(tagsService),
    createTag: tagsService.createTag.bind(tagsService),
    getTagById: tagsService.getTagById.bind(tagsService),
    updateTag: tagsService.updateTag.bind(tagsService),
    deleteTag: tagsService.deleteTag.bind(tagsService),

    // Quizzes methods
    getQuizzes: quizzesService.getQuizzes.bind(quizzesService),
    getQuizById: quizzesService.getQuizById.bind(quizzesService),
    createQuiz: quizzesService.createQuiz.bind(quizzesService),
    updateQuiz: quizzesService.updateQuiz.bind(quizzesService),
    deleteQuiz: quizzesService.deleteQuiz.bind(quizzesService),
    generateQuiz: quizzesService.generateQuiz.bind(quizzesService),

    // Quiz Sessions methods
    startQuizSession: quizzesService.startQuizSession.bind(quizzesService),
    getSession: quizzesService.getSession.bind(quizzesService),
    submitSession: quizzesService.submitSession.bind(quizzesService),
    updateSession: quizzesService.updateSession.bind(quizzesService),
    deleteSession: quizzesService.deleteSession.bind(quizzesService),
    getUserSessions: quizzesService.getUserSessions.bind(quizzesService),
    getActiveSessionForQuiz: quizzesService.getActiveSessionForQuiz.bind(quizzesService),
    hasActiveQuizSessions: quizzesService.hasActiveQuizSessions.bind(quizzesService)
}; 