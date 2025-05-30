import * as React from 'react';
import { cn } from '@/lib/utils';
import { parseApiError, formatValidationErrors } from '@/lib/error-handler';
import { AlertCircle, X, AlertTriangle, Info } from 'lucide-react';

interface ErrorAlertProps extends React.HTMLAttributes<HTMLDivElement> {
  error?: any;
  message?: string;
  variant?: 'error' | 'warning' | 'info';
  showIcon?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const ErrorAlert = React.forwardRef<HTMLDivElement, ErrorAlertProps>(
  ({ 
    error, 
    message, 
    variant = 'error',
    showIcon = true,
    dismissible = false,
    onDismiss,
    className, 
    ...props 
  }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true);

    if (!isVisible) return null;

    // Parse the error if provided
    const parsedError = error ? parseApiError(error) : null;
    const displayMessage = message || parsedError?.message || 'An error occurred';
    const isValidationError = parsedError?.isValidationError || false;
    const validationErrors = parsedError?.details ? formatValidationErrors(parsedError.details) : [];

    const handleDismiss = () => {
      setIsVisible(false);
      onDismiss?.();
    };

    const getVariantClasses = () => {
      switch (variant) {
        case 'error':
          return 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300';
        case 'warning':
          return 'border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
        case 'info':
          return 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
        default:
          return 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300';
      }
    };

    const getIcon = () => {
      switch (variant) {
        case 'error':
          return <AlertCircle className="h-4 w-4 flex-shrink-0" />;
        case 'warning':
          return <AlertTriangle className="h-4 w-4 flex-shrink-0" />;
        case 'info':
          return <Info className="h-4 w-4 flex-shrink-0" />;
        default:
          return <AlertCircle className="h-4 w-4 flex-shrink-0" />;
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-lg border p-4',
          getVariantClasses(),
          className
        )}
        {...props}
      >
        <div className="flex items-start space-x-3">
          {showIcon && getIcon()}
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{displayMessage}</p>
            
            {/* Show validation errors if present */}
            {isValidationError && validationErrors.length > 0 && (
              <div className="mt-2">
                <ul className="text-xs space-y-1 list-disc list-inside opacity-90">
                  {validationErrors.map((validationError, index) => (
                    <li key={index}>{validationError}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Show error type for debugging in development */}
            {process.env.NODE_ENV === 'development' && parsedError && (
              <p className="text-xs opacity-70 mt-1">
                Error Type: {parsedError.type} ({parsedError.statusCode})
              </p>
            )}
          </div>

          {dismissible && (
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 hover:opacity-70 transition-opacity"
              aria-label="Dismiss error"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }
);

ErrorAlert.displayName = 'ErrorAlert';

export { ErrorAlert }; 