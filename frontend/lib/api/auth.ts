import { apiClient } from './client';
import Cookies from 'js-cookie';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'organizer' | 'participant';
  phone?: string;
  organization?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const authAPI = {
  register: async (data: RegisterData) => {
    const response = await apiClient.post('/api/auth/register', data);
    return response.data;
  },

  login: async (data: LoginData) => {
    const response = await apiClient.post('/api/auth/login', data);
    const { token, user } = response.data;
    
    Cookies.set('token', token, { expires: 7 });
    Cookies.set('user', JSON.stringify(user), { expires: 7 });
    
    return response.data;
  },

  logout: () => {
    Cookies.remove('token');
    Cookies.remove('user');
  },

  getProfile: async () => {
    const response = await apiClient.get('/api/auth/profile');
    return response.data;
  },

  getCurrentUser: () => {
    const userStr = Cookies.get('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!Cookies.get('token');
  },
};
