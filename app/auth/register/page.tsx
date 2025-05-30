import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UserPlus, Shield, ArrowLeft, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Branding */}
      <div className="lg:flex-1 bg-gradient-to-br from-emerald-600 to-teal-700 p-8 flex flex-col justify-center text-white">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold mb-4">Join Study Helper</h1>
          <p className="text-lg opacity-90 mb-8">
            Create your account and unlock the power of AI-driven learning. 
            Connect with study communities and accelerate your academic success.
          </p>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <UserPlus className="w-4 h-4" />
              </div>
              <span>Free account creation</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <span>Secure data protection</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
              <span>Instant access to all features</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
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
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Get started with your learning journey today
            </p>
          </div>

          {/* Phase 1 Notice */}
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
            <h3 className="text-sm font-medium text-emerald-900 dark:text-emerald-100 mb-2">
              🚧 Coming in Phase 1
            </h3>
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              Registration functionality will be implemented in Phase 1: Authentication & User Management. 
              This includes secure account creation, email verification, and profile setup.
            </p>
          </div>

          {/* Planned Features */}
          <div className="space-y-4 mb-6">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                What's coming in the registration form:
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <span>Full name, email, and password fields</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <span>Real-time password strength validation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <span>Email verification process</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <span>Terms of service agreement</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <span>Automatic profile creation</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Benefits Preview */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              What you'll get with your account:
            </h4>
            <div className="grid grid-cols-1 gap-2 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-3 h-3 text-emerald-500" />
                <span>Unlimited file uploads and AI summaries</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-3 h-3 text-emerald-500" />
                <span>Custom quiz generation and progress tracking</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-3 h-3 text-emerald-500" />
                <span>Access to study communities and collaboration</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-3 h-3 text-emerald-500" />
                <span>Personalized learning analytics and insights</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link 
                  href="/auth/login" 
                  className="text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 font-medium"
                >
                  Sign in here
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