import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('sigte-token'));

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API}/auth/me`);
      setUser(response.data);
    } catch (error) {
      console.error('Auth check failed:', error);
      // Token might be invalid, clear it
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, senha) => {
    try {
      const response = await axios.post(`${API}/auth/login`, {
        email,
        senha
      });

      const { access_token, user: userData } = response.data;
      
      setToken(access_token);
      setUser(userData);
      localStorage.setItem('sigte-token', access_token);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login failed:', error);
      const message = error.response?.data?.detail || 'Erro ao fazer login';
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API}/auth/register`, userData);
      return { success: true, user: response.data };
    } catch (error) {
      console.error('Registration failed:', error);
      const message = error.response?.data?.detail || 'Erro ao registrar usuário';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('sigte-token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === 'admin') return true;
    
    // Define role-based permissions
    const rolePermissions = {
      secretario: [
        'view_dashboard',
        'manage_alunos',
        'manage_escolas',
        'manage_rotas',
        'manage_veiculos',
        'view_frequencia',
        'manage_ocorrencias',
        'view_relatorios'
      ],
      monitor: [
        'view_dashboard',
        'view_alunos',
        'view_rotas',
        'manage_frequencia',
        'create_ocorrencias',
        'view_relatorios'
      ],
      diretor: [
        'view_dashboard',
        'view_alunos',
        'view_escolas',
        'view_rotas',
        'view_veiculos',
        'view_frequencia',
        'view_ocorrencias',
        'view_relatorios',
        'manage_configuracoes'
      ]
    };

    const userPermissions = rolePermissions[user.role] || [];
    return userPermissions.includes(permission);
  };

  const isRole = (role) => {
    return user?.role === role;
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    hasPermission,
    isRole,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isSecretario: user?.role === 'secretario',
    isMonitor: user?.role === 'monitor',
    isDiretor: user?.role === 'diretor'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};