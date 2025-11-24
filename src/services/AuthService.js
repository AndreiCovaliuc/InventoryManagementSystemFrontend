// src/services/AuthService.js
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth/';

class AuthService {
  login(email, password) {
    return axios
      .post(API_URL + 'login', { email, password })
      .then(response => {
        if (response.data.token) {
          // Now includes companyId and companyName
          localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
      });
  }

  logout() {
    localStorage.removeItem('user');
  }

  // NEW: Register company with admin
  registerCompany(companyData) {
    return axios.post(API_URL + 'register-company', companyData);
  }

  // Keep existing register for admin creating users
  register(name, email, password, role) {
    return axios.post(API_URL + 'register', {
      name,
      email,
      password,
      role
    });
  }

  isTokenExpired(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (e) {
      return true;
    }
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    const user = JSON.parse(userStr);
    
    if (user && user.token && this.isTokenExpired(user.token)) {
      localStorage.removeItem('user');
      return null;
    }
    return user;
  }

  // NEW: Get company info
  getCompanyId() {
    const user = this.getCurrentUser();
    return user ? user.companyId : null;
  }

  getCompanyName() {
    const user = this.getCurrentUser();
    return user ? user.companyName : null;
  }

  getToken() {
    const user = this.getCurrentUser();
    return user ? user.token : null;
  }

  getAuthHeader() {
    const token = this.getToken();
    if (token) {
      return { Authorization: 'Bearer ' + token };
    }
    return {};
  }

  hasRole(role) {
    const user = this.getCurrentUser();
    if (!user || !Array.isArray(user.roles)) return false;
    return user.roles.includes(role) || user.roles.includes(`ROLE_${role}`);
  }

  isAdmin() {
    return this.hasRole('ADMIN');
  }

  isManager() {
    return this.hasRole('MANAGER') || this.hasRole('ADMIN');
  }
}

export default new AuthService();