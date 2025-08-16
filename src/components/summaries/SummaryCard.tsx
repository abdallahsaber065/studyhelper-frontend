import React, { useState } from 'react';
import { FileText, MoreHorizontal, Trash2, Edit3, Clock, Zap, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useSummaryProgress, useDeleteSummary, useCancelSummary } from '@/hooks/useSummaries';
import { Summary, getSummaryStatusColor, getSummaryStatusLabel, formatProcessingTime, formatCost } from '@/services/summaryService';

interface SummaryCardProps {
  summary: Summary;
  onView?: (summary: Summary) => void;
  onEdit?: (summary: Summary) => void;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ summary, onView, onEdit }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  
  const deleteSummary = useDeleteSummary();
  const cancelSummary = useCancelSummary();
  
  // Track progress for processing summaries
  const { data: progressData } = useSummaryProgress(
    summary.task_id || '',
    summary.status === 'processing' || summary.status === 'pending'
  );

  const handleDelete = async () => {
    try {
      await deleteSummary.mutateAsync(summary.id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleCancel = async () => {
    if (!summary.task_id) return;
    
    try {
      await cancelSummary.mutateAsync(summary.task_id);
      setShowCancelDialog(false);
    } catch (error) {
      console.error('Cancel failed:', error);
    }
  };

  const handleExport = () => {
    const element = document.createElement('a');
    const file = new Blob([summary.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${summary.title}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getProgressPercentage = () => {
    if (progressData?.progress_percentage !== undefined) {
      return progressData.progress_percentage;
    }
    
    // Fallback based on status
    switch (summary.status) {
      case 'pending':
        return 0;
      case 'processing':
        return 50;
      case 'completed':
        return 100;
      case 'failed':
        return 0;
      default:
        return 0;
    }
  };

  const getCurrentStep = () => {
    return progressData?.current_step || `${getSummaryStatusLabel(summary.status)}...`;
  };

  const isProcessing = summary.status === 'processing' || summary.status === 'pending';
  const isCompleted = summary.status === 'completed';
  const isFailed = summary.status === 'failed';

  return (
    <>
      <div className="rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold truncate" title={summary.title}>
                {summary.title}
              </h3>
              <Badge className={`mt-1 text-xs ${getSummaryStatusColor(summary.status)}`}>
                {getSummaryStatusLabel(summary.status)}
              </Badge>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isCompleted && (
                <>
                  <DropdownMenuItem onClick={() => onView?.(summary)}>
                    <FileText className="mr-2 h-4 w-4" />
                    View Summary
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit?.(summary)}>
                    <Edit3 className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              
              {isProcessing && summary.task_id && (
                <>
                  <DropdownMenuItem onClick={() => setShowCancelDialog(true)} className="text-orange-600">
                    <Clock className="mr-2 h-4 w-4" />
                    Cancel Generation
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content Preview */}
        {isCompleted && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {summary.content || 'No content available'}
            </p>
          </div>
        )}

        {/* Progress Bar for Processing */}
        {isProcessing && (
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{getCurrentStep()}</span>
              <span className="text-muted-foreground">{getProgressPercentage()}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Message */}
        {isFailed && progressData?.error_message && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{progressData.error_message}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span>{summary.ai_provider?.toUpperCase() || 'AI'}</span>
            <span>{summary.summary_type}</span>
            {summary.processing_cost && (
              <span>{formatCost(summary.processing_cost)}</span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {summary.processing_time_ms && (
              <span className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{formatProcessingTime(summary.processing_time_ms)}</span>
              </span>
            )}
            <span>{formatDate(summary.created_at)}</span>
          </div>
        </div>

        {/* Action Button */}
        {isCompleted && (
          <div className="mt-4 pt-4 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onView?.(summary)}
              className="w-full"
            >
              <FileText className="h-4 w-4 mr-2" />
              View Full Summary
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Summary</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{summary.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Summary
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Summary Generation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel the generation of "{summary.title}"? 
              This will stop the current processing and you'll need to start over.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Processing</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancel}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Cancel Generation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
