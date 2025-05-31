import { create } from 'zustand';
import { authService } from '@/services/auth';
import { User } from '@/types/auth';

interface UserState {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    setUser: (user: User | null) => void;
    login: (username: string, password: string) => Promise<User>;
    logout: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
    user: null,
    isLoading: true,
    isAuthenticated: false,

    setUser: (user) => set({
        user,
        isLoading: false,
        isAuthenticated: !!user
    }),

    login: async (username, password) => {
        try {
            const data = await authService.login({ username, password });
            set({ user: data.user, isAuthenticated: true, isLoading: false });
            return data.user;
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    logout: async () => {
        try {
            await authService.logout();
            set({ user: null, isAuthenticated: false });
        } catch (error) {
            console.error('Logout failed:', error);
            throw error;
        }
    }
})); 