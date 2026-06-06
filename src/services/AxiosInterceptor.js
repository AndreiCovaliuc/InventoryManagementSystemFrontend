import axios from 'axios';
import AuthService from './AuthService';

// Holds the react-router navigate fn once the app mounts, so the response
// interceptor can redirect WITHOUT a full-page reload (window.location.href
// reloads the whole SPA, causing a jarring blank flash). Set via setAuthNavigate.
let authNavigate = null;
export const setAuthNavigate = (fn) => {
  authNavigate = fn;
};

// Redirect to /login without remounting the whole app when possible.
const redirectToLogin = () => {
  // Avoid redundant redirects (and reload loops) if we're already there.
  if (window.location.pathname === '/login') return;
  if (authNavigate) {
    authNavigate('/login');
  } else {
    window.location.href = '/login';
  }
};

// Guard so interceptors are only registered once even if setup runs again.
let registered = false;

// Function to setup axios interceptors
const setupInterceptors = (navigate) => {
  if (navigate) setAuthNavigate(navigate);
  if (registered) return;
  registered = true;
  // Request interceptor
  // In AxiosInterceptor.js, update the request interceptor
axios.interceptors.request.use(
  (config) => {
    // Add authorization header to every request if user is logged in
    const token = AuthService.getToken();
    if (token) {
      console.log(`Adding auth token to ${config.method.toUpperCase()} request to ${config.url}`);
      config.headers['Authorization'] = 'Bearer ' + token;
    } else {
      console.warn(`No auth token available for ${config.method.toUpperCase()} request to ${config.url}`);
    }
    
    // Make sure content type is set for POST/PUT
    if ((config.method === 'post' || config.method === 'put') && !config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

  // Response interceptor
  axios.interceptors.response.use(
    (response) => {
      // Success response handler
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      
      // For debugging
      console.error("Response error:", error.response ? error.response.status : error.message);
      
      // Prevent infinite loops
      if (originalRequest._retry) {
        return Promise.reject(error);
      }

      // Handle 401/403 errors but don't immediately log out on all requests.
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.warn(`Authentication error ${error.response.status} for ${originalRequest.url}`);

        const currentUser = AuthService.getCurrentUser();
        const url = originalRequest.url || '';

        // Auth endpoints (login/register) handle their own errors in the form —
        // don't force a global logout/redirect, which would reload the page and
        // wipe the inline error message. A 403 on a permission-gated endpoint
        // (e.g. non-admin hitting /api/admin/**) is also NOT a session problem.
        const isAuthEndpoint = url.includes('/api/auth/');
        const sessionInvalid =
          !currentUser ||
          (currentUser.token && AuthService.isTokenExpired(currentUser.token));

        if (sessionInvalid && !isAuthEndpoint) {
          console.log('Logging out due to expired/invalid session');
          AuthService.logout();
          redirectToLogin();
        }
      }

      return Promise.reject(error);
    }
  );
};

export { setupInterceptors };