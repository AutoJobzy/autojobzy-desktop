import React from 'react';
import { Navigate } from 'react-router-dom';

interface InstituteAdminProtectedRouteProps {
  children: React.ReactNode;
}

const InstituteAdminProtectedRoute: React.FC<InstituteAdminProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem('instituteAdminToken');
  const instituteAdminUserStr = localStorage.getItem('instituteAdminUser');

  if (!token) {
    return <Navigate to="/institute-admin/login" replace />;
  }

  try {
    const instituteAdminUser = instituteAdminUserStr ? JSON.parse(instituteAdminUserStr) : null;

    if (!instituteAdminUser || instituteAdminUser.role !== 'institute_admin') {
      localStorage.removeItem('instituteAdminToken');
      localStorage.removeItem('instituteAdminUser');
      return <Navigate to="/institute-admin/login" replace />;
    }

    return <>{children}</>;
  } catch (error) {
    localStorage.removeItem('instituteAdminToken');
    localStorage.removeItem('instituteAdminUser');
    return <Navigate to="/institute-admin/login" replace />;
  }
};

export default InstituteAdminProtectedRoute;
