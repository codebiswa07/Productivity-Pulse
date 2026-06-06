import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(() => {
    try { return JSON.parse(localStorage.getItem('pp_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.login({ email, password });
      localStorage.setItem('pp_token', data.token);
      localStorage.setItem('pp_user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.response?.data?.error || e.message };
    } finally { setLoading(false); }
  };

  const signUp = async (name, email, password) => {
    setLoading(true);
    try {
      const { data } = await api.register({ name, email, password });
      localStorage.setItem('pp_token', data.token);
      localStorage.setItem('pp_user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.response?.data?.error || e.message };
    } finally { setLoading(false); }
  };

  const signOut = () => {
    localStorage.removeItem('pp_token');
    localStorage.removeItem('pp_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
