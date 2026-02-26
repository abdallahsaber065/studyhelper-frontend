import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { useAuthStore } from '@/store/authStore';
import {
  LandingPage,
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  EmailVerificationPage,
  DashboardPage,
  FilesPage,
  SummariesPage,
  QuizzesPage,
  NotificationsPage,
  ProfilePage,
  SettingsPage,
  AnalyticsPage,
  HelpPage,
} from '@/pages';

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route component (redirect if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const router = createBrowserRouter([
  // Landing page (public)
  {
    path: '/',
    element: (
      <PublicRoute>
        <LandingPage />
      </PublicRoute>
    ),
  },

  // Authentication routes (public)
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <RegisterPage />
      </PublicRoute>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <PublicRoute>
        <ForgotPasswordPage />
      </PublicRoute>
    ),
  },
  {
    path: '/reset-password/:token',
    element: (
      <PublicRoute>
        <ResetPasswordPage />
      </PublicRoute>
    ),
  },
  {
    path: '/verify-email/:token',
    element: <EmailVerificationPage />,
  },

  // Protected application routes
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/app/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'files',
        element: <FilesPage />,
      },
      {
        path: 'summaries',
        element: <SummariesPage />,
      },
      {
        path: 'quizzes',
        element: <QuizzesPage />,
      },
      {
        path: 'notifications',
        element: <NotificationsPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'analytics',
        element: <AnalyticsPage />,
      },
      {
        path: 'help',
        element: <HelpPage />,
      },
    ],
  },

  // Convenience redirects for protected routes
  {
    path: '/dashboard',
    element: <Navigate to="/app/dashboard" replace />,
  },
  {
    path: '/files',
    element: <Navigate to="/app/files" replace />,
  },
  {
    path: '/summaries',
    element: <Navigate to="/app/summaries" replace />,
  },
  {
    path: '/quizzes',
    element: <Navigate to="/app/quizzes" replace />,
  },
  {
    path: '/notifications',
    element: <Navigate to="/app/notifications" replace />,
  },
  {
    path: '/profile',
    element: <Navigate to="/app/profile" replace />,
  },
  {
    path: '/settings',
    element: <Navigate to="/app/settings" replace />,
  },

  // Catch all route
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
