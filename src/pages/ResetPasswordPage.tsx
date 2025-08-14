import React from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpen, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button, Input, Label } from "@/components/ui";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/validations/auth";
import { useResetPassword } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";

export const ResetPasswordPage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const resetPasswordMutation = useResetPassword();
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data: ResetPasswordFormData) => {
        if (!token) {
            toast({
                variant: "destructive",
                title: "Invalid Reset Link",
                description: "The password reset link is invalid or has expired.",
            });
            return;
        }

        try {
            await resetPasswordMutation.mutateAsync({
                token,
                password: data.password,
            });
        } catch (error) {
            // Error handling is done in the mutation
            console.error("Reset password error:", error);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

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
                        <h1 className="mt-4 text-2xl font-bold tracking-tight">
                            Invalid Reset Link
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            The password reset link is invalid or has expired.
                        </p>
                    </div>

                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <div className="text-center space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Please request a new password reset link.
                            </p>
                            <Button
                                onClick={() => navigate("/forgot-password")}
                                className="w-full"
                            >
                                Request new reset link
                            </Button>
                        </div>
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
                        Reset your password
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Enter your new password below.
                    </p>
                </div>

                {/* Reset password form */}
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">New password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    placeholder="Create a new password"
                                    {...register("password")}
                                    className={errors.password ? "border-destructive pr-10" : "pr-10"}
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-sm text-destructive">
                                    {errors.password.message}
                                </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Must be at least 8 characters long
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm new password</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    placeholder="Confirm your new password"
                                    {...register("confirmPassword")}
                                    className={errors.confirmPassword ? "border-destructive pr-10" : "pr-10"}
                                />
                                <button
                                    type="button"
                                    onClick={toggleConfirmPasswordVisibility}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-sm text-destructive">
                                    {errors.confirmPassword.message}
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
                            Reset password
                        </Button>
                    </form>
                </div>

                {/* Back to login */}
                <div className="text-center">
                    <Link
                        to="/login"
                        className="text-sm font-medium text-primary hover:text-primary/80"
                    >
                        Back to login
                    </Link>
                </div>
            </div>
        </div>
    );
};
