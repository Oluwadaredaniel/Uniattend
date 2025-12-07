// src/store/useSessionStore.js
import { create } from 'zustand';
import { fetchActiveSessionApi } from '../api/attendance.api';
import { fetchRepSessionsApi } from '../api/rep.api';
import dayjs from 'dayjs';

export const useSessionStore = create((set, get) => ({
  activeSession: null,
  activeAttendees: [], // Stores { studentId, regNo, name, timestamp }
  sessionLoading: false,
  repSessions: [], // History and current list for reps
  
  // Student/General
  fetchActiveSession: async () => {
    set({ sessionLoading: true });
    try {
      const session = await fetchActiveSessionApi();
      if (session) {
        // Mock initial attendance from backend if needed, or keep empty
        set({ activeSession: session, activeAttendees: session.attendedStudents || [] });
      } else {
        set({ activeSession: null, activeAttendees: [] });
      }
    } catch (error) {
      console.error("Failed to fetch active session:", error);
      set({ activeSession: null });
    } finally {
      set({ sessionLoading: false });
    }
  },

  // Socket Handlers
  handleNewSession: (session) => {
    set({ activeSession: session, activeAttendees: [], repSessions: [session, ...get().repSessions] });
  },

  handleSessionUpdate: (updatedSession) => {
    set((state) => ({
        activeSession: updatedSession,
        repSessions: state.repSessions.map(s => 
          s._id === updatedSession._id ? updatedSession : s
        ),
    }));
  },

  handleSessionEnd: (sessionId) => {
    set((state) => ({
      activeSession: state.activeSession && state.activeSession._id === sessionId ? 
        { ...state.activeSession, isActive: false, expiresAt: dayjs().toISOString() } : state.activeSession,
      repSessions: state.repSessions.map(s => 
        s._id === sessionId ? { ...s, isActive: false } : s
      ),
    }));
  },
  
  // Realtime Attendance Update
  handleAttendanceMarked: (data) => {
    if (data.sessionId !== get().activeSession?._id) return;
    
    const newAttendee = {
        studentId: data.studentId,
        regNo: data.regNo,
        name: data.name,
        timestamp: data.timestamp,
        markedBy: data.markedBy,
    };

    set((state) => {
        // Check if attendee already exists in the live list
        if (state.activeAttendees.some(a => a.regNo === data.regNo)) {
            return {}; // No change needed
        }
        return { activeAttendees: [newAttendee, ...state.activeAttendees] };
    });
  },

  // Rep/Admin List
  fetchRepSessions: async () => {
    set({ sessionLoading: true });
    try {
      const sessions = await fetchRepSessionsApi();
      set({ repSessions: sessions });
    } catch (error) {
      console.error("Failed to fetch rep sessions:", error);
    } finally {
      set({ sessionLoading: false });
    }
  },

}));