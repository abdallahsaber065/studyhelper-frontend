import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav className={`mb-6 ${className}`}>
      <ol className="flex flex-wrap items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
        {/* Home item is always first */}
        <li>
          <Link href="/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center">
            <Home className="w-4 h-4 mr-1" />
            <span>Dashboard</span>
          </Link>
        </li>
        
        {/* Path items */}
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <ChevronRight className="w-4 h-4 mx-1" />
            {item.href ? (
              <Link 
                href={item.href} 
                className={`hover:text-blue-600 dark:hover:text-blue-400 flex items-center ${index === items.length - 1 ? 'text-gray-900 dark:text-white font-medium' : ''}`}
              >
                {item.icon && <span className="mr-1">{item.icon}</span>}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span className="text-gray-900 dark:text-white font-medium flex items-center">
                {item.icon && <span className="mr-1">{item.icon}</span>}
                <span>{item.label}</span>
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
} 