import React, { useState } from 'react';
import { Brain, Plus, Search, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuizzes, useQuizAnalytics } from '@/hooks/useQuizzes';
import { QuizCard } from '@/components/quizzes/QuizCard';
import { QuizGenerationModal } from '@/components/quizzes/QuizGenerationModal';
import { QuizAttemptModal } from '@/components/quizzes/QuizAttemptModal';
import type { Quiz, QuizDifficulty, QuizStatus } from '@/services/quizService';

const DIFFICULTIES: QuizDifficulty[] = ['beginner', 'intermediate', 'advanced', 'expert'];
const STATUS_OPTIONS: QuizStatus[] = ['completed', 'pending', 'processing', 'failed'];

export const QuizzesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<QuizDifficulty | ''>('');
  const [statusFilter, setStatusFilter] = useState<QuizStatus | ''>('');
  const [generateOpen, setGenerateOpen] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const { data, isLoading, isError, error } = useQuizzes({
    search_query: search || undefined,
    difficulty_level: difficultyFilter ? [difficultyFilter] : undefined,
    status: statusFilter ? [statusFilter] : undefined,
    page_size: 30,
  });

  const { data: analytics } = useQuizAnalytics();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quizzes</h1>
          <p className="text-muted-foreground">
            Test your knowledge with AI-generated quizzes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowAnalytics(v => !v)}>
            <BarChart3 className="mr-1.5 h-4 w-4" />
            Analytics
          </Button>
          <Button onClick={() => setGenerateOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Create Quiz
          </Button>
        </div>
      </div>

      {/* Analytics summary */}
      {showAnalytics && analytics && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Quizzes', value: analytics.total_quizzes },
            { label: 'Completed', value: analytics.completed_quizzes },
            { label: 'Total Attempts', value: analytics.total_attempts },
            { label: 'Avg Score', value: `${analytics.average_score?.toFixed(1) ?? 0}%` },
          ].map(stat => (
            <div key={stat.label} className="rounded-lg border bg-card p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search quizzes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <select
          value={difficultyFilter}
          onChange={e => setDifficultyFilter(e.target.value as QuizDifficulty | '')}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">All Difficulties</option>
          {DIFFICULTIES.map(d => (
            <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as QuizStatus | '')}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-lg border bg-card h-52 animate-pulse" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-center text-sm text-destructive">
          {(error as Error)?.message ?? 'Failed to load quizzes.'}
        </div>
      )}

      {!isLoading && !isError && data?.quizzes.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 text-center">
          <Brain className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <h3 className="mt-3 text-sm font-semibold">No quizzes yet</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Upload a file and generate your first quiz.
          </p>
          <Button className="mt-4" size="sm" onClick={() => setGenerateOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Create Quiz
          </Button>
        </div>
      )}

      {!isLoading && data && data.quizzes.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.quizzes.map(quiz => (
              <QuizCard key={quiz.id} quiz={quiz} onTake={setActiveQuiz} />
            ))}
            <button
              onClick={() => setGenerateOpen(true)}
              className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 text-center hover:border-muted-foreground/50 transition-colors"
            >
              <Plus className="mx-auto h-7 w-7 text-muted-foreground/50" />
              <p className="mt-2 text-sm font-medium text-muted-foreground">New Quiz</p>
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Showing {data.quizzes.length} of {data.total_count} quizzes
          </p>
        </>
      )}

      {/* Modals */}
      <QuizGenerationModal open={generateOpen} onClose={() => setGenerateOpen(false)} />
      <QuizAttemptModal quiz={activeQuiz} open={!!activeQuiz} onClose={() => setActiveQuiz(null)} />
    </div>
  );
};


