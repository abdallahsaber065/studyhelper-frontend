import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Bell, Check, CheckCheck, X, Loader2 } from 'lucide-react';
import { useNotifications, useUnreadCount, useMarkNotificationRead, useMarkAllRead, useDismissNotification } from '@/hooks/useNotifications';
import { formatDistanceToNow } from '../../lib/dateUtils';

export const NotificationDropdown: React.FC = () => {
    const { data: unreadData } = useUnreadCount();
    const { data: notifData, isLoading } = useNotifications({ per_page: 10, include_read: false });
    const markReadMutation = useMarkNotificationRead();
    const markAllMutation = useMarkAllRead();
    const dismissMutation = useDismissNotification();

    const unreadCount = unreadData?.count ?? 0;
    const notifications = notifData?.notifications ?? [];

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button
                    className="relative p-2 hover:bg-accent hover:text-accent-foreground rounded-md"
                    aria-label="Notifications"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    align="end"
                    sideOffset={8}
                    className="z-50 w-80 rounded-md border bg-background shadow-lg"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b px-4 py-3">
                        <span className="font-semibold text-sm">Notifications</span>
                        {unreadCount > 0 && (
                            <button
                                onClick={() => markAllMutation.mutate()}
                                disabled={markAllMutation.isPending}
                                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 disabled:opacity-50"
                            >
                                {markAllMutation.isPending
                                    ? <Loader2 className="h-3 w-3 animate-spin" />
                                    : <CheckCheck className="h-3.5 w-3.5" />
                                }
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-72 overflow-y-auto">
                        {isLoading && (
                            <div className="flex justify-center py-6">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                        )}

                        {!isLoading && notifications.length === 0 && (
                            <div className="py-8 text-center text-sm text-muted-foreground">
                                <Bell className="mx-auto h-6 w-6 mb-2 opacity-40" />
                                No new notifications
                            </div>
                        )}

                        {notifications.map(n => (
                            <div
                                key={n.id}
                                className={`group relative flex gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b last:border-b-0 ${!n.is_read ? 'bg-primary/5' : ''
                                    }`}
                            >
                                {/* Unread dot */}
                                {!n.is_read && (
                                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                                )}

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium leading-tight">{n.title}</p>
                                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                                    <p className="mt-1 text-[10px] text-muted-foreground/70">
                                        {formatDistanceToNow(n.created_at)}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                    {!n.is_read && (
                                        <button
                                            title="Mark as read"
                                            onClick={() => markReadMutation.mutate([n.id])}
                                            className="p-1 rounded hover:bg-background text-muted-foreground hover:text-foreground"
                                        >
                                            <Check className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                    <button
                                        title="Dismiss"
                                        onClick={() => dismissMutation.mutate([n.id])}
                                        className="p-1 rounded hover:bg-background text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="border-t px-4 py-2">
                        <DropdownMenu.Item asChild>
                            <a
                                href="/app/notifications"
                                className="block text-center text-xs text-primary hover:text-primary/80"
                            >
                                View all notifications
                            </a>
                        </DropdownMenu.Item>
                    </div>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
};
