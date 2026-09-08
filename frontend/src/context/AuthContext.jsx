import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      const userData = response.data.data;
      setUser({
        ...userData,
        role: String(userData?.role || '').trim().toUpperCase()
      });
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const payload = response.data?.data || {};
      const userData = payload.user || payload;
      const token = payload.token;
      const normalizedUser = {
        ...userData,
        role: String(userData?.role || '').trim().toUpperCase()
      };
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setToken(token);
      setUser(normalizedUser);
      
      return { success: true, user: normalizedUser };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'ADMIN',
    isReceptionist: user?.role === 'RECEPTIONIST',
    isConsultant: user?.role === 'CONSULTANT',
    isDoctor: user?.role === 'DOCTOR',
    isLaboratory: user?.role === 'LABORATORY',
    isPharmacist: user?.role === 'PHARMACIST',
    isCashier: user?.role === 'CASHIER',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
