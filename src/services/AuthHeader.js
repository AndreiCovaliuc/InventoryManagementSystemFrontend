import AuthService from './AuthService';

export default function authHeader() {
  const token = AuthService.getToken();
  if (token) {
    // For Spring Boot back-end
    return { 'Authorization': 'Bearer ' + token };
  } else {
    return {};
  }
}