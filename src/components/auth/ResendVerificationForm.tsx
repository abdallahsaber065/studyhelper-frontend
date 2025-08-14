import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Loader2 } from "lucide-react";
import { Button, Input, Label } from "@/components/ui";
import { resendVerificationSchema, type ResendVerificationFormData } from "@/lib/validations/auth";
import { useResendVerification } from "@/hooks/useAuth";

interface ResendVerificationProps {
    initialEmail?: string;
    onClose?: () => void;
}

export const ResendVerificationForm: React.FC<ResendVerificationProps> = ({
    initialEmail = "",
    onClose,
}) => {
    const resendVerificationMutation = useResendVerification();
    const [isSent, setIsSent] = React.useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        getValues,
    } = useForm<ResendVerificationFormData>({
        resolver: zodResolver(resendVerificationSchema),
        defaultValues: {
            email: initialEmail,
        },
    });

    const onSubmit = async (data: ResendVerificationFormData) => {
        try {
            await resendVerificationMutation.mutateAsync(data.email);
            setIsSent(true);
        } catch (error) {
            // Error handling is done in the mutation
            console.error("Resend verification error:", error);
        }
    };

    if (isSent) {
        return (
            <div className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <Mail className="h-12 w-12 text-green-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Verification Email Sent</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            We've sent a new verification email to {getValues("email")}
                        </p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                            Didn't receive it? Check your spam folder or wait a few minutes before trying again.
                        </p>
                        <Button
                            onClick={() => setIsSent(false)}
                            variant="outline"
                            size="sm"
                        >
                            Send to different email
                        </Button>
                        {onClose && (
                            <Button
                                onClick={onClose}
                                variant="ghost"
                                size="sm"
                                className="w-full"
                            >
                                Close
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="space-y-4">
                <div className="text-center">
                    <h3 className="text-lg font-semibold">Resend Verification Email</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Enter your email to receive a new verification link
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            {...register("email")}
                            type="email"
                            placeholder="Enter your email"
                            disabled={isSubmitting}
                            className={errors.email ? "border-destructive" : ""}
                        />
                        {errors.email && (
                            <p className="text-sm text-destructive">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Send Verification Email
                                </>
                            )}
                        </Button>
                        {onClose && (
                            <Button
                                type="button"
                                onClick={onClose}
                                variant="outline"
                            >
                                Cancel
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};
