'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ErrorAlert } from '@/components/ui/error-alert';
import { filesService } from '@/services/files';
import { PhysicalFile, FileAccessInfo, FileShareRequest } from '@/types/files';
import { formatFileDate } from '@/lib/file-utils';
import { 
  X, 
  Share2, 
  User, 
  Shield, 
  Trash2, 
  Plus,
  Loader2,
  Users,
  Eye,
  Edit
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileShareModalProps {
  file: PhysicalFile;
  isOpen: boolean;
  onClose: () => void;
  onShareSuccess?: () => void;
}

export default function FileShareModal({
  file,
  isOpen,
  onClose,
  onShareSuccess
}: FileShareModalProps) {
  const [accessList, setAccessList] = useState<FileAccessInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [success, setSuccess] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [newShareData, setNewShareData] = useState<FileShareRequest>({
    user_id: '',
    access_level: 'read'
  });

  useEffect(() => {
    if (isOpen) {
      loadAccessList();
    }
  }, [isOpen, file.id]);

  const loadAccessList = async () => {
    try {
      setLoading(true);
      setError(null);
      const access = await filesService.getFileAccess(file.id);
      setAccessList(access);
    } catch (error) {
      console.error('Failed to load access list:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleShareFile = async () => {
    if (!newShareData.user_id.trim()) {
      setError({ message: 'Please enter a user ID' });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess('');

      await filesService.shareFile(file.id, newShareData);
      
      setSuccess('File shared successfully!');
      setShowAddUser(false);
      setNewShareData({ user_id: '', access_level: 'read' });
      
      // Refresh access list
      await loadAccessList();
      onShareSuccess?.();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to share file:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAccess = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess('');

      await filesService.revokeFileAccess(file.id, userId);
      
      setSuccess('Access revoked successfully!');
      
      // Refresh access list
      await loadAccessList();
      onShareSuccess?.();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to revoke access:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowAddUser(false);
    setNewShareData({ user_id: '', access_level: 'read' });
    setError(null);
    setSuccess('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Share2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Share File
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {file.original_filename}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="w-8 h-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {error && (
            <div className="mb-4">
              <ErrorAlert 
                error={error} 
                dismissible 
                onDismiss={() => setError(null)}
              />
            </div>
          )}

          {success && (
            <div className="mb-4">
              <ErrorAlert 
                message={success}
                variant="info"
                dismissible 
                onDismiss={() => setSuccess('')}
              />
            </div>
          )}

          {/* Add User Section */}
          {!showAddUser ? (
            <div className="mb-6">
              <Button 
                onClick={() => setShowAddUser(true)}
                className="w-full"
                disabled={loading}
              >
                <Plus className="w-4 h-4 mr-2" />
                Share with User
              </Button>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="userId">User ID</Label>
                  <Input
                    id="userId"
                    placeholder="Enter user ID to share with"
                    value={newShareData.user_id}
                    onChange={(e) => setNewShareData(prev => ({ 
                      ...prev, 
                      user_id: e.target.value 
                    }))}
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Enter the exact user ID of the person you want to share with
                  </p>
                </div>

                <div>
                  <Label htmlFor="accessLevel">Access Level</Label>
                  <select
                    id="accessLevel"
                    value={newShareData.access_level}
                    onChange={(e) => setNewShareData(prev => ({ 
                      ...prev, 
                      access_level: e.target.value as 'read' | 'write'
                    }))}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="read">Read Only</option>
                    <option value="write">Read & Write</option>
                  </select>
                </div>

                <div className="flex space-x-3">
                  <Button 
                    onClick={handleShareFile}
                    disabled={loading || !newShareData.user_id.trim()}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sharing...
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowAddUser(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Current Access List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Current Access
              </h3>
              {accessList.length > 0 && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {accessList.length} user{accessList.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {loading && accessList.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  Loading access list...
                </span>
              </div>
            ) : accessList.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No shared access
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  This file is only accessible by you. Share it with others to collaborate.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {accessList.map((access, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {access.user ? 
                            `${access.user.first_name} ${access.user.last_name}` : 
                            `User ${access.user_id}`
                          }
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>@{access.user?.username || access.user_id}</span>
                          <span>•</span>
                          <span>Shared {formatFileDate(access.granted_at)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        {access.access_level === 'read' ? (
                          <Eye className="w-4 h-4 text-gray-500" />
                        ) : (
                          <Edit className="w-4 h-4 text-blue-500" />
                        )}
                        <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {access.access_level}
                        </span>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeAccess(access.user_id)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
} 