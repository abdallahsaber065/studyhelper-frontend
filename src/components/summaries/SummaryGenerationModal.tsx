import React, { useState, useEffect } from 'react';
import { X, FileText, Zap, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFiles } from '@/hooks/useFiles';
import { useGenerateSummary } from '@/hooks/useSummaries';
import { SummaryGenerateRequest } from '@/services/summaryService';
import { FileMetadata, formatFileSize } from '@/services/fileService';

interface SummaryGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedFileId?: string;
}

const SUMMARY_TYPES = [
  { value: 'general', label: 'General Summary', description: 'Balanced overview of key points' },
  { value: 'academic', label: 'Academic Summary', description: 'Detailed scholarly analysis' },
  { value: 'technical', label: 'Technical Summary', description: 'Focus on technical details and specifications' },
  { value: 'executive', label: 'Executive Summary', description: 'High-level business overview' },
];

const AI_PROVIDERS = [
  { value: 'openai', label: 'OpenAI GPT-4', description: 'Best overall quality' },
  { value: 'gemini', label: 'Google Gemini', description: 'Great for technical content' },
  { value: 'anthropic', label: 'Claude', description: 'Excellent for academic content' },
];

const AI_MODELS = {
  openai: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  gemini: ['gemini-pro', 'gemini-pro-vision'],
  anthropic: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
};

export const SummaryGenerationModal: React.FC<SummaryGenerationModalProps> = ({ 
  isOpen, 
  onClose, 
  preSelectedFileId 
}) => {
  const [formData, setFormData] = useState<Partial<SummaryGenerateRequest>>({
    file_id: preSelectedFileId || '',
    title: '',
    summary_type: 'general',
    ai_provider: 'openai',
    ai_model: 'gpt-4o',
    max_length: 500,
    temperature: 0.7,
    custom_instructions: '',
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { data: filesData } = useFiles({ per_page: 100 }); // Get all files for selection
  const generateSummary = useGenerateSummary();

  // Auto-fill title when file is selected
  useEffect(() => {
    if (formData.file_id && filesData?.files) {
      const selectedFile = filesData.files.find(f => f.id === formData.file_id);
      if (selectedFile && !formData.title) {
        const summaryType = SUMMARY_TYPES.find(t => t.value === formData.summary_type)?.label || 'Summary';
        setFormData(prev => ({
          ...prev,
          title: `${summaryType} - ${selectedFile.original_filename}`,
        }));
      }
    }
  }, [formData.file_id, formData.summary_type, filesData?.files]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.file_id || !formData.title || !formData.summary_type) {
      return;
    }

    try {
      await generateSummary.mutateAsync(formData as SummaryGenerateRequest);
      onClose();
      resetForm();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const resetForm = () => {
    setFormData({
      file_id: preSelectedFileId || '',
      title: '',
      summary_type: 'general',
      ai_provider: 'openai',
      ai_model: 'gpt-4o',
      max_length: 500,
      temperature: 0.7,
      custom_instructions: '',
    });
    setShowAdvanced(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const selectedFile = formData.file_id && filesData?.files 
    ? filesData.files.find(f => f.id === formData.file_id)
    : null;

  const availableModels = formData.ai_provider 
    ? AI_MODELS[formData.ai_provider as keyof typeof AI_MODELS] || []
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Generate AI Summary</h2>
              <p className="text-sm text-muted-foreground">
                Create an intelligent summary of your document
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          {/* File Selection */}
          <div className="space-y-2">
            <Label htmlFor="file">Select Document</Label>
            <Select
              value={formData.file_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, file_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a file to summarize" />
              </SelectTrigger>
              <SelectContent>
                {filesData?.files?.map((file: FileMetadata) => (
                  <SelectItem key={file.id} value={file.id}>
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <div className="flex-1">
                        <p className="font-medium">{file.original_filename}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.file_size)} • Uploaded {new Date(file.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected File Info */}
          {selectedFile && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{selectedFile.original_filename}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.file_size)} • {selectedFile.description || 'No description'}
                  </p>
                </div>
                {selectedFile.is_processed && (
                  <Badge variant="secondary">Previously Processed</Badge>
                )}
              </div>
            </div>
          )}

          {/* Summary Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Summary Type */}
            <div className="space-y-2">
              <Label htmlFor="summary-type">Summary Type</Label>
              <Select
                value={formData.summary_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, summary_type: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUMMARY_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <p className="font-medium">{type.label}</p>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* AI Provider */}
            <div className="space-y-2">
              <Label htmlFor="ai-provider">AI Provider</Label>
              <Select
                value={formData.ai_provider}
                onValueChange={(value) => {
                  const provider = value as keyof typeof AI_MODELS;
                  setFormData(prev => ({ 
                    ...prev, 
                    ai_provider: value as any,
                    ai_model: AI_MODELS[provider]?.[0] || undefined
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AI_PROVIDERS.map((provider) => (
                    <SelectItem key={provider.value} value={provider.value}>
                      <div>
                        <p className="font-medium">{provider.label}</p>
                        <p className="text-xs text-muted-foreground">{provider.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Summary Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter a title for your summary"
              required
            />
          </div>

          {/* Advanced Options */}
          <div className="space-y-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Advanced Options</span>
            </Button>

            {showAdvanced && (
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                {/* AI Model */}
                <div className="space-y-2">
                  <Label htmlFor="ai-model">AI Model</Label>
                  <Select
                    value={formData.ai_model}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, ai_model: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Max Length */}
                <div className="space-y-2">
                  <Label htmlFor="max-length">Maximum Words</Label>
                  <Input
                    id="max-length"
                    type="number"
                    min={100}
                    max={2000}
                    value={formData.max_length}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_length: parseInt(e.target.value) || 500 }))}
                  />
                </div>

                {/* Temperature */}
                <div className="space-y-2">
                  <Label htmlFor="temperature">Creativity Level</Label>
                  <Input
                    id="temperature"
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={formData.temperature}
                    onChange={(e) => setFormData(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Focused</span>
                    <span>{formData.temperature}</span>
                    <span>Creative</span>
                  </div>
                </div>

                {/* Custom Instructions */}
                <div className="space-y-2">
                  <Label htmlFor="custom-instructions">Custom Instructions (Optional)</Label>
                  <Textarea
                    id="custom-instructions"
                    value={formData.custom_instructions}
                    onChange={(e) => setFormData(prev => ({ ...prev, custom_instructions: e.target.value }))}
                    placeholder="Add specific instructions for the AI to follow..."
                    rows={3}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Estimated processing time: 30-60 seconds
            </p>
            <div className="flex items-center space-x-3">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!formData.file_id || !formData.title || generateSummary.isPending}
              >
                {generateSummary.isPending ? 'Starting...' : 'Generate Summary'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
