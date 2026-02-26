'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Button } from './button';

interface ActivationBannerProps {
    email?: string;
    dismissible?: boolean;
    onDismiss?: () => void;
}

export function ActivationBanner({
    email,
    dismissible = false,
    onDismiss
}: ActivationBannerProps) {
    return (
        <div className="bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 p-4 rounded-md mb-6 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="flex-grow">
                <p className="font-medium">Your account is not activated</p>
                <p className="mt-1">
                    {email
                        ? `Please check ${email} and click the activation link to activate your account.`
                        : 'Please check your email and click the activation link to activate your account.'}
                </p>
                <p className="mt-1 text-sm text-amber-700 dark:text-amber-200">
                    <strong>Tip:</strong> If you don't see the email, please check your spam or junk folder.
                </p>
                <div className="mt-2 flex items-center gap-4">
                    <Link href="/auth/resend-activation" className="text-amber-800 dark:text-amber-300 underline font-medium">
                        Resend activation email
                    </Link>
                    {dismissible && onDismiss && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onDismiss}
                            className="text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900"
                        >
                            Dismiss
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
} 