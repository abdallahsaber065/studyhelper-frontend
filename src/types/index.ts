// Authentication types
export interface User {
  id: number;
  email: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginCredentials {
  username: string; // Backend expects username field for OAuth2 compatibility
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
}

export interface MessageResponse {
  message: string;
  detail?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  new_password: string;
}

// File types
export interface FileMetadata {
  id: string;
  user_id: number;
  original_filename: string;
  stored_filename: string;
  file_size: number;
  mime_type: string;
  upload_date: string;
}

// Summary types
export interface Summary {
  id: string;
  user_id: number;
  file_id: string;
  title: string;
  content: string;
  ai_model_used: string;
  tokens_used: number;
  generation_cost: number;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
}

// Quiz types
export interface Quiz {
  id: string;
  user_id: number;
  file_id: string;
  title: string;
  description?: string;
  difficulty_level: "easy" | "medium" | "hard";
  question_count: number;
  estimated_time: number;
  ai_model_used: string;
  tokens_used: number;
  quality_score?: number;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
}

export interface Question {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: "multiple_choice" | "true_false" | "short_answer" | "essay";
  options?: string[];
  correct_answer: string;
  explanation?: string;
  points: number;
  order_index: number;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// WebSocket types
export interface WebSocketMessage {
  type: "progress" | "notification" | "error";
  data: any;
  timestamp: string;
}

export interface ProgressUpdate {
  task_id: string;
  progress: number;
  status: string;
  message?: string;
}
