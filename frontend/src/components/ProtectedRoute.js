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
    if (user.role === 'USER') return <Navigate to="/" replace />;
    if (user.role === 'SELLER') return <Navigate to="/seller" replace />;
    if (['MANAGER', 'ADMIN'].includes(user.role)) return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/manager'} replace />;
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
