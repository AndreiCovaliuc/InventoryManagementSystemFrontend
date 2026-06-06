// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthService from '../services/AuthService';
import websocketService from '../services/WebSocketService';
import { API_BASE_URL } from '../config';

export const AuthContext = createContext();

// The JWT/login payload's role can be unreliable, so treat GET /api/users/me
// as the source of truth for the current user's role. Returns the user object
// merged with the canonical role (falls back to the original user on failure).
const withCanonicalRole = async (user) => {
  if (!user?.token) return user;
  try {
    const { data } = await axios.get(`${API_BASE_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${user.token}` }
    });
    return { ...user, role: data.role, id: data.id ?? user.id };
  } catch (err) {
    console.error('AuthContext: failed to fetch /api/users/me', err);
    return user;
  }
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const checkUser = async () => {
      const user = AuthService.getCurrentUser();
      if (user) {
        const withRole = await withCanonicalRole(user);
        if (!cancelled) setCurrentUser(withRole);
      } else if (!cancelled) {
        setCurrentUser(null);
      }
      if (!cancelled) setLoading(false);
    };

    checkUser();

    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        checkUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      cancelled = true;
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = async (email, password) => {
    const response = await AuthService.login(email, password);
    const withRole = await withCanonicalRole(response);
    setCurrentUser(withRole);
    return withRole;
  };

  const logout = () => {
    // Disconnect WebSocket before logging out
    websocketService.disconnect();
    AuthService.logout();
    setCurrentUser(null);
    navigate('/login');
  };

  const register = async (name, email, password, role) => {
    return await AuthService.register(name, email, password, role);
  };

  // NEW: Register company
  const registerCompany = async (companyData) => {
    return await AuthService.registerCompany(companyData);
  };

  const isAuthenticated = () => !!currentUser;

  // NEW: Get company info
  const getCompanyId = () => currentUser?.companyId || null;
  const getCompanyName = () => currentUser?.companyName || null;

  const isAdmin = () => {
    if (!currentUser) return false;
    // Canonical role from /api/users/me takes precedence over the login payload.
    if (typeof currentUser.role === 'string') {
      return currentUser.role === 'ADMIN' || currentUser.role === 'ROLE_ADMIN';
    }
    if (Array.isArray(currentUser.roles)) {
      return currentUser.roles.includes('ADMIN') || currentUser.roles.includes('ROLE_ADMIN');
    }
    return false;
  };

  const isManager = () => {
    if (!currentUser) return false;
    if (typeof currentUser.role === 'string') {
      return ['MANAGER', 'ROLE_MANAGER', 'ADMIN', 'ROLE_ADMIN'].includes(currentUser.role);
    }
    if (Array.isArray(currentUser.roles)) {
      return currentUser.roles.some(role =>
        ['MANAGER', 'ROLE_MANAGER', 'ADMIN', 'ROLE_ADMIN'].includes(role));
    }
    return false;
  };

  const value = {
    currentUser,
    login,
    logout,
    register,
    registerCompany,
    isAuthenticated,
    isAdmin,
    isManager,
    getCompanyId,
    getCompanyName,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};