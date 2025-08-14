import React from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpen, ArrowLeft, Loader2 } from "lucide-react";
import { Button, Input, Label } from "@/components/ui";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validations/auth";
import { useForgotPassword } from "@/hooks/useAuth";

export const ForgotPasswordPage: React.FC = () => {
    const forgotPasswordMutation = useForgotPassword();
    const [isSubmitted, setIsSubmitted] = React.useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        getValues,
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        try {
            await forgotPasswordMutation.mutateAsync(data.email);
            setIsSubmitted(true);
        } catch (error) {
            // Error handling is done in the mutation
            console.error("Forgot password error:", error);
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="mx-auto w-full max-w-md space-y-6">
                    <div className="text-center">
                        <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold">
                            <BookOpen className="h-8 w-8 text-primary" />
                            StudyAssistant
                        </Link>
                        <h1 className="mt-4 text-2xl font-bold tracking-tight">
                            Check your email
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            We've sent a password reset link to {getValues("email")}
                        </p>
                    </div>

                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <div className="text-center space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Didn't receive the email? Check your spam folder or try again.
                            </p>
                            <Button
                                onClick={() => setIsSubmitted(false)}
                                variant="outline"
                                className="w-full"
                            >
                                Try again
                            </Button>
                        </div>
                    </div>

                    <div className="text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="mx-auto w-full max-w-md space-y-6">
                {/* Logo and header */}
                <div className="text-center">
                    <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold">
                        <BookOpen className="h-8 w-8 text-primary" />
                        StudyAssistant
                    </Link>
                    <h1 className="mt-4 text-2xl font-bold tracking-tight">
                        Forgot your password?
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                {/* Forgot password form */}
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                autoComplete="email"
                                placeholder="Enter your email"
                                {...register("email")}
                                className={errors.email ? "border-destructive" : ""}
                            />
                            {errors.email && (
                                <p className="text-sm text-destructive">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isSubmitting}
                        >
                            {isSubmitting && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Send reset link
                        </Button>
                    </form>
                </div>

                {/* Back to login */}
                <div className="text-center">
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to login
                    </Link>
                </div>
            </div>
        </div>
    );
};
