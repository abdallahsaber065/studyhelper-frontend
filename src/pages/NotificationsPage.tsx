import React, { useState } from 'react';
import { Bell, CheckCheck, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    useNotifications,
    useMarkNotificationRead,
    useMarkAllRead,
    useDismissNotification,
} from '@/hooks/useNotifications';
import { formatDistanceToNow } from '@/lib/dateUtils';

type Tab = 'all' | 'unread';

export const NotificationsPage: React.FC = () => {
    const [tab, setTab] = useState<Tab>('unread');
    const { data, isLoading, isError, error } = useNotifications({
        per_page: 50,
        include_read: tab === 'all',
    });
    const markReadMutation = useMarkNotificationRead();
    const markAllMutation = useMarkAllRead();
    const dismissMutation = useDismissNotification();

    const notifications = data?.notifications ?? [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                    <p className="text-muted-foreground">Stay up to date with your activity.</p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAllMutation.mutate()}
                    disabled={markAllMutation.isPending || notifications.every(n => n.is_read)}
                >
                    {markAllMutation.isPending ? (
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    ) : (
                        <CheckCheck className="mr-1.5 h-4 w-4" />
                    )}
                    Mark all read
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex border-b">
                {(['unread', 'all'] as Tab[]).map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${tab === t
                                ? 'border-primary text-foreground'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                ))}
            </div>

            {/* Content */}
            {isLoading && (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            )}

            {isError && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                    {(error as Error)?.message ?? 'Failed to load notifications.'}
                </div>
            )}

            {!isLoading && !isError && notifications.length === 0 && (
                <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 py-16 text-center">
                    <Bell className="mx-auto h-10 w-10 text-muted-foreground/40" />
                    <p className="mt-3 text-sm font-medium">No {tab === 'unread' ? 'unread ' : ''}notifications</p>
                    {tab === 'unread' && (
                        <p className="mt-1 text-xs text-muted-foreground">
                            You're all caught up!{' '}
                            <button
                                className="text-primary underline"
                                onClick={() => setTab('all')}
                            >
                                View all
                            </button>
                        </p>
                    )}
                </div>
            )}

            {!isLoading && notifications.length > 0 && (
                <div className="divide-y rounded-lg border">
                    {notifications.map(n => (
                        <div
                            key={n.id}
                            className={`flex items-start gap-4 px-4 py-4 group ${!n.is_read ? 'bg-primary/5' : ''
                                }`}
                        >
                            {!n.is_read && (
                                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                            )}

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{n.title}</p>
                                <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                                {n.action_url && n.action_text && (
                                    <a
                                        href={n.action_url}
                                        className="mt-1 inline-block text-xs text-primary hover:underline"
                                    >
                                        {n.action_text} →
                                    </a>
                                )}
                                <p className="mt-1 text-xs text-muted-foreground/70">
                                    {formatDistanceToNow(n.created_at)}
                                </p>
                            </div>

                            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!n.is_read && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-2 text-xs"
                                        onClick={() => markReadMutation.mutate([n.id])}
                                        disabled={markReadMutation.isPending}
                                    >
                                        Mark read
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2"
                                    onClick={() => dismissMutation.mutate([n.id])}
                                    disabled={dismissMutation.isPending}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {data && data.total > notifications.length && (
                <p className="text-center text-xs text-muted-foreground">
                    Showing {notifications.length} of {data.total}.{' '}
                    <button className="text-primary underline">Load more</button>
                </p>
            )}
        </div>
    );
};
