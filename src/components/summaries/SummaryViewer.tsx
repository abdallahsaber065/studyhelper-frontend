import React, { useState } from 'react';
import { X, Edit3, Download, Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateSummary } from '@/hooks/useSummaries';
import { Summary, getSummaryStatusColor, formatProcessingTime, formatCost } from '@/services/summaryService';

interface SummaryViewerProps {
  summary: Summary;
  isOpen: boolean;
  onClose: () => void;
}

export const SummaryViewer: React.FC<SummaryViewerProps> = ({ summary, isOpen, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(summary.title);
  const [editContent, setEditContent] = useState(summary.content);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const updateSummary = useUpdateSummary();

  const handleSave = async () => {
    try {
      await updateSummary.mutateAsync({
        summaryId: summary.id,
        data: {
          title: editTitle,
          content: editContent,
        }
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary.content);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: summary.title,
          text: summary.content,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback to copy
      handleCopy();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex-1">
            {isEditing ? (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-lg font-semibold"
                placeholder="Summary title"
              />
            ) : (
              <h2 className="text-2xl font-bold">{summary.title}</h2>
            )}
            
            <div className="flex items-center space-x-3 mt-2">
              <Badge className={getSummaryStatusColor(summary.status)}>
                {summary.status}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {summary.ai_provider?.toUpperCase()} • {summary.summary_type}
              </span>
              {summary.processing_cost && (
                <span className="text-sm text-muted-foreground">
                  {formatCost(summary.processing_cost)}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            {!isEditing && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  disabled={copySuccess}
                >
                  {copySuccess ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit3 className="h-4 w-4" />
                </Button>
              </>
            )}
            
            {isEditing && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setIsEditing(false);
                    setEditTitle(summary.title);
                    setEditContent(summary.content);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSave}
                  disabled={updateSummary.isPending}
                >
                  Save Changes
                </Button>
              </>
            )}
            
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-content">Summary Content</Label>
                <Textarea
                  id="edit-content"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={20}
                  className="mt-1"
                  placeholder="Enter summary content..."
                />
              </div>
            </div>
          ) : (
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                {summary.content}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div>
              <p className="font-medium">Generated</p>
              <p>{formatDate(summary.created_at)}</p>
            </div>
            
            {summary.processing_time_ms && (
              <div>
                <p className="font-medium">Processing Time</p>
                <p>{formatProcessingTime(summary.processing_time_ms)}</p>
              </div>
            )}
            
            <div>
              <p className="font-medium">AI Model</p>
              <p>{summary.ai_model_used || 'Unknown'}</p>
            </div>
            
            {(summary.input_tokens || summary.output_tokens) && (
              <div>
                <p className="font-medium">Token Usage</p>
                <p>
                  {summary.input_tokens ? `${summary.input_tokens.toLocaleString()} in` : ''}
                  {summary.input_tokens && summary.output_tokens ? ' / ' : ''}
                  {summary.output_tokens ? `${summary.output_tokens.toLocaleString()} out` : ''}
                </p>
              </div>
            )}
            
            {summary.quality_score && (
              <div>
                <p className="font-medium">Quality Score</p>
                <p>{Math.round(summary.quality_score * 100)}%</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
