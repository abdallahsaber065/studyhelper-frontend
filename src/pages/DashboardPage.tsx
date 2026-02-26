import React from "react";
import { BarChart3, FileText, Brain, Upload, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useDashboardStats, useRecentActivities } from "@/hooks/useDashboard";
import { useAuthStore } from "@/store/authStore";
import { formatDistanceToNow } from "@/lib/dateUtils";

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  file_upload: <Upload className="h-4 w-4 text-primary" />,
  summary_generate: <FileText className="h-4 w-4 text-primary" />,
  quiz_generate: <Brain className="h-4 w-4 text-primary" />,
  quiz_attempt: <BarChart3 className="h-4 w-4 text-primary" />,
};

function StatCard({
  label,
  icon,
  value,
  isLoading,
  linkTo,
}: {
  label: string;
  icon: React.ReactNode;
  value: number | string | null;
  isLoading: boolean;
  linkTo?: string;
}) {
  const content = (
    <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm hover:border-primary/50 transition-colors">
      <div className="flex items-center justify-between pb-2">
        <h3 className="text-sm font-medium">{label}</h3>
        {icon}
      </div>
      {isLoading ? (
        <div className="h-8 w-16 animate-pulse rounded bg-muted" />
      ) : (
        <div className="text-2xl font-bold">{value ?? '—'}</div>
      )}
    </div>
  );

  if (linkTo) {
    return <Link to={linkTo}>{content}</Link>;
  }
  return content;
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { filesCount, summariesCount, quizzesCount, averageScore, isLoading } = useDashboardStats();
  const { data: activityData, isLoading: activitiesLoading } = useRecentActivities(10);

  const username = user?.email?.split('@')[0] ?? 'there';

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {username}! Here's an overview of your study activities.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Files"
          icon={<Upload className="h-4 w-4 text-muted-foreground" />}
          value={filesCount}
          isLoading={isLoading}
          linkTo="/app/files"
        />
        <StatCard
          label="Summaries Generated"
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          value={summariesCount}
          isLoading={isLoading}
          linkTo="/app/summaries"
        />
        <StatCard
          label="Quizzes Created"
          icon={<Brain className="h-4 w-4 text-muted-foreground" />}
          value={quizzesCount}
          isLoading={isLoading}
          linkTo="/app/quizzes"
        />
        <StatCard
          label="Avg Quiz Score"
          icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
          value={averageScore !== null ? `${averageScore.toFixed(1)}%` : null}
          isLoading={isLoading}
        />
      </div>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { to: '/app/files', label: 'Upload Files', icon: <Upload className="h-5 w-5" />, desc: 'Add study documents' },
          { to: '/app/summaries', label: 'Summarize', icon: <FileText className="h-5 w-5" />, desc: 'Generate AI summaries' },
          { to: '/app/quizzes', label: 'Take a Quiz', icon: <Brain className="h-5 w-5" />, desc: 'Test your knowledge' },
        ].map(({ to, label, icon, desc }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm hover:border-primary/50 transition-colors"
          >
            <div className="rounded-full bg-primary/10 p-2 text-primary">{icon}</div>
            <div>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent activity */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="border-b p-6">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
        </div>
        <div className="p-6">
          {activitiesLoading && (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {!activitiesLoading && activityData?.activities.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              No recent activity. Start by{' '}
              <Link to="/app/files" className="text-primary hover:underline">
                uploading a file
              </Link>
              .
            </p>
          )}

          {!activitiesLoading && activityData && activityData.activities.length > 0 && (
            <div className="space-y-4">
              {activityData.activities.map(activity => (
                <div key={activity.id} className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-2 shrink-0">
                    {ACTIVITY_ICONS[activity.activity_type] ?? (
                      <BarChart3 className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {activity.description ?? activity.activity_type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(activity.started_at)}
                    </p>
                  </div>
                  <div className="shrink-0">
                    {activity.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

