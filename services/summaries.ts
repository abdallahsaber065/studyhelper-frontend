import apiClient from '@/lib/api-client';
import { SummaryRead, SummaryGenerateRequest, SummaryGenerateResponse, SummaryUpdate } from '@/types/summaries';

class SummariesService {
  async getSummaries(params: { skip?: number; limit?: number; search?: string; file_id?: number } = {}) {
    const response = await apiClient.get<SummaryRead[]>('/summaries/', { params });
    return response.data;
  }

  async getSummaryById(summaryId: number) {
    const response = await apiClient.get<SummaryRead>(`/summaries/${summaryId}`);
    return response.data;
  }

  async generateSummary(data: SummaryGenerateRequest, communityId?: number) {
    const params = communityId ? { community_id: communityId } : {};
    const response = await apiClient.post<SummaryGenerateResponse>('/summaries/generate', data, { params });
    return response.data;
  }

  async updateSummary(summaryId: number, data: SummaryUpdate) {
    const response = await apiClient.put<SummaryRead>(`/summaries/${summaryId}`, data);
    return response.data;
  }

  async deleteSummary(summaryId: number) {
    await apiClient.delete(`/summaries/${summaryId}`);
  }
}

export const summariesService = new SummariesService(); 