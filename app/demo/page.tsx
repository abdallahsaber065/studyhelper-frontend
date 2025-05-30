'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { checkApiHealth } from '@/lib/health-check';
import { 
  CheckCircle, 
  Clock, 
  Lock, 
  Activity, 
  Users, 
  FileText, 
  Brain, 
  MessageSquare, 
  Settings, 
  BarChart, 
  Shield,
  Rocket,
  ArrowLeft,
  AlertCircle,
  Wifi
} from 'lucide-react';

interface PhaseData {
  id: number;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'locked';
  icon: React.ComponentType<any>;
  features: string[];
  route?: string;
}

const phases: PhaseData[] = [
  {
    id: 0,
    title: 'Project Setup & Initial Configuration',
    description: 'Next.js foundation, UI components, API setup, and basic layout',
    status: 'completed',
    icon: Rocket,
    features: ['Next.js App Router', 'Tailwind CSS', 'TypeScript', 'API Client', 'Modern UI Components'],
    route: '/'
  },
  {
    id: 1,
    title: 'Authentication & User Management',
    description: 'User registration, login, logout, profile management, and protected routes',
    status: 'completed',
    icon: Shield,
    features: ['User Registration', 'Login/Logout', 'JWT Management', 'Protected Routes', 'Profile Updates'],
    route: '/auth/login'
  },
  {
    id: 2,
    title: 'File Management',
    description: 'Upload, view, list, and share files with intelligent organization',
    status: 'current',
    icon: FileText,
    features: ['File Upload', 'File Sharing', 'Metadata Management', 'Access Control', 'File Preview']
  },
  {
    id: 3,
    title: 'AI-Powered Content Generation',
    description: 'Generate summaries and MCQs using artificial intelligence',
    status: 'locked',
    icon: Brain,
    features: ['AI Summaries', 'MCQ Generation', 'Custom Instructions', 'Content Management', 'Markdown Support']
  },
  {
    id: 4,
    title: 'MCQs, Quizzes, and Sessions',
    description: 'Create, manage, and take interactive quizzes with progress tracking',
    status: 'locked',
    icon: Activity,
    features: ['Quiz Creation', 'Question Management', 'Quiz Sessions', 'Progress Tracking', 'Results Analytics']
  },
  {
    id: 5,
    title: 'Communities & Collaboration',
    description: 'Join study groups, collaborate with peers, and share knowledge',
    status: 'locked',
    icon: Users,
    features: ['Community Creation', 'Member Management', 'Content Sharing', 'Subject Organization', 'Collaboration Tools']
  },
  {
    id: 6,
    title: 'Content Interactions',
    description: 'Comment, rate, and engage with content across the platform',
    status: 'locked',
    icon: MessageSquare,
    features: ['Comments System', 'Rating System', 'Threaded Discussions', 'Engagement Analytics', 'Moderation Tools']
  },
  {
    id: 7,
    title: 'User Preferences & Notifications',
    description: 'Customize user experience and manage notification preferences',
    status: 'locked',
    icon: Settings,
    features: ['User Preferences', 'Notification Management', 'Theme Settings', 'Privacy Controls', 'Account Settings']
  },
  {
    id: 8,
    title: 'Content Versioning & Analytics',
    description: 'Track content changes and analyze performance metrics',
    status: 'locked',
    icon: BarChart,
    features: ['Version Control', 'Performance Analytics', 'Usage Statistics', 'Content Insights', 'Progress Reports']
  }
];

export default function DemoPage() {
  const [apiStatus, setApiStatus] = useState<{
    status: string;
    message: string;
    isLoading: boolean;
  }>({ status: 'loading', message: 'Checking...', isLoading: true });

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const result = await checkApiHealth();
        setApiStatus({
          status: result.status,
          message: result.message,
          isLoading: false
        });
      } catch (error) {
        setApiStatus({
          status: 'error',
          message: 'Connection failed',
          isLoading: false
        });
      }
    };

    checkHealth();
    
    // Check API health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'current':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <Lock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800';
      case 'current':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800';
      default:
        return 'border-gray-200 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700';
    }
  };

  const getApiStatusDisplay = () => {
    if (apiStatus.isLoading) {
      return (
        <div className="flex items-center space-x-2 text-gray-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Checking API status...</span>
        </div>
      );
    }

    if (apiStatus.status === 'success') {
      return (
        <div className="flex items-center space-x-2 text-green-600">
          <Wifi className="w-4 h-4" />
          <span className="font-medium">API Status: Healthy ✅</span>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2 text-red-600">
        <AlertCircle className="w-4 h-4" />
        <span className="font-medium">API Status: Unreachable ❌</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/" className="flex items-center space-x-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Home</span>
                </Link>
              </Button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Development Demo
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {getApiStatusDisplay()}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* API Health Check Section */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Backend Connectivity</span>
            </h2>
            <div className="space-y-2">
              {getApiStatusDisplay()}
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Backend URL: {process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}
              </p>
              {apiStatus.status === 'error' && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Make sure your FastAPI backend is running on the configured URL.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Phase Progress Tracker */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Implementation Progress
          </h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {phases.map((phase) => {
              const IconComponent = phase.icon;
              
              return (
                <div
                  key={phase.id}
                  className={`p-6 rounded-lg border transition-all duration-200 hover:shadow-md ${getStatusColor(phase.status)}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        phase.status === 'completed' 
                          ? 'bg-green-100 dark:bg-green-900/30' 
                          : phase.status === 'current'
                          ? 'bg-blue-100 dark:bg-blue-900/30'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        <IconComponent className={`w-5 h-5 ${
                          phase.status === 'completed' 
                            ? 'text-green-600' 
                            : phase.status === 'current'
                            ? 'text-blue-600'
                            : 'text-gray-400'
                        }`} />
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Phase {phase.id}
                      </span>
                    </div>
                    {getStatusIcon(phase.status)}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {phase.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {phase.description}
                  </p>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Key Features:
                    </h4>
                    <ul className="space-y-1">
                      {phase.features.map((feature, index) => (
                        <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-center space-x-2">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {phase.status === 'completed' && phase.route && (
                    <Button 
                      asChild 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                    >
                      <Link href={phase.route}>
                        View Implementation
                      </Link>
                    </Button>
                  )}

                  {phase.status === 'current' && (
                    <div className="w-full p-2 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-md">
                      <p className="text-xs text-blue-700 dark:text-blue-300 text-center font-medium">
                        Currently in Development
                      </p>
                    </div>
                  )}

                  {phase.status === 'locked' && (
                    <div className="w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md">
                      <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                        Coming Soon
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Development Notes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Development Notes
          </h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>• This demo page tracks the implementation progress of the Study Helper frontend.</p>
            <p>• Each phase builds upon the previous ones, following the implementation guide.</p>
            <p>• API connectivity is checked automatically every 30 seconds.</p>
            <p>• Completed phases will show direct navigation links to implemented features.</p>
            <p>• <strong>Phase 1 Complete:</strong> Authentication system with login, registration, and profile management is now fully functional!</p>
          </div>
        </div>
      </div>
    </div>
  );
} 