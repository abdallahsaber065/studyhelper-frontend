'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

// Dynamically import the editor to avoid SSR issues
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

// This ensures the dark mode of the editor works with Next.js
const DynamicMDEditor = (props: any) => {
  return (
    <div data-color-mode="light" className="dark:hidden">
      <MDEditor {...props} />
    </div>
  );
};

const DynamicMDEditorDark = (props: any) => {
  return (
    <div data-color-mode="dark" className="hidden dark:block">
      <MDEditor {...props} />
    </div>
  );
};

const DynamicMDPreview = dynamic(() => import('@uiw/react-md-editor').then((mod) => mod.default.Markdown), { ssr: false });

interface MarkdownEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  minHeight?: string;
  placeholder?: string;
  onSave?: () => void;
}

export default function MarkdownEditor({
  value,
  onChange,
  readOnly = false,
  minHeight = '300px',
  placeholder = 'Type markdown content here...',
  onSave
}: MarkdownEditorProps) {
  const [content, setContent] = useState(value);

  // Update internal state when prop changes
  useEffect(() => {
    setContent(value);
  }, [value]);

  const handleContentChange = (newValue?: string) => {
    if (newValue !== undefined) {
      setContent(newValue);
      onChange?.(newValue);
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {readOnly ? (
        <div 
          className="p-4 min-h-[200px] bg-white dark:bg-gray-900" 
          style={{ minHeight }}
        >
          <div data-color-mode="light" className="dark:hidden">
            <DynamicMDPreview source={content} />
          </div>
          <div data-color-mode="dark" className="hidden dark:block">
            <DynamicMDPreview source={content} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          <DynamicMDEditor
            value={content}
            onChange={handleContentChange}
            height={minHeight}
            preview="edit"
            placeholder={placeholder}
            textareaProps={{ placeholder }}
          />
          <DynamicMDEditorDark
            value={content}
            onChange={handleContentChange}
            height={minHeight}
            preview="edit"
            placeholder={placeholder}
            textareaProps={{ placeholder }}
          />
          
          {onSave && (
            <div className="flex justify-end p-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <Button onClick={onSave} size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 