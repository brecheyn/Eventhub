import { apiClient } from './client';

export interface Session {
  id: string;
  title: string;
  description?: string;
  speaker?: string;
  speakerBio?: string;
  startTime: string;
  endTime: string;
  room?: string;
  maxAttendees?: number;
  eventId: string;
}

export const sessionsAPI = {
  create: async (eventId: string, data: Partial<Session>) => {
    const response = await apiClient.post(`/api/sessions/events/${eventId}/sessions`, data);
    return response.data;
  },

  getByEvent: async (eventId: string) => {
    const response = await apiClient.get(`/api/sessions/events/${eventId}/sessions`);
    return response.data;
  },

  update: async (id: string, data: Partial<Session>) => {
    const response = await apiClient.put(`/api/sessions/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/api/sessions/${id}`);
    return response.data;
  },
};
