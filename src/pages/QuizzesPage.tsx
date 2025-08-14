import React from "react";
import { Brain, Plus, Search, Play } from "lucide-react";

export const QuizzesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quizzes</h1>
          <p className="text-muted-foreground">
            Test your knowledge with AI-generated quizzes.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Create Quiz
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search quizzes..."
          className="w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      {/* Quizzes grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <Brain className="h-8 w-8 text-primary" />
            <div className="flex gap-2">
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                Medium
              </span>
              <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                Ready
              </span>
            </div>
          </div>
          <h3 className="mt-4 text-lg font-semibold">Python Fundamentals</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Test your understanding of Python basics including variables, functions, and control structures.
          </p>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>15 questions</span>
            <span>~20 minutes</span>
          </div>
          <div className="mt-4 flex gap-2">
            <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <Play className="h-4 w-4" />
              Start Quiz
            </button>
            <button className="rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
              View
            </button>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <Brain className="h-8 w-8 text-primary" />
            <div className="flex gap-2">
              <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
                Hard
              </span>
              <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                Generating
              </span>
            </div>
          </div>
          <h3 className="mt-4 text-lg font-semibold">Advanced Algorithms</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Creating quiz questions...
          </p>
          <div className="mt-4 h-2 rounded-full bg-muted">
            <div className="h-2 w-2/3 rounded-full bg-primary" />
          </div>
        </div>

        {/* Create new quiz card */}
        <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-6">
          <div className="text-center">
            <Plus className="mx-auto h-8 w-8 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold">Create New Quiz</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Generate questions from your documents.
            </p>
          </div>
        </div>
      </div>

      {/* Recent attempts */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="border-b p-4">
          <h3 className="font-semibold">Recent Quiz Attempts</h3>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Python Fundamentals</p>
                <p className="text-sm text-muted-foreground">Completed 2 days ago</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">92%</p>
                <p className="text-sm text-muted-foreground">14/15 correct</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Data Structures Quiz</p>
                <p className="text-sm text-muted-foreground">Completed 1 week ago</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-blue-600">78%</p>
                <p className="text-sm text-muted-foreground">12/15 correct</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
