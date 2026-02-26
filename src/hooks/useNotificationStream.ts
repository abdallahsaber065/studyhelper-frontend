import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Connects to the server-sent events (SSE) stream at /notifications/stream
 * and invalidates the notification cache whenever a new event arrives.
 *
 * Call this hook once in a high-level component (e.g. Header or AuthProvider).
 */
export function useNotificationStream() {
    const queryClient = useQueryClient();
    const { token, isAuthenticated } = useAuthStore();
    const esRef = useRef<EventSource | null>(null);

    useEffect(() => {
        if (!isAuthenticated || !token) return;

        const url = `${API_BASE_URL}/notifications/stream?token=${encodeURIComponent(token)}`;
        const es = new EventSource(url);
        esRef.current = es;

        const invalidate = () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        };

        es.addEventListener('message', invalidate);
        es.addEventListener('notification', invalidate);

        es.onerror = () => {
            // EventSource auto-reconnects; ignore transient errors
        };

        return () => {
            es.close();
            esRef.current = null;
        };
    }, [isAuthenticated, token, queryClient]);
}
