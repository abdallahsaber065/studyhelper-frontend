import React from "react";
import { FileText, Plus, Search } from "lucide-react";

export const SummariesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Summaries</h1>
          <p className="text-muted-foreground">
            AI-generated summaries from your uploaded documents.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Generate Summary
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search summaries..."
          className="w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      {/* Summaries grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <FileText className="h-8 w-8 text-primary" />
            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
              Completed
            </span>
          </div>
          <h3 className="mt-4 text-lg font-semibold">Machine Learning Basics</h3>
          <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
            A comprehensive summary covering fundamental concepts of machine learning including supervised and unsupervised learning techniques...
          </p>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>Generated 2 hours ago</span>
            <span>GPT-4</span>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <FileText className="h-8 w-8 text-primary" />
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
              Processing
            </span>
          </div>
          <h3 className="mt-4 text-lg font-semibold">Data Structures Overview</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Generating summary...
          </p>
          <div className="mt-4 h-2 rounded-full bg-muted">
            <div className="h-2 w-3/4 rounded-full bg-primary" />
          </div>
        </div>

        {/* Empty state card */}
        <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-6">
          <div className="text-center">
            <Plus className="mx-auto h-8 w-8 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold">Generate New Summary</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Upload a document to get started.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
