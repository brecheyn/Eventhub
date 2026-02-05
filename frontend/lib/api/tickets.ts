import { apiClient } from './client';

export const ticketsAPI = {
  create: async (eventId: string) => {
    const response = await apiClient.post('/api/tickets', { eventId });
    return response.data;
  },

  getMyTickets: async () => {
    const response = await apiClient.get('/api/tickets/my-tickets');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/api/tickets/${id}`);
    return response.data;
  },

  cancel: async (id: string) => {
    const response = await apiClient.delete(`/api/tickets/${id}`);
    return response.data;
  },
};
