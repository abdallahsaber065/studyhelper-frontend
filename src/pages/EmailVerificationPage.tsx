import React from "react";
import { Link, useParams } from "react-router-dom";
import { BookOpen, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import { useVerifyEmail } from "@/hooks/useAuth";

export const EmailVerificationPage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const verifyEmailMutation = useVerifyEmail();
    const [isVerifying, setIsVerifying] = React.useState(false);
    const [verificationResult, setVerificationResult] = React.useState<'success' | 'error' | null>(null);

    React.useEffect(() => {
        if (token && !isVerifying && !verificationResult) {
            setIsVerifying(true);
            verifyEmailMutation.mutate(token, {
                onSuccess: () => {
                    setVerificationResult('success');
                    setIsVerifying(false);
                },
                onError: () => {
                    setVerificationResult('error');
                    setIsVerifying(false);
                },
            });
        }
    }, [token, verifyEmailMutation, isVerifying, verificationResult]);

    // If no token, show error state
    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="mx-auto w-full max-w-md space-y-6">
                    <div className="text-center">
                        <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold">
                            <BookOpen className="h-8 w-8 text-primary" />
                            StudyAssistant
                        </Link>
                        <div className="mt-8 flex justify-center">
                            <XCircle className="h-16 w-16 text-destructive" />
                        </div>
                        <h1 className="mt-4 text-2xl font-bold tracking-tight">
                            Invalid Verification Link
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            The email verification link is invalid or malformed.
                        </p>
                    </div>

                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <div className="text-center space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Please try requesting a new verification email.
                            </p>
                            <Button asChild className="w-full">
                                <Link to="/login">Go to Login</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Loading state
    if (isVerifying) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="mx-auto w-full max-w-md space-y-6">
                    <div className="text-center">
                        <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold">
                            <BookOpen className="h-8 w-8 text-primary" />
                            StudyAssistant
                        </Link>
                        <div className="mt-8 flex justify-center">
                            <Loader2 className="h-16 w-16 animate-spin text-primary" />
                        </div>
                        <h1 className="mt-4 text-2xl font-bold tracking-tight">
                            Verifying Your Email
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Please wait while we verify your email address...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Success state
    if (verificationResult === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="mx-auto w-full max-w-md space-y-6">
                    <div className="text-center">
                        <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold">
                            <BookOpen className="h-8 w-8 text-primary" />
                            StudyAssistant
                        </Link>
                        <div className="mt-8 flex justify-center">
                            <CheckCircle className="h-16 w-16 text-green-500" />
                        </div>
                        <h1 className="mt-4 text-2xl font-bold tracking-tight">
                            Email Verified Successfully!
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Your email has been verified. You can now sign in to your account.
                        </p>
                    </div>

                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <div className="text-center space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Welcome to StudyAssistant! You're ready to start creating summaries and quizzes.
                            </p>
                            <Button asChild className="w-full">
                                <Link to="/login">Sign In Now</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="mx-auto w-full max-w-md space-y-6">
                <div className="text-center">
                    <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold">
                        <BookOpen className="h-8 w-8 text-primary" />
                        StudyAssistant
                    </Link>
                    <div className="mt-8 flex justify-center">
                        <XCircle className="h-16 w-16 text-destructive" />
                    </div>
                    <h1 className="mt-4 text-2xl font-bold tracking-tight">
                        Verification Failed
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        The verification link has expired or is invalid.
                    </p>
                </div>

                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <div className="text-center space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Please try requesting a new verification email from the login page.
                        </p>
                        <Button asChild className="w-full">
                            <Link to="/login">Go to Login</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
