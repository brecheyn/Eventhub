import { apiClient } from './client';

export interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location: string;
  venue?: string;
  maxCapacity: number;
  currentCapacity: number;
  ticketPrice: number;
  isFree: boolean;
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';
  imageUrl?: string;
  organizerId: string;
}

export const eventsAPI = {
  getAll: async (params?: { search?: string; status?: string }) => {
    const response = await apiClient.get('/api/events', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/api/events/${id}`);
    return response.data;
  },

  create: async (data: Partial<Event>) => {
    const response = await apiClient.post('/api/events', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Event>) => {
    const response = await apiClient.put(`/api/events/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/api/events/${id}`);
    return response.data;
  },

  getParticipants: async (id: string) => {
    const response = await apiClient.get(`/api/events/${id}/participants`);
    return response.data;
  },
};
