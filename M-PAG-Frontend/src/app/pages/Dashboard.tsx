import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router';


export function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Different dashboards based on roles
  if (user.role === 'system_admin') {
    return <Navigate to="/admin/users" />;
  }

  if (user.role === 'administrateur') {
    return <Navigate to="/admin-dashboard" />;
  }

  if (user.role === 'responsable_risques') {
    return <Navigate to="/opage-risks" />;
  }

  if (user.role === 'responsable_org') {
    return <Navigate to="/manager-dashboard" />;
  }

  if (user.role === 'auditeur') {
    return <Navigate to="/results" />;
  }

  if (user.role === 'decideur') {
    return <Navigate to="/impact-simulation" />;
  }

  if (user.role === 'observateur') {
    return <Navigate to="/results" />;
  }

  return <Navigate to="/login" />;
}
