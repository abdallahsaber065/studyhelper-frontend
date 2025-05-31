'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ErrorAlert } from '@/components/ui/error-alert';
import { useProtectedRoute } from '@/hooks/useAuth';
import { mcqsService } from '@/services/mcqs';
import { McqSessionRead } from '@/types/mcqs';
import {
  ArrowLeft,
  Loader2,
  Clock,
  Calendar,
  BarChart,
  ExternalLink,
  ListChecks,
  CalendarClock,
  CheckCircle2,
  Medal
} from 'lucide-react';

export default function QuizSessionsPage() {
  const router = useRouter();
  const { user } = useProtectedRoute();
  
  const [sessions, setSessions] = useState<McqSessionRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  
  // Load quiz sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await mcqsService.getUserSessions();
        setSessions(data);
      } catch (err) {
        console.error('Failed to fetch quiz sessions:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessions();
  }, []);
  
  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button asChild variant="ghost" className="mr-4">
          <Link href="/mcqs/quizzes">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quizzes
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quiz History</h1>
      </div>
      
      {error && <ErrorAlert error={error} className="mb-6" />}
      
      {sessions.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
            <ListChecks className="w-8 h-8 text-gray-500 dark:text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No quiz history found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            You haven't taken any quizzes yet.
          </p>
          <Button asChild>
            <Link href="/mcqs/quizzes">Find a quiz to take</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map(session => (
            <div 
              key={session.id} 
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center">
                  <Medal className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                  <h3 className="font-medium text-gray-900 dark:text-white">Quiz Session</h3>
                </div>
                <div className="flex items-center space-x-2">
                  {session.is_completed ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Completed
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                      <Clock className="w-3 h-3 mr-1" />
                      In Progress
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {session.quiz.title}
                </h2>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    <ListChecks className="w-3 h-3 mr-1" />
                    {session.quiz.question_count} questions
                  </div>
                  
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    <CalendarClock className="w-3 h-3 mr-1" />
                    {formatDate(session.created_at)}
                  </div>
                </div>
                
                {session.is_completed && (
                  <div className="mb-4">
                    <div className="relative pt-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-sm font-medium text-blue-700 dark:text-blue-400">
                          Score
                        </div>
                        <div className="text-sm font-medium text-blue-700 dark:text-blue-400">
                          {session.score}%
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                        <div 
                          style={{ width: `${session.score}%` }} 
                          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                            session.score >= 80 
                              ? 'bg-green-500' 
                              : session.score >= 60 
                                ? 'bg-blue-500' 
                                : session.score >= 40 
                                  ? 'bg-yellow-500' 
                                  : 'bg-red-500'
                          }`}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      <span>Time taken: {session.completion_time || 'N/A'}</span>
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  {session.is_completed ? (
                    <Button 
                      asChild
                      className="flex-1 flex items-center justify-center"
                    >
                      <Link href={`/mcqs/quizzes/${session.quiz.id}/take?session=${session.id}`}>
                        <BarChart className="w-4 h-4 mr-2" />
                        View Results
                      </Link>
                    </Button>
                  ) : (
                    <Button 
                      asChild
                      className="flex-1 flex items-center justify-center"
                    >
                      <Link href={`/mcqs/quizzes/${session.quiz.id}/take?session=${session.id}`}>
                        <Clock className="w-4 h-4 mr-2" />
                        Continue Quiz
                      </Link>
                    </Button>
                  )}
                  
                  <Button asChild variant="outline" className="flex items-center justify-center">
                    <Link href={`/mcqs/quizzes/${session.quiz.id}`}>
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 