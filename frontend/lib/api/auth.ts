import { apiClient } from './client';

export const authAPI = {
  register: async (data: any) => {
    const response = await apiClient.post('/api/auth/register', data);
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await apiClient.post('/api/auth/login', { email, password });
    return response.data;
  },

  logout: () => {
    // Supprimer le token du localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    // Supprimer le header Authorization
    delete apiClient.defaults.headers.common['Authorization'];
  },

  getProfile: async () => {
    const response = await apiClient.get('/api/auth/profile');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/api/auth/profile');
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await apiClient.put('/api/auth/profile', data);
    return response.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const response = await apiClient.put('/api/auth/change-password', data);
    return response.data;
  },

  deleteAccount: async () => {
    const response = await apiClient.delete('/api/auth/account');
    return response.data;
  },

  isAuthenticated: () => {
    return !!apiClient.defaults.headers.common['Authorization'];
  },
};
