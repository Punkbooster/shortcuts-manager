/**
 * Custom error for validation failures
 */
export class ValidationError {
  constructor(
    public field: string,
    public message: string
  ) {}
}

/**
 * Standard API error response format
 */
export interface ApiError {
  statusCode: number;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Creates a standard API error response
 */
export function createErrorResponse(
  statusCode: number,
  message: string,
  validationErrors?: ValidationError[]
): Response {
  const error: ApiError = {
    statusCode,
    message,
  };

  if (validationErrors?.length) {
    error.errors = validationErrors.map(err => ({
      field: err.field,
      message: err.message,
    }));
  }

  return new Response(JSON.stringify(error), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Standard error responses for common scenarios
 */
export const Errors = {
  unauthorized: () => createErrorResponse(401, 'Authentication required'),
  forbidden: () => createErrorResponse(403, 'Operation not permitted'),
  notFound: (resource: string) => createErrorResponse(404, `${resource} not found`),
  conflict: (message: string) => createErrorResponse(409, message),
  validation: (errors: ValidationError[]) => createErrorResponse(
    400,
    'Invalid input',
    errors
  ),
  serverError: (message = 'Internal server error') => createErrorResponse(500, message),
};
