import apiClient from '@/lib/api-client';
import { QuestionTagRead } from '@/types/mcqs';

class TagsService {
    async getTags(params: { skip?: number; limit?: number; search?: string } = {}) {
        const response = await apiClient.get<QuestionTagRead[]>('/tags/tags', { params });
        return response.data;
    }

    async getTagById(tagId: number) {
        const response = await apiClient.get<QuestionTagRead>(`/tags/tags/${tagId}`);
        return response.data;
    }

    async createTag(tagData: { name: string; description?: string | null }) {
        const response = await apiClient.post<QuestionTagRead>('/tags/tags', tagData);
        return response.data;
    }

    async updateTag(tagId: number, tagData: { name?: string; description?: string | null }) {
        const response = await apiClient.put<QuestionTagRead>(`/tags/tags/${tagId}`, tagData);
        return response.data;
    }

    async deleteTag(tagId: number) {
        const response = await apiClient.delete(`/tags/tags/${tagId}`);
        return response.data;
    }
}

export const tagsService = new TagsService(); 