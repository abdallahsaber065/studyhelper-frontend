'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ErrorAlert } from '@/components/ui/error-alert';
import { useProtectedRoute } from '@/hooks/useAuth';
import { ArrowLeft, Save, User, Mail, Calendar, Shield, Loader2, CheckCircle, Key, Eye, EyeOff, Plus, Trash2, RefreshCw } from 'lucide-react';
import { apiKeysService, ApiKeyRead } from '@/services/api-keys';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateProfile, logout, isLoading: authLoading } = useProtectedRoute();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<any>(null);
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });
  
  // API Key states
  const [apiKeys, setApiKeys] = useState<ApiKeyRead[]>([]);
  const [isLoadingKeys, setIsLoadingKeys] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<string>('');
  const [apiKeySuccess, setApiKeySuccess] = useState<string>('');
  const [showAddKeyDialog, setShowAddKeyDialog] = useState(false);
  
  // New API key form
  const [newApiKey, setNewApiKey] = useState({
    provider_name: 'Google',
    api_key: '',
    is_active: true,
  });
  
  // Testing API key
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ is_valid: boolean; message: string } | null>(null);
  
  // Show/hide API key
  const [visibleKeyIds, setVisibleKeyIds] = useState<number[]>([]);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      });
      
      // Load API keys
      loadApiKeys();
    }
  }, [user]);

  const loadApiKeys = async () => {
    try {
      setIsLoadingKeys(true);
      setApiKeyError('');
      const response = await apiKeysService.listApiKeys();
      setApiKeys(response.items);
    } catch (error: any) {
      setApiKeyError('Failed to load API keys');
      console.error('Error loading API keys:', error);
    } finally {
      setIsLoadingKeys(false);
    }
  };

  const toggleKeyVisibility = (keyId: number) => {
    if (visibleKeyIds.includes(keyId)) {
      setVisibleKeyIds(visibleKeyIds.filter(id => id !== keyId));
    } else {
      setVisibleKeyIds([...visibleKeyIds, keyId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess('');
    setIsSaving(true);

    const result = await updateProfile(formData);
    
    if (result.success) {
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 5000);
    } else {
      setError(result.rawError || { message: result.error });
    }
    
    setIsSaving(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      });
    }
    setIsEditing(false);
    setError(null);
    setSuccess('');
  };
  
  // API Key handlers
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewApiKey(prev => ({ ...prev, [name]: value }));
  };
  
  const handleProviderChange = (value: string) => {
    setNewApiKey(prev => ({ ...prev, provider_name: value }));
  };
  
  const handleIsActiveChange = (checked: boolean) => {
    setNewApiKey(prev => ({ ...prev, is_active: checked }));
  };
  
  const handleAddApiKey = async () => {
    try {
      setIsSaving(true);
      setApiKeyError('');
      
      await apiKeysService.createApiKey(newApiKey);
      
      // Reset form and close dialog
      setNewApiKey({
        provider_name: 'Google',
        api_key: '',
        is_active: true,
      });
      
      setShowAddKeyDialog(false);
      setApiKeySuccess('API key added successfully!');
      
      // Reload API keys
      loadApiKeys();
      
      // Clear success message after 5 seconds
      setTimeout(() => setApiKeySuccess(''), 5000);
    } catch (error: any) {
      setApiKeyError('Failed to add API key: ' + (error.response?.data?.detail || error.message));
      console.error('Error adding API key:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDeleteApiKey = async (apiKeyId: number) => {
    try {
      await apiKeysService.deleteApiKey(apiKeyId);
      setApiKeySuccess('API key deleted successfully!');
      
      // Reload API keys
      loadApiKeys();
      
      // Clear success message after 5 seconds
      setTimeout(() => setApiKeySuccess(''), 5000);
    } catch (error: any) {
      setApiKeyError('Failed to delete API key');
      console.error('Error deleting API key:', error);
    }
  };
  
  const handleTestApiKey = async () => {
    try {
      setIsTesting(true);
      setTestResult(null);
      
      const result = await apiKeysService.testApiKey({
        provider_name: newApiKey.provider_name,
        api_key: newApiKey.api_key,
      });
      
      setTestResult(result);
    } catch (error: any) {
      setApiKeyError('Failed to test API key');
      console.error('Error testing API key:', error);
    } finally {
      setIsTesting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // useProtectedRoute will handle redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/dashboard" className="flex items-center space-x-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Dashboard</span>
                </Link>
              </Button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                My Profile
              </h1>
            </div>
            <Button onClick={logout} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.first_name} {user.last_name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">@{user.username}</p>
              </div>
            </div>

            {/* Account Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <Shield className="w-4 h-4" />
                <span className="capitalize">{user.role}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`text-sm ${user.is_active ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Edit Profile */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Personal Information
              </h3>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>

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
                  error={success}
                  dismissible 
                  onDismiss={() => setSuccess('')}
                />
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={handleChange}
                    disabled={!isEditing || isSaving}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    type="text"
                    value={formData.last_name}
                    onChange={handleChange}
                    disabled={!isEditing || isSaving}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing || isSaving}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={user.username}
                  disabled
                  className="bg-gray-50 dark:bg-gray-700"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Username cannot be changed
                </p>
              </div>

              {isEditing && (
                <div className="flex space-x-3 pt-4">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel} disabled={isSaving}>
                    Cancel
                  </Button>
                </div>
              )}
            </form>
          </div>

          {/* API Keys Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  API Keys
                </h3>
              </div>
              <Dialog open={showAddKeyDialog} onOpenChange={setShowAddKeyDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add API Key
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Add API Key</DialogTitle>
                    <DialogDescription>
                      Add a new API key for AI providers like OpenAI or Google.
                    </DialogDescription>
                  </DialogHeader>
                  
                  {testResult && (
                    <div className={`p-3 rounded-md mt-2 ${testResult.is_valid ? 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                      <div className="flex items-center">
                        {testResult.is_valid ? (
                          <CheckCircle className="w-5 h-5 mr-2" />
                        ) : (
                          <Trash2 className="w-5 h-5 mr-2" />
                        )}
                        <p>{testResult.message}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="provider_name">Provider</Label>
                      <Select
                        value={newApiKey.provider_name}
                        onValueChange={handleProviderChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OpenAI">OpenAI</SelectItem>
                          <SelectItem value="Google">Google</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="api_key">API Key</Label>
                      <Input
                        id="api_key"
                        name="api_key"
                        value={newApiKey.api_key}
                        onChange={handleApiKeyChange}
                        type="password"
                        autoComplete="off"
                        placeholder="Enter your API key"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={newApiKey.is_active}
                        onCheckedChange={handleIsActiveChange}
                      />
                      <Label htmlFor="is_active">Active</Label>
                    </div>
                  </div>
                  
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button 
                      type="button" 
                      variant="secondary" 
                      onClick={handleTestApiKey}
                      disabled={isTesting || !newApiKey.api_key}
                    >
                      {isTesting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                      )}
                      Test Key
                    </Button>
                    <Button 
                      type="button" 
                      onClick={handleAddApiKey}
                      disabled={isSaving || !newApiKey.api_key}
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4 mr-2" />
                      )}
                      Add Key
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {apiKeyError && (
              <div className="mb-4">
                <ErrorAlert 
                  error={apiKeyError}
                  dismissible 
                  onDismiss={() => setApiKeyError('')}
                />
              </div>
            )}

            {apiKeySuccess && (
              <div className="mb-4">
                <ErrorAlert 
                  error={apiKeySuccess}
                  dismissible 
                  onDismiss={() => setApiKeySuccess('')}
                />
              </div>
            )}

            {isLoadingKeys ? (
              <div className="py-8 text-center">
                <Loader2 className="mx-auto w-6 h-6 animate-spin text-primary mb-2" />
                <p className="text-gray-600 dark:text-gray-400">Loading API keys...</p>
              </div>
            ) : apiKeys.length === 0 ? (
              <div className="py-8 text-center border border-dashed rounded-lg">
                <Key className="mx-auto w-12 h-12 text-gray-400 mb-2" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-1">No API Keys</h4>
                <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't added any API keys yet.</p>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddKeyDialog(true)}
                  className="mx-auto"
                >
                  Add Your First Key
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Manage your API keys for AI providers like OpenAI or Google.
                </p>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr className="text-left text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        <th className="px-4 py-3 font-medium">Provider</th>
                        <th className="px-4 py-3 font-medium">API Key</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Last Used</th>
                        <th className="px-4 py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {apiKeys.map(key => (
                        <tr key={key.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                          <td className="px-4 py-3 whitespace-nowrap">
                            {key.provider_name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap font-mono text-sm">
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-600 dark:text-gray-400">••••••••••••••••</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleKeyVisibility(key.id)}
                                className="h-8 w-8 p-0"
                              >
                                {visibleKeyIds.includes(key.id) ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              key.is_active
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {key.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            {key.last_used_at 
                              ? new Date(key.last_used_at).toLocaleDateString() 
                              : 'Never used'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this {key.provider_name} API key? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                                    onClick={() => handleDeleteApiKey(key.id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 