import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { 
  summaryService, 
  Summary, 
  SummaryGenerateRequest,
  SummaryProgressResponse,
  SummaryUpdateRequest
} from '@/services/summaryService';
import { toast } from '@/hooks/useToast';
import { useSummaryWebSocket } from '@/hooks/useWebSocket';

// Query keys
export const summaryQueryKeys = {
  all: ['summaries'] as const,
  lists: () => [...summaryQueryKeys.all, 'list'] as const,
  list: (params: any) => [...summaryQueryKeys.lists(), params] as const,
  details: () => [...summaryQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...summaryQueryKeys.details(), id] as const,
  progress: (taskId: string) => [...summaryQueryKeys.all, 'progress', taskId] as const,
  analytics: () => [...summaryQueryKeys.all, 'analytics'] as const,
};

// Hook for getting summary list with filters
export const useSummaries = (params?: {
  page?: number;
  per_page?: number;
  search?: string;
  summary_type?: string;
  status?: string;
  file_id?: string;
}) => {
  return useQuery({
    queryKey: summaryQueryKeys.list(params),
    queryFn: () => summaryService.getSummaries(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
  });
};

// Hook for getting specific summary
export const useSummary = (summaryId: string) => {
  return useQuery({
    queryKey: summaryQueryKeys.detail(summaryId),
    queryFn: () => summaryService.getSummary(summaryId),
    enabled: !!summaryId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook for tracking summary generation progress with WebSocket support
export const useSummaryProgress = (taskId: string, enabled: boolean = true) => {
  const [realtimeProgress, setRealtimeProgress] = useState<SummaryProgressResponse | null>(null);
  const queryClient = useQueryClient();

  // WebSocket connection for real-time updates
  const { sendMessage, connectionStatus } = useSummaryWebSocket((progressData) => {
    if (progressData?.task_id === taskId) {
      setRealtimeProgress(progressData);
      // Update the query cache with real-time data
      queryClient.setQueryData(summaryQueryKeys.progress(taskId), progressData);
    }
  });

  // Subscribe to task progress when connected
  useEffect(() => {
    if (connectionStatus === 'Open' && taskId && enabled) {
      sendMessage({
        type: 'subscribe_task',
        task_id: taskId
      });

      // Cleanup: unsubscribe when component unmounts or taskId changes
      return () => {
        sendMessage({
          type: 'unsubscribe_task',
          task_id: taskId
        });
      };
    }
  }, [connectionStatus, taskId, enabled, sendMessage]);

  // Fallback to polling if WebSocket is not available
  const queryResult = useQuery({
    queryKey: summaryQueryKeys.progress(taskId),
    queryFn: () => summaryService.getSummaryProgress(taskId),
    enabled: enabled && !!taskId && connectionStatus !== 'Open',
    refetchInterval: (data) => {
      // Poll every 2 seconds if still processing and WebSocket is not connected
      // Fix: data is the query result object, so use data?.data?.status
      const status = (data as { data?: SummaryProgressResponse })?.data?.status;
      if (
        connectionStatus !== 'Open' &&
        (status === 'processing' || status === 'pending')
      ) {
        return 2000;
      }
      return false;
    },
    retry: (failureCount, error) => {
      return failureCount < 3 && !error.message.includes('404');
    },
  });

  // Return real-time data if available, otherwise use query result
  return {
    ...queryResult,
    data: realtimeProgress || queryResult.data,
  };
};

// Hook for generating summaries
export const useGenerateSummary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SummaryGenerateRequest) => summaryService.generateSummary(request),
    onSuccess: (data: SummaryProgressResponse) => {
      // Invalidate summary lists to show the new pending summary
      queryClient.invalidateQueries({ queryKey: summaryQueryKeys.lists() });
      
      toast({
        title: "Summary generation started",
        description: `Your summary "${data.summary_id}" is being processed.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to generate summary",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook for updating summaries
export const useUpdateSummary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ summaryId, data }: { summaryId: string; data: SummaryUpdateRequest }) =>
      summaryService.updateSummary(summaryId, data),
    onSuccess: (data: Summary, variables) => {
      // Update cached summary data
      queryClient.setQueryData(
        summaryQueryKeys.detail(variables.summaryId),
        data
      );
      // Invalidate summary lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: summaryQueryKeys.lists() });
      
      toast({
        title: "Summary updated successfully",
        description: "Your changes have been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update summary",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook for deleting summaries
export const useDeleteSummary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: summaryService.deleteSummary,
    onSuccess: (data, summaryId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: summaryQueryKeys.detail(summaryId) });
      // Invalidate summary lists
      queryClient.invalidateQueries({ queryKey: summaryQueryKeys.lists() });
      
      toast({
        title: "Summary deleted successfully",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete summary",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook for canceling summary generation
export const useCancelSummary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: summaryService.cancelSummary,
    onSuccess: (data, taskId) => {
      // Invalidate progress query
      queryClient.invalidateQueries({ queryKey: summaryQueryKeys.progress(taskId) });
      // Invalidate summary lists
      queryClient.invalidateQueries({ queryKey: summaryQueryKeys.lists() });
      
      toast({
        title: "Summary generation canceled",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to cancel summary",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook for summary analytics
export const useSummaryAnalytics = () => {
  return useQuery({
    queryKey: summaryQueryKeys.analytics(),
    queryFn: () => summaryService.getSummaryAnalytics(),
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
  });
};
