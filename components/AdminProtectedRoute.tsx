import React from 'react';
import { Navigate } from 'react-router-dom';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  const adminUserStr = localStorage.getItem('adminUser');

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  try {
    const adminUser = adminUserStr ? JSON.parse(adminUserStr) : null;

    if (!adminUser || adminUser.role !== 'admin') {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      return <Navigate to="/admin/login" replace />;
    }

    return <>{children}</>;
  } catch (error) {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    return <Navigate to="/admin/login" replace />;
  }
};

export default AdminProtectedRoute;
