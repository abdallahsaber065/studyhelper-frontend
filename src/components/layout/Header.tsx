import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, User, Bell, Menu, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useLogout } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMenuToggle?: () => void;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, className }) => {
  const { user, isAuthenticated } = useAuthStore();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className
      )}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left section - Logo and menu toggle */}
        <div className="flex items-center gap-4">
          {onMenuToggle && isAuthenticated && (
            <button
              onClick={onMenuToggle}
              className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md lg:hidden"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <Link to={isAuthenticated ? '/app/dashboard' : '/'} className="flex items-center gap-2 font-semibold">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-lg">StudyAssistant</span>
          </Link>
        </div>

        {/* Right section - Navigation and user menu */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <button className="relative p-2 hover:bg-accent hover:text-accent-foreground rounded-md">
                <Bell className="h-5 w-5" />
                {/* Notification badge */}
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
                  3
                </span>
              </button>

              {/* User menu */}
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 p-2 hover:bg-accent hover:text-accent-foreground rounded-md">
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline-block">{user?.email}</span>
                </button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline-block">Logout</span>
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
