import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notificationService';
import { useToast } from '@/hooks/useToast';

const NOTIF_KEY = 'notifications';

export function useNotifications(params?: Parameters<typeof notificationService.getNotifications>[0]) {
    return useQuery({
        queryKey: [NOTIF_KEY, params],
        queryFn: () => notificationService.getNotifications(params),
        staleTime: 30_000,
    });
}

export function useUnreadCount() {
    return useQuery({
        queryKey: [NOTIF_KEY, 'unread-count'],
        queryFn: () => notificationService.getUnreadCount(),
        refetchInterval: 60_000, // poll every minute as a fallback
        staleTime: 30_000,
    });
}

export function useMarkNotificationRead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (ids: string[]) => notificationService.markRead(ids),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [NOTIF_KEY] });
        },
    });
}

export function useMarkAllRead() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: () => notificationService.markAllRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [NOTIF_KEY] });
            toast({ title: 'All notifications marked as read' });
        },
        onError: (err: Error) => {
            toast({ title: 'Failed', description: err.message, variant: 'destructive' });
        },
    });
}

export function useDismissNotification() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (ids: string[]) => notificationService.dismiss(ids),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [NOTIF_KEY] });
        },
    });
}

export function useNotificationPreferences() {
    return useQuery({
        queryKey: [NOTIF_KEY, 'preferences'],
        queryFn: () => notificationService.getPreferences(),
    });
}

export function useUpdateNotificationPreferences() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: (updates: Parameters<typeof notificationService.updatePreferences>[0]) =>
            notificationService.updatePreferences(updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [NOTIF_KEY, 'preferences'] });
            toast({ title: 'Preferences saved' });
        },
        onError: (err: Error) => {
            toast({ title: 'Failed to save', description: err.message, variant: 'destructive' });
        },
    });
}
