import { apiClient } from './client';

export const checkinAPI = {
  scan: async (data: { ticketId?: string; ticketNumber?: string }) => {
    const response = await apiClient.post('/api/checkin/scan', data);
    return response.data;
  },

  getStats: async (eventId: string) => {
    const response = await apiClient.get(`/api/checkin/stats/${eventId}`);
    return response.data;
  },
};
