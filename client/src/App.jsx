import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout   from './components/layout/Layout';
import Login    from './components/pages/Login';
import Register from './components/pages/Register';
import Dashboard from './components/pages/Dashboard';
import Reports   from './components/pages/Reports';
import BlockedSites from './components/pages/BlockedSites';
import SettingsPage from './components/pages/SettingsPage';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index            element={<Dashboard />} />
          <Route path="reports"   element={<Reports />} />
          <Route path="blocked"   element={<BlockedSites />} />
          <Route path="settings"  element={<SettingsPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
