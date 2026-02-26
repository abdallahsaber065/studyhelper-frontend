'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ErrorAlert } from '@/components/ui/alert';
import { ActivationBanner } from '@/components/ui/activation-banner';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showActivationBanner, setShowActivationBanner] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Check for registration success parameter
  useEffect(() => {
    const registration = searchParams.get('registration');
    const email = searchParams.get('email');

    if (registration === 'success' && email) {
      setSuccessMessage(`Registration successful! Please check your email (${email}) to activate your account before logging in.`);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowActivationBanner(false);

    if (!formData.username || !formData.password) {
      setError({ message: 'Please fill in all fields' });
      return;
    }

    try {
      const result = await login(formData);

      if (result.success) {
        // Check if user account is activated
        if (result.user && !result.user.is_active) {
          setShowActivationBanner(true);
          setUserEmail(result.user.email);
          return; // Don't redirect if account not activated
        }

        // Explicitly redirect to dashboard
        router.push('/dashboard');
      } else {
        // This shouldn't happen as login() throws errors rather than returning them
        setError({ message: 'Authentication failed' });
      }
    } catch (error: any) {
      console.error('Login error:', error);

      // Extract error from API response
      if (error.response?.data?.error) {
        // New API format
        setError({
          message: error.response.data.error.message,
          type: error.response.data.error.type,
          status: error.response.data.error.status_code
        });
      } else if (error.response?.data?.detail) {
        // Legacy format
        setError({ message: error.response.data.detail });
      } else {
        // Fallback
        setError({ message: 'Login failed. Please try again.' });
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <ErrorAlert
          error={error}
          dismissible
          onDismiss={() => setError(null)}
        />
      )}

      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 p-4 rounded-md mb-6">
          {successMessage}
        </div>
      )}

      {showActivationBanner && (
        <ActivationBanner email={userEmail || undefined} />
      )}

      <div className="space-y-2">
        <Label htmlFor="username">Username or Email</Label>
        <Input
          id="username"
          name="username"
          type="text"
          required
          placeholder="Enter your username or email"
          value={formData.username}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </Button>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </Button>

      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link
            href="/auth/register"
            className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium"
          >
            Create one here
          </Link>
        </p>
      </div>

      <div className="text-center">
        <Link
          href="/auth/forgot-password"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Forgot Password?
        </Link>
      </div>

      <div className="mt-2 text-center">
        <p className="text-gray-600 dark:text-gray-300">
          Didn't receive activation email?{' '}
          <Link href="/auth/resend-activation" className="text-blue-600 dark:text-blue-400 hover:underline">
            Resend it
          </Link>
        </p>
      </div>
    </form>
  );
} 