import React, { useState } from 'react';
import { Bell, User, Check, Loader2 } from 'lucide-react';
import { useNotificationPreferences, useUpdateNotificationPreferences } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/useToast';
import { Link } from 'react-router-dom';
import type { NotificationPreference } from '@/services/notificationService';

// ── Helpers ───────────────────────────────────────────────────────────────────

const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
    file_upload: 'File Upload',
    file_processing: 'File Processing',
    summary_complete: 'Summary Complete',
    summary_failed: 'Summary Failed',
    quiz_complete: 'Quiz Complete',
    quiz_failed: 'Quiz Failed',
    account_security: 'Account & Security',
    email_verification: 'Email Verification',
    system_announcement: 'System Announcements',
    usage_limit: 'Usage Limit Warnings',
};

function getTypeLabel(type: string): string {
    return NOTIFICATION_TYPE_LABELS[type] ?? type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── ToggleRow ─────────────────────────────────────────────────────────────────

interface ToggleProps {
    checked: boolean;
    disabled?: boolean;
    onChange: (v: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ checked, disabled, onChange }) => (
    <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors
            ${checked ? 'bg-primary' : 'bg-muted-foreground/30'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
    >
        <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
                ${checked ? 'translate-x-6' : 'translate-x-1'}
            `}
        />
    </button>
);

// ── PreferenceRow ─────────────────────────────────────────────────────────────

interface PreferenceRowProps {
    pref: NotificationPreference;
    onChange: (updated: NotificationPreference) => void;
    saving: boolean;
}

const PreferenceRow: React.FC<PreferenceRowProps> = ({ pref, onChange, saving }) => (
    <tr className="border-t">
        <td className="py-3 pr-4 text-sm font-medium">{getTypeLabel(pref.notification_type)}</td>
        <td className="py-3 px-4 text-center">
            <Toggle
                checked={pref.in_app_enabled}
                disabled={saving}
                onChange={(v) => onChange({ ...pref, in_app_enabled: v })}
            />
        </td>
        <td className="py-3 px-4 text-center">
            <Toggle
                checked={pref.email_enabled}
                disabled={saving}
                onChange={(v) => onChange({ ...pref, email_enabled: v })}
            />
        </td>
        <td className="py-3 pl-4 text-center">
            <Toggle
                checked={pref.push_enabled}
                disabled={saving}
                onChange={(v) => onChange({ ...pref, push_enabled: v })}
            />
        </td>
    </tr>
);

// ── NotificationsTab ──────────────────────────────────────────────────────────

const NotificationsTab: React.FC = () => {
    const { data: serverPrefs, isLoading } = useNotificationPreferences();
    const updateMutation = useUpdateNotificationPreferences();
    const { toast } = useToast();

    // Local draft – allows instant UI response before save
    const [draft, setDraft] = React.useState<NotificationPreference[] | null>(null);

    React.useEffect(() => {
        if (serverPrefs && !draft) setDraft(serverPrefs);
    }, [serverPrefs, draft]);

    const prefs = draft ?? serverPrefs ?? [];

    const handleChange = (updated: NotificationPreference) => {
        setDraft((prev) => (prev ? prev.map((p) => (p.id === updated.id ? updated : p)) : null));
    };

    const handleSave = () => {
        if (!draft) return;
        updateMutation.mutate(draft, {
            onSuccess: () =>
                toast({ title: 'Preferences saved', description: 'Your notification preferences have been updated.' }),
            onError: (err: Error) =>
                toast({ variant: 'destructive', title: 'Save failed', description: err.message }),
        });
    };

    if (isLoading) {
        return (
            <div className="space-y-3 py-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 bg-muted rounded animate-pulse" />
                ))}
            </div>
        );
    }

    if (prefs.length === 0) {
        return (
            <div className="py-12 text-center text-muted-foreground">
                <Bell className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p>No notification preferences found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                Control which notifications you receive and through which channels.
            </p>
            <div className="overflow-x-auto rounded-lg border bg-card">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-muted/50 text-left">
                            <th className="py-3 pr-4 pl-4 font-medium text-muted-foreground">Notification Type</th>
                            <th className="py-3 px-4 font-medium text-muted-foreground text-center w-20">In-App</th>
                            <th className="py-3 px-4 font-medium text-muted-foreground text-center w-20">Email</th>
                            <th className="py-3 pr-4 pl-4 font-medium text-muted-foreground text-center w-20">Push</th>
                        </tr>
                    </thead>
                    <tbody className="px-4">
                        {prefs.map((pref) => (
                            <PreferenceRow
                                key={pref.id}
                                pref={pref}
                                onChange={handleChange}
                                saving={updateMutation.isPending}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                    {updateMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Check className="h-4 w-4" />
                    )}
                    {updateMutation.isPending ? 'Saving…' : 'Save Preferences'}
                </button>
            </div>
        </div>
    );
};

// ── AccountTab ────────────────────────────────────────────────────────────────

const AccountTab: React.FC = () => (
    <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
            Manage your personal information and account security on the{' '}
            <Link to="/app/profile" className="text-primary underline-offset-4 hover:underline">
                Profile page
            </Link>
            .
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
            <Link
                to="/app/profile"
                className="flex items-center gap-3 border rounded-lg p-4 hover:bg-muted/50 transition-colors"
            >
                <User className="h-5 w-5 text-primary shrink-0" />
                <div>
                    <p className="font-medium text-sm">Edit Profile</p>
                    <p className="text-xs text-muted-foreground">Update your email address</p>
                </div>
            </Link>
            <Link
                to="/app/notifications"
                className="flex items-center gap-3 border rounded-lg p-4 hover:bg-muted/50 transition-colors"
            >
                <Bell className="h-5 w-5 text-primary shrink-0" />
                <div>
                    <p className="font-medium text-sm">All Notifications</p>
                    <p className="text-xs text-muted-foreground">View your notification history</p>
                </div>
            </Link>
        </div>
    </div>
);

// ── SettingsPage ──────────────────────────────────────────────────────────────

type Tab = 'notifications' | 'account';

export const SettingsPage: React.FC = () => {
    const [tab, setTab] = useState<Tab>('notifications');

    const tabs: { id: Tab; label: string; Icon: React.FC<{ className?: string }> }[] = [
        { id: 'notifications', label: 'Notifications', Icon: Bell },
        { id: 'account', label: 'Account', Icon: User },
    ];

    return (
        <div className="max-w-3xl mx-auto space-y-6 p-4">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your app preferences and account settings</p>
            </div>

            {/* Tabs */}
            <div className="border-b flex gap-1">
                {tabs.map(({ id, label, Icon }) => (
                    <button
                        key={id}
                        onClick={() => setTab(id)}
                        className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors
                            ${tab === id
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                            }
                        `}
                    >
                        <Icon className="h-4 w-4" />
                        {label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            {tab === 'notifications' && <NotificationsTab />}
            {tab === 'account' && <AccountTab />}
        </div>
    );
};
