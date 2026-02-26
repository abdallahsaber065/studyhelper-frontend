import { apiClient } from '@/api/client';

export interface UserActivitySummary {
    summary: {
        total_activities: number;
        successful_activities: number;
        success_rate: number;
        average_duration_ms: number;
        days_analyzed: number;
    };
    activity_counts: Record<string, number>;
    daily_activity: Record<string, number>;
}

export interface RecentActivity {
    id: string;
    activity_type: string;
    description?: string;
    resource_type?: string;
    resource_id?: string;
    started_at: string;
    completed_at?: string;
    success: boolean;
}

export interface RecentActivitiesResponse {
    activities: RecentActivity[];
    total: number;
}

export const dashboardService = {
    async getUserActivitySummary(days = 7): Promise<UserActivitySummary> {
        return apiClient.get<UserActivitySummary>(
            `/dashboards/summary/user-activity?days=${days}`
        );
    },

    async getRecentActivities(limit = 10, hours = 24 * 7): Promise<RecentActivitiesResponse> {
        return apiClient.get<RecentActivitiesResponse>(
            `/dashboards/activities/recent?limit=${limit}&hours=${hours}`
        );
    },
};
