// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = () => {
      const user = AuthService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    };

    checkUser();
    
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        checkUser();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (email, password) => {
    const response = await AuthService.login(email, password);
    setCurrentUser(response);
    return response;
  };

  const logout = () => {
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
    if (Array.isArray(currentUser.roles)) {
      return currentUser.roles.includes('ADMIN') || currentUser.roles.includes('ROLE_ADMIN');
    }
    if (typeof currentUser.role === 'string') {
      return currentUser.role === 'ADMIN' || currentUser.role === 'ROLE_ADMIN';
    }
    return false;
  };

  const isManager = () => {
    if (!currentUser) return false;
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