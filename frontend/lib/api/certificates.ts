import { apiClient } from './client';

export const certificatesAPI = {
  generate: async (eventId: string) => {
    const response = await apiClient.post('/api/certificates', { eventId });
    return response.data;
  },

  getMyCertificates: async () => {
    const response = await apiClient.get('/api/certificates/my-certificates');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/api/certificates/${id}`);
    return response.data;
  },
};
