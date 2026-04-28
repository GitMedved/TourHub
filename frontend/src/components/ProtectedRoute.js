import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }
  
  const user = JSON.parse(userStr);
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Если роль не подходит, редиректим на соответствующую страницу
    if (user.role === 'user') return <Navigate to="/" replace />;
    if (user.role === 'seller') return <Navigate to="/seller-dashboard" replace />;
    if (['manager', 'admin'].includes(user.role)) return <Navigate to="/manager-dashboard" replace />;
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
