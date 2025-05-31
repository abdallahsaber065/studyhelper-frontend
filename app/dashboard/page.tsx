'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useProtectedRoute } from '@/hooks/useAuth';
import { filesService } from '@/services/files';
import { useState, useEffect } from 'react';
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
  FolderOpen,
  ListChecks,
  Share2,
  Zap,
  Activity
} from 'lucide-react';

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useProtectedRoute();
  const [fileStats, setFileStats] = useState({ 
    totalFiles: 0,
    sharedWithMe: 0,
    sharedByMe: 0 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [showLoading, setShowLoading] = useState(false);

  // Feature cards for the dashboard
  const featureCards = [
    {
      title: 'My Files',
      description: 'Manage your uploaded files and documents',
      icon: <FolderOpen className="w-8 h-8 text-blue-500" />,
      href: '/files',
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Generate Summary',
      description: 'Create AI-powered summaries from your files',
      icon: <Brain className="w-8 h-8 text-purple-500" />,
      href: '/summaries/generate',
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Generate MCQs',
      description: 'Create practice questions from your study materials',
      icon: <MessageSquare className="w-8 h-8 text-teal-500" />,
      href: '/mcqs/generate',
      color: 'teal',
      gradient: 'from-teal-500 to-teal-600'
    },
    {
      title: 'My Summaries',
      description: 'View and manage your generated summaries',
      icon: <FileText className="w-8 h-8 text-indigo-500" />,
      href: '/summaries',
      color: 'indigo',
      gradient: 'from-indigo-500 to-indigo-600'
    },
    {
      title: 'My Quizzes',
      description: 'Practice with quizzes created from your materials',
      icon: <ListChecks className="w-8 h-8 text-amber-500" />,
      href: '/mcqs/quizzes',
      color: 'amber',
      gradient: 'from-amber-500 to-amber-600',
      comingSoon: true
    },
    {
      title: 'Communities',
      description: 'Join or create study groups with shared resources',
      icon: <Users className="w-8 h-8 text-emerald-500" />,
      href: '/communities',
      color: 'emerald',
      gradient: 'from-emerald-500 to-emerald-600',
      comingSoon: true
    }
  ];

  // Recent activity mock data
  const recentActivity = [
    { type: 'upload', title: 'Uploaded a new file', time: '2 hours ago' },
    { type: 'summary', title: 'Generated a summary', time: '5 hours ago' },
    { type: 'mcq', title: 'Created MCQ questions', time: '1 day ago' },
  ];

  // Handle loading state client-side only
  useEffect(() => {
    // Only show loading spinner on the client
    setShowLoading(authLoading);
  }, [authLoading]);

  useEffect(() => {
    const fetchFileStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const files = await filesService.getFiles();
        
        // Calculate file stats
        const totalFiles = files.length;
        const sharedWithMe = files.filter(file => !file.is_owner).length;
        
        // For shared by me, get the access list for each file the user owns
        let sharedByMe = 0;
        for (const file of files) {
          if (file.is_owner) {
            try {
              const accessList = await filesService.getFileAccess(file.id);
              if (accessList && accessList.length > 0) {
                sharedByMe++;
              }
            } catch (err) {
              // Ignore errors for individual file access lists
              console.error(`Failed to get access list for file ${file.id}:`, err);
            }
          }
        }
        
        setFileStats({
          totalFiles,
          sharedWithMe,
          sharedByMe
        });
      } catch (error) {
        console.error('Failed to fetch file stats:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchFileStats();
    }
  }, [user]);

  // Render loading state only on client after first render
  if (showLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // useProtectedRoute will handle redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user.username}!</h1>
              <p className="text-blue-100 max-w-2xl">
                Your personal study assistant is ready to help you learn more efficiently. 
                Create summaries, generate practice questions, and collaborate with others.
              </p>
            </div>
            <div className="mt-6 md:mt-0">
              <Button asChild className="bg-white text-blue-600 hover:bg-blue-50 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-gray-700">
                <Link href="/files/upload" className="flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Upload New File
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8">
        {/* Stats Row - Elevated Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Files</h3>
                <div className="mt-1">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {loading ? '-' : fileStats.totalFiles}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Shared with Me</h3>
                <div className="mt-1">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {loading ? '-' : fileStats.sharedWithMe}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                <Share2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Shared by Me</h3>
                <div className="mt-1">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {loading ? '-' : fileStats.sharedByMe}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          {/* Main Content Area */}
          <div className="lg:w-2/3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              <span className="flex items-center">
                <Zap className="w-6 h-6 mr-2 text-amber-500" />
                Quick Actions
              </span>
            </h2>
            
            {/* Feature Cards - Grid with color highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featureCards.slice(0, 4).map((feature, index) => (
                <div
                  key={index}
                  className={`relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 ${feature.comingSoon ? 'opacity-70' : ''}`}
                >
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${feature.gradient}`}></div>
                  <div className="p-6">
                    <div className="flex items-start">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${feature.color}-100 dark:bg-${feature.color}-900/20 mb-4`}>
                        {feature.icon}
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {feature.title}
                          {feature.comingSoon && (
                            <span className="ml-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-0.5">
                              Coming Soon
                            </span>
                          )}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                    <Button
                      asChild
                      variant={feature.comingSoon ? "outline" : "default"}
                      disabled={feature.comingSoon}
                      className="w-full mt-2"
                    >
                      <Link href={feature.comingSoon ? "#" : feature.href} className="flex items-center justify-center">
                        {feature.comingSoon ? 'Coming Soon' : 'Get Started'}
                        {!feature.comingSoon && <ArrowRight className="w-4 h-4 ml-2" />}
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-500" />
                Recent Activity
              </h2>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0 last:pb-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center 
                      ${activity.type === 'upload' ? 'bg-blue-100 dark:bg-blue-900/20' : 
                        activity.type === 'summary' ? 'bg-purple-100 dark:bg-purple-900/20' : 
                        'bg-teal-100 dark:bg-teal-900/20'}`}>
                      {activity.type === 'upload' ? 
                        <FileText className="w-4 h-4 text-blue-600" /> : 
                        activity.type === 'summary' ? 
                        <Brain className="w-4 h-4 text-purple-600" /> : 
                        <MessageSquare className="w-4 h-4 text-teal-600" />}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Coming soon features</h3>
                <div className="space-y-2">
                  {featureCards.slice(4).map((feature, index) => (
                    <div key={index} className="flex items-center py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-${feature.color}-100 dark:bg-${feature.color}-900/20`}>
                        {feature.icon}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{feature.title}</p>
                      </div>
                      <div className="ml-auto">
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Soon</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 