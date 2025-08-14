import React, { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCurrentUser } from '@/hooks/useAuth';

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const { token, isAuthenticated, setUser, clearAuth } = useAuthStore();
    const { data: user, error, isLoading } = useCurrentUser();

    useEffect(() => {
        if (token && isAuthenticated && user) {
            setUser(user);
        } else if (error && token) {
            // Token is invalid, clear auth
            clearAuth();
        }
    }, [user, error, token, isAuthenticated, setUser, clearAuth]);

    // Don't render children until we've checked authentication status
    if (token && isAuthenticated && isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
