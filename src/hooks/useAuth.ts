import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/authService";
import { useToast } from "./useToast";

export const useLogin = () => {
    const navigate = useNavigate();
    const { setAuth, setLoading } = useAuthStore();
    const { toast } = useToast();

    return useMutation({
        mutationFn: authService.login,
        onMutate: () => {
            setLoading(true);
        },
        onSuccess: async (tokenData) => {
            try {
                console.log("🔐 Login successful, received tokens:", {
                    access_token: tokenData.access_token.substring(0, 20) + "...",
                    refresh_token: tokenData.refresh_token.substring(0, 20) + "...",
                    expires_in: tokenData.expires_in
                });

                // Save tokens first, so they're available for the user request
                const { setTokens } = useAuthStore.getState();
                setTokens(tokenData.access_token, tokenData.refresh_token);

                console.log("💾 Tokens saved to store, fetching user data...");

                // Now get user data with the token available
                const user = await authService.getCurrentUser();
                console.log("👤 User data fetched:", { id: user.id, email: user.email, is_verified: user.is_verified });

                setAuth(user, tokenData.access_token, tokenData.refresh_token);

                toast({
                    title: "Welcome back!",
                    description: "You have successfully signed in.",
                });

                navigate("/dashboard");
            } catch (error) {
                console.error("❌ Error in login flow:", error);
                setLoading(false);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to fetch user data. Please try again.",
                });
            }
        },
        onError: (error: Error) => {
            setLoading(false);
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: error.message || "Invalid email or password.",
            });
        },
    });
};

export const useRegister = () => {
    const navigate = useNavigate();
    const { setLoading } = useAuthStore();
    const { toast } = useToast();

    return useMutation({
        mutationFn: authService.register,
        onMutate: () => {
            setLoading(true);
        },
        onSuccess: () => {
            setLoading(false);
            toast({
                title: "Account Created Successfully!",
                description: "Please check your email for a verification link before signing in.",
            });
            navigate("/login");
        },
        onError: (error: Error) => {
            setLoading(false);
            toast({
                variant: "destructive",
                title: "Registration Failed",
                description: error.message || "Failed to create account. Please try again.",
            });
        },
    });
};

export const useLogout = () => {
    const navigate = useNavigate();
    const { clearAuth } = useAuthStore();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: authService.logout,
        onSuccess: () => {
            clearAuth();
            queryClient.clear();
            toast({
                title: "Signed Out",
                description: "You have been successfully signed out.",
            });
            navigate("/");
        },
        onError: () => {
            // Even if the API call fails, we should clear local auth
            clearAuth();
            queryClient.clear();
            navigate("/");
        },
    });
};

export const useCurrentUser = () => {
    const { token, isAuthenticated } = useAuthStore();

    return useQuery({
        queryKey: ["user", "me"],
        queryFn: authService.getCurrentUser,
        enabled: !!token && isAuthenticated,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: (failureCount, error: any) => {
            // Don't retry on auth errors
            if (error?.message?.includes("401") || error?.message?.includes("unauthorized")) {
                return false;
            }
            return failureCount < 3;
        },
    });
};

export const useAuthGuard = () => {
    const { isAuthenticated, token } = useAuthStore();
    const navigate = useNavigate();

    if (!isAuthenticated || !token) {
        navigate("/login");
        return false;
    }

    return true;
};

export const useVerifyEmail = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    return useMutation({
        mutationFn: authService.verifyEmail,
        onSuccess: () => {
            toast({
                title: "Email Verified",
                description: "Your email has been successfully verified. You can now sign in.",
            });
            navigate("/login");
        },
        onError: (error: Error) => {
            toast({
                variant: "destructive",
                title: "Verification Failed",
                description: error.message || "Failed to verify email. The link may be expired or invalid.",
            });
            navigate("/login");
        },
    });
};

export const useResendVerification = () => {
    const { toast } = useToast();

    return useMutation({
        mutationFn: authService.resendVerificationEmail,
        onSuccess: () => {
            toast({
                title: "Verification Email Sent",
                description: "A new verification email has been sent. Please check your inbox.",
            });
        },
        onError: (error: Error) => {
            toast({
                variant: "destructive",
                title: "Failed to Send Email",
                description: error.message || "Failed to send verification email. Please try again later.",
            });
        },
    });
};

export const useForgotPassword = () => {
    const { toast } = useToast();

    return useMutation({
        mutationFn: authService.requestPasswordReset,
        onSuccess: () => {
            toast({
                title: "Reset Email Sent",
                description: "A password reset link has been sent to your email.",
            });
        },
        onError: (error: Error) => {
            toast({
                variant: "destructive",
                title: "Failed to Send Reset Email",
                description: error.message || "Failed to send password reset email. Please try again.",
            });
        },
    });
};

export const useResetPassword = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({ token, password }: { token: string; password: string }) =>
            authService.resetPassword(token, password),
        onSuccess: () => {
            toast({
                title: "Password Reset",
                description: "Your password has been successfully reset. You can now sign in.",
            });
            navigate("/login");
        },
        onError: (error: Error) => {
            toast({
                variant: "destructive",
                title: "Reset Failed",
                description: error.message || "Failed to reset password. The link may be expired or invalid.",
            });
        },
    });
};
