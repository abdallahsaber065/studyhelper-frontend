import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Upload,
  FileText,
  Brain,
  HelpCircle,
  Settings,
  BarChart3,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

interface NavItem {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { to: '/app/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/app/files', icon: Upload, label: 'Files' },
  { to: '/app/summaries', icon: FileText, label: 'Summaries' },
  { to: '/app/quizzes', icon: Brain, label: 'Quizzes' },
  { to: '/app/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/app/help', icon: HelpCircle, label: 'Help' },
  { to: '/app/settings', icon: Settings, label: 'Settings' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen = true,
  onClose,
  className
}) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 -translate-x-full border-r bg-background transition-transform lg:translate-x-0",
          isOpen && "translate-x-0",
          className
        )}
      >
        {/* Mobile close button */}
        {onClose && (
          <div className="flex justify-end p-4 lg:hidden">
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex flex-col gap-2 overflow-y-auto p-4 pb-28">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Usage info */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="rounded-md bg-muted p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Storage used</span>
              <span className="font-medium">2.4GB / 10GB</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-background">
              <div className="h-2 w-1/4 rounded-full bg-primary" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
