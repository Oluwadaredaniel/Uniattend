// src/api/auth.api.js
import axiosInstance from './axiosInstance';

export const loginApi = async (data) => {
  const response = await axiosInstance.post('/auth/login', data);
  return response.data;
};

export const signupApi = async (data) => {
  // Frontend sends: regNo, surname, faculty, dept, level, option
  // Backend uses: regNo, surname for initial password/validation
  const response = await axiosInstance.post('/auth/signup', data); 
  return response.data;
};

export const changePasswordApi = async (data) => {
  const response = await axiosInstance.put('/auth/password', data);
  return response.data;
};

export const logoutApi = async () => {
  const response = await axiosInstance.post('/auth/logout');
  return response.data;
};