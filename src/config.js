// Central backend base URL.
// In production (Railway), REACT_APP_API_URL is injected at BUILD time.
// In local dev it falls back to the Spring Boot server on localhost:8080.
// NOTE: Create React App inlines REACT_APP_* at build time, so changing this
// env var requires a rebuild/redeploy to take effect.
export const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:8080';

export default API_BASE_URL;
