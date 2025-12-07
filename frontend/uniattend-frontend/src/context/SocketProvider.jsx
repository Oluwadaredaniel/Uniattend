// src/context/SocketProvider.jsx
import React, { createContext, useEffect, useState, useContext, useCallback } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';
import { useSessionStore } from '../store/useSessionStore';

const SocketContext = createContext();

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuthStore();
  const { 
    handleNewSession, 
    handleSessionUpdate, 
    handleSessionEnd, 
    handleAttendanceMarked 
  } = useSessionStore();

  const joinRoom = useCallback(() => {
    if (socket && user?.deptId && user?.level && user.role !== 'super_admin') {
      const deptId = user.deptId;
      const level = user.level;
      socket.emit('join-dept', { deptId, level });
      console.log(`Socket joined room: dept-${deptId}-level-${level}`);
    }
  }, [socket, user]);

  useEffect(() => {
    if (!user || !user.regNo) {
      if (socket) socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      return;
    }

    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      toast.success("Realtime connected!", { id: 'socket-status', duration: 3000 });
      joinRoom(); 
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      toast.error("Realtime disconnected.", { id: 'socket-status', duration: 5000 });
    });

    // --- Custom Events ---
    newSocket.on('new-session', (session) => {
      toast(`New session started: ${session.title}`, { icon: '🔔' });
      handleNewSession(session);
    });

    newSocket.on('session-updated', (session) => {
      // Used for extend/refresh
      handleSessionUpdate(session);
    });
    
    newSocket.on('session-ended', ({ sessionId, message }) => {
      toast.error(message || "Session ended.", { duration: 5000 });
      handleSessionEnd(sessionId);
    });
    
    newSocket.on('attendance-marked', (data) => {
      handleAttendanceMarked(data);
    });

    setSocket(newSocket);
    
    // Cleanup
    return () => {
      newSocket.off('connect');
      newSocket.off('disconnect');
      newSocket.off('new-session');
      newSocket.off('session-updated');
      newSocket.off('session-ended');
      newSocket.off('attendance-marked');
      newSocket.disconnect();
    };

  }, [user, joinRoom, handleNewSession, handleSessionUpdate, handleSessionEnd, handleAttendanceMarked]);

  // Re-join room if socket connects *after* user loads
  useEffect(() => {
    if (isConnected && user?.regNo) {
      joinRoom();
    }
  }, [isConnected, user, joinRoom]);

  const value = { socket, isConnected, joinRoom };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};