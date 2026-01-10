import React from 'react';
import { Navigate } from 'react-router-dom';

interface SuperAdminProtectedRouteProps {
  children: React.ReactNode;
}

const SuperAdminProtectedRoute: React.FC<SuperAdminProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem('superAdminToken');
  const superAdminUserStr = localStorage.getItem('superAdminUser');

  if (!token) {
    return <Navigate to="/superadmin/login" replace />;
  }

  try {
    const superAdminUser = superAdminUserStr ? JSON.parse(superAdminUserStr) : null;

    if (!superAdminUser || superAdminUser.role !== 'superadmin') {
      localStorage.removeItem('superAdminToken');
      localStorage.removeItem('superAdminUser');
      return <Navigate to="/superadmin/login" replace />;
    }

    return <>{children}</>;
  } catch (error) {
    localStorage.removeItem('superAdminToken');
    localStorage.removeItem('superAdminUser');
    return <Navigate to="/superadmin/login" replace />;
  }
};

export default SuperAdminProtectedRoute;
