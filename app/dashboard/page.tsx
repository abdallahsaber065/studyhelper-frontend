'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useProtectedRoute } from '@/hooks/useAuth';
import { 
  FileText, 
  Brain, 
  Users, 
  BarChart, 
  Settings, 
  MessageSquare,
  Award,
  Bell,
  Search,
  Plus,
  ArrowRight,
  Clock,
  TrendingUp,
  User,
  Loader2,
  Upload,
  CheckCircle
} from 'lucide-react';

export default function DashboardPage() {
  const { user, logout, isLoading } = useProtectedRoute();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // useProtectedRoute will handle redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-xl font-bold text-primary">
                Study Helper
              </Link>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Search className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild size="sm">
                  <Link href="/profile" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{user.first_name}</span>
                  </Link>
                </Button>
                <Button variant="outline" onClick={logout} size="sm">
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">
              Welcome back, {user.first_name}! 👋
            </h2>
            <p className="text-blue-100 mb-4">
              Your personalized dashboard for AI-powered learning and collaboration.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" size="sm" asChild>
                <Link href="/files/upload">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-blue-600">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Progress
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Files Uploaded</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">AI Summaries</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
              </div>
              <Brain className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Quizzes Taken</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
              </div>
              <Award className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Communities</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
              </div>
              <Users className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Primary Features */}
          <div className="lg:col-span-2 space-y-6">
            {/* File Management Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">File Management</h3>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-full">
                  Available
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Upload, organize, and share your study materials with intelligent categorization.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">Smart Upload</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Drag & drop with progress tracking</p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">File Sharing</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Secure sharing with access control</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button asChild className="flex-1">
                  <Link href="/files/upload">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Files
                  </Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/files">
                    <FileText className="w-4 h-4 mr-2" />
                    Manage Files
                  </Link>
                </Button>
              </div>
            </div>

            {/* AI Content Generation */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Content Generation</h3>
                <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded-full">
                  Phase 3
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Generate intelligent summaries and MCQs from your study materials using AI.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">Smart Summaries</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">AI-powered content extraction</p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">MCQ Generation</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Automatic quiz creation</p>
                </div>
              </div>
              <Button disabled variant="outline" className="w-full">
                <Clock className="w-4 h-4 mr-2" />
                Coming Soon
              </Button>
            </div>

            {/* Quiz System */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Interactive Quizzes</h3>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-full">
                  Phase 4
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create custom quizzes, take tests, and track your learning progress.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">Quiz Builder</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Create custom question sets</p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">Progress Tracking</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Detailed performance analytics</p>
                </div>
              </div>
              <Button disabled variant="outline" className="w-full">
                <Clock className="w-4 h-4 mr-2" />
                Coming Soon
              </Button>
            </div>
          </div>

          {/* Right Column - Secondary Features */}
          <div className="space-y-6">
            {/* Study Communities */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Communities</h3>
                <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 rounded-full">
                  Phase 5
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Join study groups and collaborate with peers.
              </p>
              <Button disabled variant="outline" className="w-full">
                <Users className="w-4 h-4 mr-2" />
                Explore Communities
              </Button>
            </div>

            {/* Content Interactions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Interactions</h3>
                <span className="px-2 py-1 text-xs bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 rounded-full">
                  Phase 6
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Comment, rate, and engage with content.
              </p>
              <Button disabled variant="outline" className="w-full">
                <MessageSquare className="w-4 h-4 mr-2" />
                View Discussions
              </Button>
            </div>

            {/* Analytics */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Analytics</h3>
                <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-full">
                  Phase 8
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Track your learning progress and performance.
              </p>
              <Button disabled variant="outline" className="w-full">
                <BarChart className="w-4 h-4 mr-2" />
                View Reports
              </Button>
            </div>

            {/* Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile</h3>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-full">
                  Available
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Manage your account and preferences.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/profile">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Profile
                </Link>
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button asChild variant="ghost" className="w-full justify-start">
                  <Link href="/">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Back to Home
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 