import { AxiosError } from 'axios';
import { ApiErrorResponse, ParsedError, ApiErrorType, ValidationErrorDetail } from '@/types/api';

/**
 * Parses error responses from the backend API
 */
export function parseApiError(error: any): ParsedError {
  // Default error
  const defaultError: ParsedError = {
    message: 'An unexpected error occurred',
    type: 'InternalServerError',
    statusCode: 500,
    isValidationError: false,
  };

  // Handle network errors
  if (!error?.response) {
    return {
      ...defaultError,
      message: 'Network error - please check your connection',
      statusCode: 0,
    };
  }

  const response = error.response;
  const status = response.status;
  const data = response.data;

  // Check if response follows our API error format
  if (data?.error) {
    const apiError = data.error;
    return {
      message: apiError.message || defaultError.message,
      type: apiError.type as ApiErrorType || 'InternalServerError',
      statusCode: apiError.status_code || status,
      details: apiError.details,
      isValidationError: apiError.type === 'ValidationError',
    };
  }

  // Handle legacy format (detail field)
  if (data?.detail) {
    return {
      ...defaultError,
      message: typeof data.detail === 'string' ? data.detail : defaultError.message,
      statusCode: status,
    };
  }

  // Handle raw error messages
  if (typeof data === 'string') {
    return {
      ...defaultError,
      message: data,
      statusCode: status,
    };
  }

  // Fallback for common HTTP status codes
  const statusMessages: Record<number, string> = {
    400: 'Bad Request - Please check your input',
    401: 'Authentication required - Please sign in',
    403: 'Access denied - Insufficient permissions',
    404: 'Resource not found',
    409: 'Conflict - Resource already exists',
    422: 'Validation failed - Please check your input',
    429: 'Too many requests - Please try again later',
    500: 'Server error - Please try again later',
    502: 'Service temporarily unavailable',
    503: 'Service temporarily unavailable',
  };

  return {
    ...defaultError,
    message: statusMessages[status] || defaultError.message,
    statusCode: status,
  };
}

/**
 * Formats validation errors for display
 */
export function formatValidationErrors(details: ValidationErrorDetail[]): string[] {
  if (!details || !Array.isArray(details)) {
    return [];
  }

  return details.map(detail => {
    const field = detail.loc?.slice(1).join('.') || 'field';
    return `${field}: ${detail.msg}`;
  });
}

/**
 * Gets a user-friendly error message
 */
export function getErrorMessage(error: any): string {
  const parsed = parseApiError(error);
  
  if (parsed.isValidationError && parsed.details) {
    const validationErrors = formatValidationErrors(parsed.details);
    if (validationErrors.length > 0) {
      return validationErrors.join(', ');
    }
  }
  
  return parsed.message;
}

/**
 * Checks if error is a specific type
 */
export function isErrorType(error: any, type: ApiErrorType): boolean {
  const parsed = parseApiError(error);
  return parsed.type === type;
}

/**
 * Checks if error requires authentication
 */
export function isAuthError(error: any): boolean {
  const parsed = parseApiError(error);
  return parsed.statusCode === 401 || 
         parsed.type === 'AuthenticationException' ||
         parsed.type === 'AuthorizationException';
} 