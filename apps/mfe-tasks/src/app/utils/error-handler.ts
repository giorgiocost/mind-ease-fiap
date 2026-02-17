/**
 * Error Handler Utilities
 * Provides consistent error handling across the application
 */

/**
 * Safely extract error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  return 'An unknown error occurred';
}

/**
 * Check if error is a network/HTTP error
 */
export function isNetworkError(error: unknown): boolean {
  return error instanceof Error && (
    error.message.includes('fetch') ||
    error.message.includes('network') ||
    error.message.includes('connection') ||
    error.message.includes('timeout')
  );
}

/**
 * Global error handler for unhandled promise rejections
 * Prevents Chrome extension communication errors from breaking the app
 */
export function setupGlobalErrorHandler(): void {
  // Handle unhandled promise rejections (like Chrome extension errors)
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;

    // Ignore Chrome extension communication errors
    if (error instanceof Error && error.message.includes('message channel closed')) {
      console.warn('Chrome extension communication error (ignored):', error.message);
      event.preventDefault(); // Prevent the error from appearing in console
      return;
    }

    // Ignore extension listener errors
    if (error instanceof Error && error.message.includes('listener indicated an asynchronous response')) {
      console.warn('Extension listener error (ignored):', error.message);
      event.preventDefault();
      return;
    }

    // Log other unhandled errors
    console.error('Unhandled promise rejection:', error);
  });

  // Handle general errors
  window.addEventListener('error', (event) => {
    const error = event.error;

    // Ignore extension-related errors
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      if (message.includes('extension') ||
          message.includes('chrome-extension') ||
          message.includes('message channel')) {
        console.warn('Extension error (ignored):', error.message);
        event.preventDefault();
        return;
      }
    }

    console.error('Global error:', error);
  });
}
