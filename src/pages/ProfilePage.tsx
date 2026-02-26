import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { User, Mail, Calendar, Shield, Trash2, Save, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCurrentUser } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { apiClient } from '@/api/client';
import { formatDistanceToNow } from '@/lib/dateUtils';
import { useNavigate } from 'react-router-dom';

// ─── Schema ──────────────────────────────────────────────────────────────────

const updateEmailSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
});

type UpdateEmailForm = z.infer<typeof updateEmailSchema>;

// ─── ProfilePage ─────────────────────────────────────────────────────────────

export const ProfilePage: React.FC = () => {
    const { data: user, isLoading } = useCurrentUser();
    const { clearAuth } = useAuthStore();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
        reset,
    } = useForm<UpdateEmailForm>({
        resolver: zodResolver(updateEmailSchema),
        defaultValues: { email: user?.email ?? '' },
    });

    // Re-sync default values when user data loads
    React.useEffect(() => {
        if (user) reset({ email: user.email });
    }, [user, reset]);

    // ── Update email mutation ────────────────────────────────────────────────

    const updateEmailMutation = useMutation({
        mutationFn: (data: UpdateEmailForm) => apiClient.put('/users/me', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
            toast({
                title: 'Email updated',
                description: 'Your email has been updated. Please verify your new address.',
            });
        },
        onError: (error: Error) => {
            toast({
                variant: 'destructive',
                title: 'Update failed',
                description: error.message || 'Failed to update email. Please try again.',
            });
        },
    });

    // ── Delete account mutation ──────────────────────────────────────────────

    const deleteAccountMutation = useMutation({
        mutationFn: () => apiClient.delete('/users/me'),
        onSuccess: () => {
            clearAuth();
            queryClient.clear();
            toast({ title: 'Account deleted', description: 'Your account has been permanently deleted.' });
            navigate('/');
        },
        onError: (error: Error) => {
            toast({
                variant: 'destructive',
                title: 'Deletion failed',
                description: error.message || 'Failed to delete account. Please try again.',
            });
        },
    });

    const onSubmit = (data: UpdateEmailForm) => {
        updateEmailMutation.mutate(data);
    };

    // ─── Render ───────────────────────────────────────────────────────────────

    if (isLoading) {
        return (
            <div className="max-w-2xl mx-auto space-y-6 p-4">
                <div className="h-8 bg-muted rounded animate-pulse w-48" />
                <div className="border rounded-lg p-6 space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-10 bg-muted rounded animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 p-4">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Profile</h1>
                <p className="text-muted-foreground mt-1">Manage your account information</p>
            </div>

            {/* Avatar + basic info card */}
            <div className="border rounded-lg p-6 flex items-center gap-5 bg-card">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="h-8 w-8 text-primary" />
                </div>
                <div className="min-w-0">
                    <p className="font-semibold text-lg truncate">{user?.email}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            Joined {user?.created_at ? formatDistanceToNow(user.created_at) : '—'}
                        </span>
                        <span className="flex items-center gap-1">
                            {user?.is_verified ? (
                                <>
                                    <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                    <span className="text-green-600 dark:text-green-400">Verified</span>
                                </>
                            ) : (
                                <>
                                    <XCircle className="h-3.5 w-3.5 text-amber-500" />
                                    <span className="text-amber-600 dark:text-amber-400">Unverified</span>
                                </>
                            )}
                        </span>
                        <span className="flex items-center gap-1">
                            <Shield className="h-3.5 w-3.5" />
                            ID #{user?.id}
                        </span>
                    </div>
                </div>
            </div>

            {/* Update email form */}
            <div className="border rounded-lg bg-card">
                <div className="px-6 py-4 border-b">
                    <h2 className="font-semibold flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Address
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Changing your email will require re-verification.
                    </p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label htmlFor="email" className="text-sm font-medium">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            {...register('email')}
                            className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                        />
                        {errors.email && (
                            <p className="text-sm text-destructive">{errors.email.message}</p>
                        )}
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={!isDirty || updateEmailMutation.isPending}
                            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Save className="h-4 w-4" />
                            {updateEmailMutation.isPending ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Danger zone */}
            <div className="border border-destructive/40 rounded-lg bg-card">
                <div className="px-6 py-4 border-b border-destructive/20">
                    <h2 className="font-semibold text-destructive flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Danger Zone
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        These actions are irreversible.
                    </p>
                </div>
                <div className="p-6 flex items-center justify-between gap-4">
                    <div>
                        <p className="font-medium text-sm">Delete Account</p>
                        <p className="text-sm text-muted-foreground">
                            Permanently delete your account and all associated data.
                        </p>
                    </div>

                    <AlertDialog.Root>
                        <AlertDialog.Trigger asChild>
                            <button className="inline-flex shrink-0 items-center gap-2 border border-destructive text-destructive px-4 py-2 rounded-md text-sm font-medium hover:bg-destructive hover:text-destructive-foreground transition-colors">
                                <Trash2 className="h-4 w-4" />
                                Delete Account
                            </button>
                        </AlertDialog.Trigger>
                        <AlertDialog.Portal>
                            <AlertDialog.Overlay className="fixed inset-0 bg-black/50 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                            <AlertDialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-background border rounded-lg p-6 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
                                <AlertDialog.Title className="text-lg font-semibold text-destructive">
                                    Delete your account?
                                </AlertDialog.Title>
                                <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">
                                    This will permanently delete your account, all uploaded files, summaries, and quiz data.
                                    <strong className="block mt-3 text-foreground">
                                        Type <span className="font-mono text-destructive">DELETE</span> to confirm.
                                    </strong>
                                </AlertDialog.Description>
                                <input
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                    placeholder="Type DELETE"
                                    className="mt-3 w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-destructive/50"
                                />
                                <div className="mt-4 flex justify-end gap-2">
                                    <AlertDialog.Cancel asChild>
                                        <button
                                            onClick={() => setDeleteConfirmText('')}
                                            className="px-4 py-2 text-sm rounded-md border hover:bg-muted transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </AlertDialog.Cancel>
                                    <AlertDialog.Action asChild>
                                        <button
                                            disabled={deleteConfirmText !== 'DELETE' || deleteAccountMutation.isPending}
                                            onClick={() => deleteAccountMutation.mutate()}
                                            className="px-4 py-2 text-sm rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {deleteAccountMutation.isPending ? 'Deleting…' : 'Delete Account'}
                                        </button>
                                    </AlertDialog.Action>
                                </div>
                            </AlertDialog.Content>
                        </AlertDialog.Portal>
                    </AlertDialog.Root>
                </div>
            </div>
        </div>
    );
};
