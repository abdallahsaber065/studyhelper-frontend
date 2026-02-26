import Link from 'next/link';
import { Button } from '@/components/ui/button';
import RegisterForm from '@/components/auth/RegisterForm';
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

          {/* Registration Form */}
          <RegisterForm />

          {/* Navigation */}
          <div className="mt-6">
            <Button variant="outline" asChild className="w-full">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 