// API Response Types
export interface ApiErrorResponse {
  error: {
    type: string;
    message: string;
    status_code: number;
    details?: any[];
  };
}

export interface ValidationErrorDetail {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiErrorResponse['error'];
}

// Error types from backend
export type ApiErrorType = 
  | 'APIException'
  | 'DatabaseException' 
  | 'AuthenticationException'
  | 'AuthorizationException'
  | 'ValidationException'
  | 'ResourceNotFoundException'
  | 'RateLimitException'
  | 'AIServiceException'
  | 'HTTPException'
  | 'ValidationError'
  | 'DatabaseError'
  | 'InternalServerError';

export interface ParsedError {
  message: string;
  type: ApiErrorType;
  statusCode: number;
  details?: ValidationErrorDetail[];
  isValidationError: boolean;
} 