// src/store/useAuthStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';
import { loginApi, logoutApi, changePasswordApi } from '../api/auth.api';

const initialUserState = {
  _id: null,
  regNo: null,
  firstname: null,
  surname: null,
  role: null, // 'student', 'class_rep', 'super_admin'
  deptId: null,
  level: null,
  option: null,
  passwordChanged: true,
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: initialUserState,
      token: null,
      initializing: true, // To handle local storage initialization
      
      setUser: (userData) => set({ user: userData }),
      setToken: (token) => set({ token: token }),

      initializeAuth: () => {
        // This runs after local storage restore is complete
        set({ initializing: false });
      },

      login: async (regNo, password) => {
        try {
          const data = await loginApi({ regNo, password });
          set({ user: { ...initialUserState, ...data }, token: data.token || 'dummy_jwt' }); // Dummy token for persistence
          toast.success(`Welcome, ${data.firstname}!`);
          return data;
        } catch (error) {
          throw error;
        }
      },

      logout: async () => {
        try {
          await logoutApi();
        } catch (error) {
          console.error("Logout failed on server side, clearing client state anyway.", error);
        } finally {
          set({ user: initialUserState, token: null });
          localStorage.removeItem('auth-store'); // Clear persisted state
          window.location.href = '/login';
        }
      },

      changePassword: async (oldPassword, newPassword) => {
        try {
          await changePasswordApi({ oldPassword, newPassword });
          const updatedUser = { ...get().user, passwordChanged: true };
          set({ user: updatedUser });
          toast.success("Password successfully updated!");
          return true;
        } catch (error) {
          throw error;
        }
      }
    }),
    {
      name: 'auth-store', // name of the item in local storage
      storage: {
        getItem: (name) => {
            const str = localStorage.getItem(name);
            if (!str) return null;
            return JSON.parse(str);
        },
        setItem: (name, value) => {
            localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
      onRehydrateStorage: (state) => {
        // After rehydration, signal that initialization is complete
        return (state, error) => {
          if (error) console.error('Error during rehydration:', error);
          if (state) state.initializeAuth();
        };
      },
    }
  )
);