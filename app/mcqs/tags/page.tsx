'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ErrorAlert } from '@/components/ui/error-alert';
import { useProtectedRoute } from '@/hooks/useAuth';
import { mcqsService } from '@/services/mcqs';
import { QuestionTagRead } from '@/types/mcqs';
import { Loader2, Plus, Edit, Trash2, X, Save, Tag } from 'lucide-react';

export default function TagsManagementPage() {
  const router = useRouter();
  const { user } = useProtectedRoute();
  
  // State
  const [tags, setTags] = useState<QuestionTagRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  
  // Form state for new tag
  const [newTagName, setNewTagName] = useState('');
  const [newTagDescription, setNewTagDescription] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [isSavingTag, setIsSavingTag] = useState(false);
  
  // Edit state
  const [editingTagId, setEditingTagId] = useState<number | null>(null);
  const [editTagName, setEditTagName] = useState('');
  const [editTagDescription, setEditTagDescription] = useState('');
  const [isEditingSaving, setIsEditingSaving] = useState(false);

  // Load tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await mcqsService.getTags();
        setTags(data);
      } catch (err) {
        console.error('Failed to fetch tags:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTags();
  }, []);

  // Handle creating a new tag
  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTagName.trim()) {
      setError({ detail: 'Tag name is required.' });
      return;
    }
    
    try {
      setIsSavingTag(true);
      setError(null);
      
      const tagData = {
        name: newTagName.trim(),
        description: newTagDescription.trim() || null
      };
      
      const createdTag = await mcqsService.createTag(tagData);
      
      // Add the new tag to the list
      setTags([...tags, createdTag]);
      
      // Reset form
      setNewTagName('');
      setNewTagDescription('');
      setIsAddingTag(false);
    } catch (err) {
      console.error('Failed to create tag:', err);
      setError(err);
    } finally {
      setIsSavingTag(false);
    }
  };

  // Handle deleting a tag
  const handleDeleteTag = async (tagId: number) => {
    if (!confirm('Are you sure you want to delete this tag?')) {
      return;
    }
    
    try {
      setLoading(true);
      await mcqsService.deleteTag(tagId);
      // Remove the deleted tag from the list
      setTags(tags.filter(tag => tag.id !== tagId));
    } catch (err) {
      console.error('Failed to delete tag:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Set up editing a tag
  const startEditingTag = (tag: QuestionTagRead) => {
    setEditingTagId(tag.id);
    setEditTagName(tag.name);
    setEditTagDescription(tag.description || '');
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingTagId(null);
    setEditTagName('');
    setEditTagDescription('');
  };

  // Save edited tag
  const saveEditedTag = async (tagId: number) => {
    if (!editTagName.trim()) {
      setError({ detail: 'Tag name is required.' });
      return;
    }
    
    try {
      setIsEditingSaving(true);
      setError(null);
      
      const tagData = {
        name: editTagName.trim(),
        description: editTagDescription.trim() || null
      };
      
      const updatedTag = await mcqsService.updateTag(tagId, tagData);
      
      // Update the tag in the list
      setTags(tags.map(tag => tag.id === tagId ? updatedTag : tag));
      
      // Reset editing state
      cancelEditing();
    } catch (err) {
      console.error('Failed to update tag:', err);
      setError(err);
    } finally {
      setIsEditingSaving(false);
    }
  };

  if (loading && !tags.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Tags</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create and manage tags for your MCQ questions
          </p>
        </div>
        <Button
          onClick={() => setIsAddingTag(!isAddingTag)}
          className="mt-4 sm:mt-0"
        >
          {isAddingTag ? (
            <>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              New Tag
            </>
          )}
        </Button>
      </div>

      {error && <ErrorAlert error={error} className="mb-6" />}

      {/* New Tag Form */}
      {isAddingTag && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Tag</h2>
          <form onSubmit={handleCreateTag}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tag Name *
              </label>
              <Input
                value={newTagName}
                onChange={e => setNewTagName(e.target.value)}
                placeholder="Enter tag name..."
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <Textarea
                value={newTagDescription}
                onChange={e => setNewTagDescription(e.target.value)}
                placeholder="Enter tag description (optional)..."
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddingTag(false)}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSavingTag}
              >
                {isSavingTag ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Tag
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tags List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tags</h2>
        </div>
        
        {tags.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No tags found</p>
            <Button onClick={() => setIsAddingTag(true)}>Create your first tag</Button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {tags.map(tag => (
              <li key={tag.id} className="px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                {editingTagId === tag.id ? (
                  // Edit Form
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tag Name *
                      </label>
                      <Input
                        value={editTagName}
                        onChange={e => setEditTagName(e.target.value)}
                        placeholder="Enter tag name..."
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <Textarea
                        value={editTagDescription}
                        onChange={e => setEditTagDescription(e.target.value)}
                        placeholder="Enter tag description (optional)..."
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={cancelEditing}
                        className="mr-2"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={() => saveEditedTag(tag.id)}
                        disabled={isEditingSaving}
                      >
                        {isEditingSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Tag Display
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center">
                        <Tag className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {tag.name}
                        </h3>
                      </div>
                      {tag.description && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 pl-7">
                          {tag.description}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditingTag(tag)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTag(tag.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 