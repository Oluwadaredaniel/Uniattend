import axiosInstance from './axiosInstance';

/**
 * Fetches the currently active attendance session.
 * Expects the backend to return: { success: true, session: {...} }
 */
export const fetchActiveSessionApi = async () => {
  const response = await axiosInstance.get('/sessions/active');
  return response.data.session; 
};

/**
 * Marks a student's attendance for the given session ID.
 * Payload: { sessionId }
 * Expects the backend to return: { success: true, attendance: {...} }
 */
export const markAttendanceApi = async (sessionId) => {
  const response = await axiosInstance.post('/attendance/mark', { sessionId });
  return response.data;
};

/**
 * Fetches the list of attendees for a specific session (for Reps/Admins).
 * Expects the backend to return: { success: true, attendees: [...] }
 */
export const fetchSessionAttendeesApi = async (sessionId) => {
  const response = await axiosInstance.get(`/attendance/session/${sessionId}/attendees`);
  return response.data.attendees; 
};

/**
 * Generates the URL for exporting session attendance data.
 * This is a direct download link.
 */
export const exportSessionApi = (sessionId, format) => {
  return `${axiosInstance.defaults.baseURL}/attendance/export/${sessionId}?format=${format}`;
};

/**
 * Fetches the complete attendance history for a specific registration number.
 * Expects the backend to return: { success: true, history: [...] }
 */
export const fetchAttendanceHistoryApi = async (regNo) => {
  const response = await axiosInstance.get(`/attendance/history?regNo=${regNo}`);
  return response.data.history; 
};