import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Lock, User, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Branding */}
      <div className="lg:flex-1 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 flex flex-col justify-center text-white">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold mb-4">Welcome Back!</h1>
          <p className="text-lg opacity-90 mb-8">
            Continue your learning journey with Study Helper. Access your personalized 
            dashboard, track your progress, and collaborate with your study community.
          </p>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <span>Access your personal dashboard</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <span>Secure and private learning environment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="lg:flex-1 flex flex-col justify-center p-8 bg-white dark:bg-gray-900">
        <div className="max-w-md mx-auto w-full">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4 -ml-2">
              <Link href="/" className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Link>
            </Button>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Sign In</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Phase 1 Notice */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              🚧 Coming in Phase 1
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Login functionality will be implemented in Phase 1: Authentication & User Management. 
              This includes secure JWT authentication, password validation, and session management.
            </p>
          </div>

          {/* Planned Features */}
          <div className="space-y-4 mb-6">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                What's coming in the login form:
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>Email/Username and Password fields</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>Form validation and error handling</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>Remember me functionality</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>Password recovery option</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>Automatic redirect to dashboard</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
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
            
            <div className="flex space-x-3">
              <Button variant="outline" asChild className="flex-1">
                <Link href="/">Back to Home</Link>
              </Button>
              <Button asChild className="flex-1">
                <Link href="/demo">View Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 