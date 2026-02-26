import { apiClient } from '@/api/client';

// API request/response types
export interface SummaryGenerateRequest {
  file_id: string;
  title: string;
  summary_type: 'general' | 'academic' | 'technical' | 'executive';
  ai_provider?: 'openai' | 'gemini' | 'anthropic';
  ai_model?: string;
  max_length?: number;
  temperature?: number;
  custom_instructions?: string;
}

export interface SummaryProgressResponse {
  task_id: string;
  summary_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress_percentage: number;
  current_step: string;
  error_message?: string;
}

export interface Summary {
  id: string;
  user_id: number;
  file_id: string;
  title: string;
  content: string;
  summary_type: string;
  ai_provider: string;
  ai_model_used: string;
  input_tokens?: number;
  output_tokens?: number;
  processing_cost?: number;
  processing_time_ms?: number;
  quality_score?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  correlation_id?: string;
  task_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface SummaryListResponse {
  summaries: Summary[];
  total_count: number;
  page: number;
  per_page: number;
  has_next: boolean;
}

export interface SummaryUpdateRequest {
  title?: string;
  content?: string;
}

export interface SummaryDeleteResponse {
  message: string;
  deleted_summary_id: string;
}

// Summary service functions
export const summaryService = {
  // Generate a new summary
  async generateSummary(request: SummaryGenerateRequest): Promise<SummaryProgressResponse> {
    return apiClient.post<SummaryProgressResponse>('/summaries/generate', request);
  },

  // Get list of summaries
  async getSummaries(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    summary_type?: string;
    status?: string;
    file_id?: string;
  }): Promise<SummaryListResponse> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.summary_type) searchParams.set('summary_type', params.summary_type);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.file_id) searchParams.set('file_id', params.file_id);

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/summaries/?${queryString}` : '/summaries/';

    return apiClient.get<SummaryListResponse>(endpoint);
  },

  // Get specific summary
  async getSummary(summaryId: string): Promise<Summary> {
    return apiClient.get<Summary>(`/summaries/${summaryId}`);
  },

  // Get summary progress
  async getSummaryProgress(summaryId: string): Promise<SummaryProgressResponse> {
    return apiClient.get<SummaryProgressResponse>(`/summaries/${summaryId}/progress`);
  },

  // Update summary
  async updateSummary(summaryId: string, data: SummaryUpdateRequest): Promise<Summary> {
    return apiClient.put<Summary>(`/summaries/${summaryId}`, data);
  },

  // Delete summary
  async deleteSummary(summaryId: string): Promise<SummaryDeleteResponse> {
    return apiClient.delete<SummaryDeleteResponse>(`/summaries/${summaryId}`);
  },

  // Cancel summary generation
  async cancelSummary(taskId: string): Promise<{ message: string }> {
    return apiClient.post(`/summaries/cancel/${taskId}`);
  },

  // Get summary analytics
  async getSummaryAnalytics(): Promise<{
    total_summaries: number;
    completed_summaries: number;
    failed_summaries: number;
    processing_summaries: number;
    total_tokens_used: number;
    total_cost: number;
    average_quality_score: number;
    summaries_by_type: Record<string, number>;
    summaries_by_provider: Record<string, number>;
  }> {
    return apiClient.get('/summaries/analytics');
  },

  // Get available summary template types
  async getSummaryTemplates(): Promise<string[]> {
    return apiClient.get<string[]>('/summaries/templates');
  },
};

// Utility functions
export const getSummaryTypeLabel = (type: string): string => {
  switch (type) {
    case 'general':
      return 'General';
    case 'academic':
      return 'Academic';
    case 'technical':
      return 'Technical';
    case 'executive':
      return 'Executive';
    default:
      return 'General';
  }
};

export const getSummaryStatusColor = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getSummaryStatusLabel = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'processing':
      return 'Processing';
    case 'pending':
      return 'Pending';
    case 'failed':
      return 'Failed';
    default:
      return 'Unknown';
  }
};

export const formatProcessingTime = (timeMs?: number): string => {
  if (!timeMs) return 'N/A';

  if (timeMs < 1000) return `${timeMs}ms`;
  if (timeMs < 60000) return `${Math.round(timeMs / 1000)}s`;

  const minutes = Math.floor(timeMs / 60000);
  const seconds = Math.round((timeMs % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
};

export const formatCost = (cost?: number): string => {
  if (cost === undefined || cost === null) return 'N/A';
  return `$${cost.toFixed(4)}`;
};

export const formatTokens = (tokens?: number): string => {
  if (!tokens) return 'N/A';
  return tokens.toLocaleString();
};
