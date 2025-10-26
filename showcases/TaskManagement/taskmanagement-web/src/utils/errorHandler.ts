/**
 * Error handler utility for API responses
 * Provides user-friendly error messages based on HTTP status codes and error details
 */

export interface ApiError {
  status: number;
  message: string;
  details?: string;
}

/**
 * Parse error response from API and return user-friendly message
 */
export async function parseApiError(response: Response): Promise<ApiError> {
  const status = response.status;
  let message = '';
  let details = '';

  try {
    const data = await response.json();
    // Try to extract error message from API response
    message = data.message || data.error || data.title || '';
    details = data.details || data.description || '';
  } catch {
    // If response is not JSON, use status text
    message = response.statusText || 'Unknown error';
  }

  // Map HTTP status codes to user-friendly messages
  const userMessage = getErrorMessage(status, message);

  return {
    status,
    message: userMessage,
    details: details || message,
  };
}

/**
 * Get user-friendly error message based on HTTP status code
 */
function getErrorMessage(status: number, apiMessage: string): string {
  switch (status) {
    case 400:
      return 'Invalid input. Please check your data and try again.';
    case 401:
      return 'Your session has expired. Please log in again.';
    case 403:
      return 'You don\'t have permission to perform this action. Only project owners, managers and project admin can make changes.';
    case 404:
      return 'The project was not found. It may have been deleted.';
    case 409:
      return 'This action conflicts with the current state. Please refresh and try again.';
    case 422:
      return 'The data you provided is invalid. Please check and try again.';
    case 500:
      return 'Server error. Please try again later.';
    case 503:
      return 'Service unavailable. Please try again later.';
    default:
      // If API provided a specific message, use it
      if (apiMessage && apiMessage.length > 0 && apiMessage.length < 200) {
        return apiMessage;
      }
      return 'An error occurred. Please try again.';
  }
}

/**
 * Format error for display to user
 * Combines main message with details if available
 */
export function formatErrorForDisplay(error: ApiError): string {
  if (error.details && error.details !== error.message) {
    return `${error.message}\n\nDetails: ${error.details}`;
  }
  return error.message;
}
