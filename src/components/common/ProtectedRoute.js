import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const ProtectedRoute = ({ element, requiredRole }) => {
  const { currentUser, isAuthenticated, isAdmin, isManager } = useContext(AuthContext);
  
  // Check if user is authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Check roles if required
  if (requiredRole) {
    if (requiredRole === 'ADMIN' && !isAdmin()) {
      return <Navigate to="/unauthorized" replace />;
    }
    
    if (requiredRole === 'MANAGER' && !isManager()) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // If everything is fine, render the requested component
  return element;
};

export default ProtectedRoute;