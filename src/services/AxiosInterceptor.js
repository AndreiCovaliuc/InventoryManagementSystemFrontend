import axios from 'axios';
import AuthService from './AuthService';

// Function to setup axios interceptors
const setupInterceptors = (navigate) => {
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

      // Handle 401/403 errors but don't immediately log out on all requests
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.warn(`Authentication error ${error.response.status} for ${originalRequest.url}`);
        
        // Check if it's truly an expired token issue
        const currentUser = AuthService.getCurrentUser();
        
        // Only log out for authentication endpoints or when token is expired
        if (!currentUser || 
            originalRequest.url.includes('/api/auth/') || 
            (currentUser.token && AuthService.isTokenExpired(currentUser.token))) {
          console.log("Logging out due to authentication failure");
          AuthService.logout();
          
          if (navigate) {
            navigate('/login');
          } else if (window) {
            window.location.href = '/login';
          }
        }
      }
      
      return Promise.reject(error);
    }
  );
};

export { setupInterceptors };