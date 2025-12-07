// src/hooks/useAuth.js
import { useAuthStore } from '../store/useAuthStore';

export const useAuth = () => {
  const { user, token, initializing, login, logout, changePassword } = useAuthStore();

  const isAuthenticated = !!token;
  const isAdmin = user?.role === 'super_admin';
  const isRep = user?.role === 'class_rep' || user?.role === 'course_rep';
  const isStudent = user?.role === 'student';

  return {
    user,
    isAuthenticated,
    initializing,
    isAdmin,
    isRep,
    isStudent,
    login,
    logout,
    changePassword,
  };
};