// src/api/admin.api.js
import axiosInstance from './axiosInstance';

export const fetchFacultiesApi = async () => {
  const response = await axiosInstance.get('/admin/faculties');
  return response.data;
};

export const createFacultyApi = async (data) => {
  const response = await axiosInstance.post('/admin/faculty', data);
  return response.data;
};

export const fetchDepartmentsApi = async (facultyId) => {
  const response = await axiosInstance.get(`/admin/departments?facultyId=${facultyId}`);
  return response.data;
};

export const createDepartmentApi = async (data) => {
  const response = await axiosInstance.post('/admin/department', data);
  return response.data;
};

export const uploadClassListApi = async (formData) => {
  const response = await axiosInstance.post('/admin/students/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const assignClassRepApi = async (data) => {
  const response = await axiosInstance.post('/admin/rep', data);
  return response.data;
};

export const fetchAdminAnalytics = async () => {
  const response = await axiosInstance.get('/admin/analytics');
  return response.data;
};

// Admin Session Overrides (SuperAdmin can close/extend any session)
export const adminExtendSessionApi = async (sessionId, minutes) => {
  const response = await axiosInstance.put(`/admin/session/${sessionId}/extend`, { minutes });
  return response.data;
};

export const adminCloseSessionApi = async (sessionId) => {
  const response = await axiosInstance.put(`/admin/session/${sessionId}/close`);
  return response.data;
};