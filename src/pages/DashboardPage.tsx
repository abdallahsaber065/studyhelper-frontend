import React from "react";
import { BarChart3, FileText, Brain, Upload } from "lucide-react";

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your study activities.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Total Files</h3>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">24</div>
          <p className="text-xs text-muted-foreground">
            +2 from last month
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Summaries Generated</h3>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">18</div>
          <p className="text-xs text-muted-foreground">
            +4 from last month
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Quizzes Created</h3>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">12</div>
          <p className="text-xs text-muted-foreground">
            +1 from last month
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Study Score</h3>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">85%</div>
          <p className="text-xs text-muted-foreground">
            +5% from last month
          </p>
        </div>
      </div>

      {/* Recent activity */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="border-b p-6">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-2">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Summary generated</p>
                <p className="text-xs text-muted-foreground">
                  "Machine Learning Basics" - 2 hours ago
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-2">
                <Brain className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Quiz completed</p>
                <p className="text-xs text-muted-foreground">
                  "Python Fundamentals Quiz" - Score: 92% - 1 day ago
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-2">
                <Upload className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">File uploaded</p>
                <p className="text-xs text-muted-foreground">
                  "Data Structures.pdf" - 3 days ago
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
