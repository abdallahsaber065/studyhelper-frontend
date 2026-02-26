export interface SummaryRead {
  title: string;
  full_markdown: string;
  id: number;
  user_id: number;
  physical_file_id?: number;
  created_at: string;
  updated_at: string;
  community_id?: number;
}

export interface SummaryGenerateRequest {
  physical_file_ids: number[];
  custom_instructions?: string;
}

export interface SummaryGenerateResponse {
  message: string;
  summary: SummaryRead;
}

export interface SummaryUpdate {
  title?: string;
  full_markdown?: string;
  community_id?: number;
} 