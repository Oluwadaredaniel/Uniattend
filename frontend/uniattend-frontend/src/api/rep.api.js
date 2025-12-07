// src/api/rep.api.js
import axiosInstance from './axiosInstance';

export const createSessionApi = async (data) => {
  const response = await axiosInstance.post('/rep/sessions', data);
  return response.data;
};

export const repExtendSessionApi = async (sessionId, minutes) => {
  const response = await axiosInstance.put(`/rep/sessions/${sessionId}/extend`, { minutes });
  return response.data;
};

export const repCloseSessionApi = async (sessionId) => {
  const response = await axiosInstance.put(`/rep/sessions/${sessionId}/close`);
  return response.data;
};

export const repUploadPartialListApi = async (formData) => {
  const response = await axiosInstance.post('/rep/students/upload-partial', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Fetch all sessions (including past ones) for the rep's scope
export const fetchRepSessionsApi = async () => {
  const response = await axiosInstance.get('/sessions/all');
  return response.data;
};