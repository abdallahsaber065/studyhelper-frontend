'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Upload, FileText, User, Lock, ExternalLink } from 'lucide-react';

interface Phase {
  id: number;
  title: string;
  description: string;
  status: 'completed' | 'coming-soon';
  features: string[];
  links?: { label: string; href: string }[];
}

const phases: Phase[] = [
  {
    id: 0,
    title: "Project Setup & Initial Configuration",
    description: "Next.js project foundation, UI components, and API communication layer.",
    status: "completed",
    features: [],
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Demo Page", href: "/demo" },
    ],
  },
  {
    id: 1,
    title: "Authentication & User Management",
    description: "User registration, login, logout, profile viewing, and updates.",
    status: "completed",
    features: [
      'User registration with validation',
      'Secure login with JWT tokens',
      'Profile viewing and editing',
      'Password requirements and validation',
      'Automatic token refresh',
      'Protected routes'
    ],
    links: [
      { label: "Login", href: "/auth/login" },
      { label: "Register", href: "/auth/register" },
      { label: "Profile", href: "/profile" },
    ],
  },
  {
    id: 2,
    title: "File Management",
    description: "Upload, view, list, and share files.",
    status: "completed",
    features: [
      'Drag & drop file upload',
      'File type validation (PDF, DOC, TXT)',
      'Upload progress tracking',
      'File listing with search and pagination',
      'File sharing with access control',
      'File details and metadata'
    ],
    links: [
      { label: "Files List", href: "/files" },
      { label: "Upload File", href: "/files/upload" },
    ],
  },
  {
    id: 3,
    title: "AI-Powered Content Generation",
    description: "Generate summaries and MCQs using AI.",
    status: "completed",
    features: [
      'AI-powered document summarization',
      'Automatic MCQ generation',
      'Custom instruction support',
      'Summary editing and management',
      'Content quality assessment'
    ],
    links: [
      { label: "Generate Summary", href: "/summaries/generate" },
      { label: "My Summaries", href: "/summaries" },
      { label: "Generate MCQs", href: "/mcqs/generate" },
    ],
  },
  {
    id: 4,
    title: "MCQs, Quizzes, and Sessions",
    description: "Create and manage quizzes, track sessions.",
    status: "coming-soon",
    features: [
      'MCQ question creation and editing',
      'Quiz builder with question selection',
      'Interactive quiz taking interface',
      'Session management and scoring',
      'Performance analytics'
    ],
  },
  {
    id: 5,
    title: 'Communities & Collaboration',
    description: 'Join study communities and collaborate with peers on shared materials.',
    status: 'coming-soon',
    features: [
      'Community creation and management',
      'Subject organization',
      'Member management with roles',
      'Shared content within communities',
      'Community-specific discussions'
    ]
  },
  {
    id: 6,
    title: 'Content Interactions',
    description: 'Comment, rate, and engage with shared content and discussions.',
    status: 'coming-soon',
    features: [
      'Threaded comments system',
      'Content rating and reviews',
      'Like and reaction system',
      'User engagement tracking',
      'Moderation tools'
    ]
  },
  {
    id: 7,
    title: 'User Preferences & Notifications',
    description: 'Customize your experience and stay updated with smart notifications.',
    status: 'coming-soon',
    features: [
      'User preference management',
      'Notification system',
      'Email and in-app notifications',
      'Notification preferences',
      'Real-time updates'
    ]
  },
  {
    id: 8,
    title: 'Content Versioning & Analytics',
    description: 'Advanced content management with version control and detailed analytics.',
    status: 'coming-soon',
    features: [
      'Content version history',
      'Change tracking and comparison',
      'Usage analytics and insights',
      'Performance metrics',
      'Data visualization'
    ]
  }
];

export default function DemoPage() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'healthy' | 'error'>('checking');

  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/health`, {
        method: 'GET'
      });
      
      if (response.ok) {
        setApiStatus('healthy');
      } else {
        setApiStatus('error');
      }
    } catch (error) {
      console.error('API health check failed:', error);
      setApiStatus('error');
    }
  };

  const completedPhases = phases.filter(phase => phase.status === 'completed');
  const upcomingPhases = phases.filter(phase => phase.status === 'coming-soon');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Study Helper Development Demo
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Track implementation progress and test completed features
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* API Status */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">API Status:</span>
                <div className="flex items-center space-x-2">
                  {apiStatus === 'checking' && (
                    <>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-yellow-600 dark:text-yellow-400">Checking...</span>
                    </>
                  )}
                  {apiStatus === 'healthy' && (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600 dark:text-green-400">Healthy ✅</span>
                    </>
                  )}
                  {apiStatus === 'error' && (
                    <>
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-red-600 dark:text-red-400">Unreachable ❌</span>
                    </>
                  )}
                </div>
              </div>
              <Button variant="outline" onClick={checkApiHealth}>
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Overview */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Development Progress
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {completedPhases.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completed Phases</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {upcomingPhases.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Upcoming Phases</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {Math.round((completedPhases.length / phases.length) * 100)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Overall Progress</div>
              </div>
            </div>
          </div>
        </div>

        {/* Completed Phases */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            ✅ Completed Features
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {completedPhases.map((phase) => (
              <div
                key={phase.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-800 p-6"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Phase {phase.id}: {phase.title}
                    </h3>
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                      Available for testing
                    </p>
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {phase.description}
                </p>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Implemented Features:
                  </h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {phase.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {phase.links && (
                  <div className="flex flex-wrap gap-2">
                    {phase.links.map((link, index) => (
                      <Button
                        key={index}
                        asChild
                        size="sm"
                        variant="outline"
                        className="border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/20"
                      >
                        <Link href={link.href}>
                          {link.label}
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Link>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Phases */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            🚧 Coming Soon
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {upcomingPhases.map((phase) => (
              <div
                key={phase.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 opacity-75"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Phase {phase.id}: {phase.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      In development
                    </p>
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {phase.description}
                </p>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Planned Features:
                  </h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {phase.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
            🚀 Quick Navigation
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button asChild variant="outline" className="justify-start">
              <Link href="/">
                <User className="w-4 h-4 mr-2" />
                Homepage
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/auth/login">
                <Lock className="w-4 h-4 mr-2" />
                Login
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/files/upload">
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/files">
                <FileText className="w-4 h-4 mr-2" />
                Manage Files
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 