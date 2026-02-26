import { apiClient } from '@/api/client';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Notification {
    id: string;
    user_id: number;
    type: string;
    priority: string;
    title: string;
    message: string;
    status: string;
    is_read: boolean;
    is_expired: boolean;
    action_url?: string;
    action_text?: string;
    data?: Record<string, unknown>;
    created_at: string;
    read_at?: string;
}

export interface NotificationList {
    notifications: Notification[];
    total: number;
    page: number;
    per_page: number;
    has_next: boolean;
    has_prev: boolean;
}

export interface UnreadCount {
    count: number;
}

export interface NotificationPreference {
    id: string;
    notification_type: string;
    in_app_enabled: boolean;
    email_enabled: boolean;
    push_enabled: boolean;
}

export interface NotificationStats {
    total: number;
    unread: number;
    read: number;
    by_type: Record<string, number>;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const notificationService = {
    async getNotifications(params?: {
        page?: number;
        per_page?: number;
        include_read?: boolean;
    }): Promise<NotificationList> {
        const sp = new URLSearchParams();
        if (params?.page) sp.set('page', String(params.page));
        if (params?.per_page) sp.set('per_page', String(params.per_page));
        if (params?.include_read !== undefined)
            sp.set('include_read', String(params.include_read));
        const qs = sp.toString();
        return apiClient.get<NotificationList>(
            qs ? `/notifications?${qs}` : '/notifications'
        );
    },

    async getUnreadCount(): Promise<UnreadCount> {
        return apiClient.get<UnreadCount>('/notifications/unread/count');
    },

    async markRead(notificationIds: string[]): Promise<{ message: string }> {
        return apiClient.put('/notifications/read', { notification_ids: notificationIds });
    },

    async markAllRead(): Promise<{ message: string }> {
        return apiClient.put('/notifications/read/all', {});
    },

    async dismiss(notificationIds: string[]): Promise<{ message: string }> {
        return apiClient.put('/notifications/dismiss', {
            notification_ids: notificationIds,
        });
    },

    async getPreferences(): Promise<NotificationPreference[]> {
        return apiClient.get<NotificationPreference[]>('/notifications/preferences');
    },

    async updatePreferences(
        updates: Partial<NotificationPreference>[]
    ): Promise<NotificationPreference[]> {
        return apiClient.put<NotificationPreference[]>('/notifications/preferences', {
            preferences: updates,
        });
    },

    async getStats(): Promise<NotificationStats> {
        return apiClient.get<NotificationStats>('/notifications/stats');
    },
};
