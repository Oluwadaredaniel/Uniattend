// src/api/axiosInstance.js
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // IMPORTANT: Allows sending cookies (JWT)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle global errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An unexpected error occurred.';
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Handle unauthorized/forbidden access globally
      toast.error("Session expired or unauthorized. Please log in.");
      // Forced logout logic could be added here if needed
    } else if (error.response?.status === 400 || error.response?.status === 404) {
       toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;