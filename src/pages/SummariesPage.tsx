import React, { useState } from "react";
import { FileText, Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SummaryGenerationModal } from "@/components/summaries/SummaryGenerationModal";
import { SummaryCard } from "@/components/summaries/SummaryCard";
import { SummaryViewer } from "@/components/summaries/SummaryViewer";
import { useSummaries } from "@/hooks/useSummaries";
import { useSummaryWebSocket } from "@/hooks/useWebSocket";
import { Summary } from "@/services/summaryService";

export const SummariesPage: React.FC = () => {
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  const [viewingSummary, setViewingSummary] = useState<Summary | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [page, setPage] = useState(1);

  const { data: summariesData, isLoading, error, refetch } = useSummaries({
    page,
    per_page: 20,
    search: searchQuery || undefined,
    status: statusFilter || undefined,
    summary_type: typeFilter || undefined,
  });

  // Set up WebSocket for real-time updates
  useSummaryWebSocket((data) => {
    // Refetch summaries when receiving progress updates
    refetch();
  });

  const handleGenerateNew = () => {
    setShowGenerationModal(true);
  };

  const handleViewSummary = (summary: Summary) => {
    setViewingSummary(summary);
  };

  const handleEditSummary = (summary: Summary) => {
    setViewingSummary(summary);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load summaries. Please try again.</p>
          <Button variant="outline" onClick={() => refetch()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

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
        <Button onClick={handleGenerateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Generate Summary
        </Button>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search summaries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" defaultChecked={true}>All Types</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="academic">Academic</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="executive">Executive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summaries grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-6 shadow-sm animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-muted rounded-lg"></div>
                <div className="w-20 h-6 bg-muted rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : !summariesData?.summaries?.length ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No summaries found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || statusFilter || typeFilter 
              ? 'No summaries match your current filters.' 
              : 'Generate your first AI summary to get started.'
            }
          </p>
          <Button onClick={handleGenerateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Generate Summary
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {summariesData.summaries.map((summary) => (
              <SummaryCard
                key={summary.id}
                summary={summary}
                onView={handleViewSummary}
                onEdit={handleEditSummary}
              />
            ))}

            {/* Empty state card for generating new summary */}
            <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer" onClick={handleGenerateNew}>
              <div className="text-center">
                <Plus className="mx-auto h-8 w-8 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">Generate New Summary</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Create another AI summary.
                </p>
              </div>
            </div>
          </div>

          {/* Pagination */}
          {summariesData.has_next && (
            <div className="flex justify-center mt-8">
              <Button
                variant="outline"
                onClick={() => setPage(prev => prev + 1)}
                disabled={isLoading}
              >
                Load More
              </Button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <SummaryGenerationModal
        isOpen={showGenerationModal}
        onClose={() => setShowGenerationModal(false)}
      />

      {viewingSummary && (
        <SummaryViewer
          summary={viewingSummary}
          isOpen={!!viewingSummary}
          onClose={() => setViewingSummary(null)}
        />
      )}
    </div>
  );
};
