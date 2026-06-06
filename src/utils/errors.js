// Turn an axios error into a user-facing message.
//
// Priority:
//  - 403 -> a clear "no permission" message (the user lacks rights for the action)
//  - 401 -> session expired
//  - otherwise surface the server's response body (plain-string bodies, or
//    JSON { message } / { error }) so backend validation text reaches the user
//    (e.g. "At least one administrator is required...")
//  - no response at all -> network/CORS problem
//  - finally, the caller-supplied contextual fallback
export function extractErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  const status = err?.response?.status;

  if (status === 403) {
    return "You don't have permission to perform this action.";
  }
  if (status === 401) {
    return 'Your session has expired. Please log in again.';
  }

  const data = err?.response?.data;
  if (typeof data === 'string' && data.trim()) return data.trim();
  if (data && typeof data.message === 'string' && data.message.trim()) return data.message;
  if (data && typeof data.error === 'string' && data.error.trim()) return data.error;

  // No response object means the request never reached/returned from the server.
  if (!err?.response) return 'Network error — please check your connection.';

  return fallback;
}
