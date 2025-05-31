export type DifficultyLevelEnum = "Easy" | "Medium" | "Hard";
export type CorrectAnswerEnum = "A" | "B" | "C" | "D";

export interface MCQGenerationRequest {
  physical_file_ids: number[];
  num_questions?: number;
  difficulty_level?: DifficultyLevelEnum;
  custom_instructions?: string;
  create_quiz?: boolean;
  quiz_title?: string;
  quiz_description?: string;
  community_id?: number;
}

export interface QuestionTagRead {
  name: string;
  description?: string;
  id: number;
  created_at: string;
  updated_at: string;
}

export interface McqQuestionRead {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c?: string;
  option_d?: string;
  correct_option: CorrectAnswerEnum;
  explanation?: string;
  hint?: string;
  difficulty_level: DifficultyLevelEnum;
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  tags: QuestionTagRead[];
}

export interface McqQuizRead {
  title: string;
  description?: string;
  difficulty_level: DifficultyLevelEnum;
  is_active: boolean;
  is_public: boolean;
  subject_id?: number;
  community_id?: number;
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  question_count: number;
}

export interface McqQuizWithQuestions extends McqQuizRead {
  questions: McqQuestionRead[];
}

export interface QuizSessionRead {
  id: number;
  user_id: number;
  quiz_id: number;
  started_at: string;
  completed_at?: string;
  score?: number;
  total_questions: number;
  answers_json?: Record<string, any>;
  time_taken_seconds?: number;
}

export interface QuizSessionAnswer {
  question_id: number;
  answer: CorrectAnswerEnum;
}

export interface QuizSessionSubmit {
  answers: QuizSessionAnswer[];
} 