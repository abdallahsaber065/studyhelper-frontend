'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ErrorAlert } from '@/components/ui/error-alert';
import { useProtectedRoute } from '@/hooks/useAuth';
import { mcqsService } from '@/services/mcqs';
import { QuizSessionRead } from '@/types/mcqs';
import { Breadcrumb } from '@/components/ui/breadcrumb';
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
  Medal,
  Home,
  BookOpen,
  History,
  Trash2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function QuizSessionsPage() {
  const router = useRouter();
  const { user } = useProtectedRoute();

  const [sessions, setSessions] = useState<QuizSessionRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");

  // Load quiz sessions
  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await mcqsService.getUserSessions();
      setSessions(data || []); // Ensure we have an array even if the API returns null
    } catch (err) {
      console.error('Failed to fetch quiz sessions:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Handle session deletion
  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;

    try {
      setDeleting(true);
      await mcqsService.deleteSession(sessionToDelete);

      // Refresh the sessions list
      fetchSessions();

      // Close the modal
      setDeleteModalOpen(false);
      setSessionToDelete(null);
    } catch (err) {
      console.error('Failed to delete session:', err);
      setError(err);
    } finally {
      setDeleting(false);
    }
  };

  // Show delete confirmation modal
  const confirmDelete = (sessionId: number) => {
    setSessionToDelete(sessionId);
    setDeleteModalOpen(true);
  };

  // Filter sessions based on active tab
  const filteredSessions = sessions.filter(session => {
    if (activeTab === "all") return true;
    if (activeTab === "completed") return session.completed_at !== null;
    if (activeTab === "in-progress") return session.completed_at === null;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          {
            label: 'Quizzes',
            href: '/quizzes',
            icon: <ListChecks className="w-4 h-4" />
          },
          {
            label: 'Quiz History',
            icon: <History className="w-4 h-4" />
          }
        ]}
      />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quiz History</h1>
        </div>

        <div className="flex items-center space-x-3">
          <Button asChild variant="outline">
            <Link href="/quizzes">
              <ListChecks className="w-4 h-4 mr-2" />
              Browse Quizzes
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
          </Button>
        </div>
      </div>

      {error && <ErrorAlert error={error} />}

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
            <Link href="/quizzes">Find a quiz to take</Link>
          </Button>
        </div>
      ) : (
        <>
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
            className="mb-6"
          >
            <TabsList>
              <TabsTrigger value="all">All Sessions</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>

          {filteredSessions.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                <ListChecks className="w-8 h-8 text-gray-500 dark:text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                No {activeTab === "completed" ? "completed" : activeTab === "in-progress" ? "in-progress" : ""} sessions found
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {activeTab === "completed"
                  ? "You haven't completed any quizzes yet."
                  : activeTab === "in-progress"
                    ? "You don't have any quizzes in progress."
                    : "You haven't taken any quizzes yet."}
              </p>
              <Button asChild>
                <Link href="/quizzes">Find a quiz to take</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSessions.map(session => (
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
                      {session.completed_at ? (
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
                      {session.quiz_title || 'Untitled Quiz'}
                    </h2>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        <ListChecks className="w-3 h-3 mr-1" />
                        {session.total_questions} questions
                      </div>

                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        <CalendarClock className="w-3 h-3 mr-1" />
                        {formatDate(session.started_at)}
                      </div>
                    </div>

                    {session.completed_at && (
                      <div className="mb-4">
                        <div className="relative pt-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-sm font-medium text-blue-700 dark:text-blue-400">
                              Score
                            </div>
                            <div className="text-sm font-medium text-blue-700 dark:text-blue-400">
                              {Math.round((session.score || 0) / session.total_questions * 100)}%
                            </div>
                          </div>
                          <div className="overflow- hidden h-2 text-xs rounded bg-gray-200 dark:bg-gray-700">
                            <div
                              style={{ width: `${Math.round((session.score || 0) / session.total_questions * 100)}%` }}
                              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${(session.score || 0) / session.total_questions >= 0.8
                                  ? 'bg-green-500'
                                  : (session.score || 0) / session.total_questions >= 0.6
                                    ? 'bg-blue-500'
                                    : (session.score || 0) / session.total_questions >= 0.4
                                      ? 'bg-yellow-500'
                                      : 'bg-red-500'
                                }`}
                            ></div>
                          </div>
                        </div>

                        <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="w-3.5 h-3.5 mr-1" />
                          <span>Time taken: {session.time_taken_seconds ?
                            `${Math.floor(session.time_taken_seconds / 60)}:${(session.time_taken_seconds % 60).toString().padStart(2, '0')}`
                            : 'N/A'}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {session.completed_at ? (
                        <Button
                          asChild
                          className="flex-1 flex items-center justify-center"
                        >
                          <Link href={`/quizzes/${session.quiz_id}/take?session=${session.id}`}>
                            <BarChart className="w-4 h-4 mr-2" />
                            View Results
                          </Link>
                        </Button>
                      ) : (
                        <>
                          <Button
                            asChild
                            className="flex-1 flex items-center justify-center"
                          >
                            <Link href={`/quizzes/${session.quiz_id}/take?session=${session.id}`}>
                              <Clock className="w-4 h-4 mr-2" />
                              Continue Quiz
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            className="flex items-center justify-center text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => confirmDelete(session.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}

                      <Button asChild variant="outline" className="flex items-center justify-center">
                        <Link href={`/quizzes/${session.quiz_id}`}>
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Quiz Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this in-progress quiz session? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSession}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Session
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 