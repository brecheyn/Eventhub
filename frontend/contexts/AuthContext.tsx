'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api/auth';
import { apiClient } from '@/lib/api/client';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  organization?: string;
  isActive: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      // Configurer le token dans axios
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Récupérer le profil utilisateur
      const data = await authAPI.getProfile();
      setUser(data.user || data);
    } catch (error) {
      console.error('Auth check error:', error);
      // Token invalide, nettoyer
      localStorage.removeItem('token');
      delete apiClient.defaults.headers.common['Authorization'];
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const data = await authAPI.login(email, password);
      
      // Stocker le token
      localStorage.setItem('token', data.token);
      
      // Configurer axios avec le token
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      // Stocker l'utilisateur
      setUser(data.user);
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    // Nettoyer localStorage
    localStorage.removeItem('token');
    
    // Nettoyer axios headers
    delete apiClient.defaults.headers.common['Authorization'];
    
    // Nettoyer l'état
    setUser(null);
    
    // Rediriger vers login
    router.push('/auth/login');
  };

  const refreshUser = async () => {
    try {
      const data = await authAPI.getProfile();
      setUser(data.user || data);
    } catch (error) {
      console.error('Refresh user error:', error);
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
