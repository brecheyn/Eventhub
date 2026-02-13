import { apiClient } from './client';

export interface Event {
  id: string;
  title: string;
  description?: string;
  eventType: string;  // NOUVEAU
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

  create: async (data: any) => {
    // Si une image est présente, utiliser FormData
    if (data.image) {
      const formData = new FormData();
      
      Object.keys(data).forEach(key => {
        if (key === 'image' && data[key]) {
          formData.append('image', data[key]);
        } else if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key].toString());
        }
      });

      const response = await apiClient.post('/api/events', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      // Sans image, envoyer comme JSON normal
      const response = await apiClient.post('/api/events', data);
      return response.data;
    }
  },

  update: async (id: string, data: any) => {
    // Si une image est présente, utiliser FormData
    if (data.image) {
      const formData = new FormData();
      
      Object.keys(data).forEach(key => {
        if (key === 'image' && data[key]) {
          formData.append('image', data[key]);
        } else if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key].toString());
        }
      });

      const response = await apiClient.put(`/api/events/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      // Sans image, envoyer comme JSON normal
      const response = await apiClient.put(`/api/events/${id}`, data);
      return response.data;
    }
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