// src/hooks/useSessionTimer.js
import { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';

/**
 * Calculates and manages the remaining time for a session.
 * @param {string} expiresAt - ISO string of session expiry time.
 * @returns {object} { remainingTime, isExpired }
 */
export const useSessionTimer = (expiresAt) => {
  const [remainingMs, setRemainingMs] = useState(0);

  const calculateRemaining = useCallback(() => {
    if (!expiresAt) {
      setRemainingMs(0);
      return 0;
    }
    const expiryTime = dayjs(expiresAt);
    const now = dayjs();
    const ms = expiryTime.diff(now);
    setRemainingMs(Math.max(0, ms));
    return Math.max(0, ms);
  }, [expiresAt]);

  useEffect(() => {
    // Initial calculation
    calculateRemaining();

    // Set up interval for updates
    const interval = setInterval(() => {
      const ms = calculateRemaining();
      if (ms <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    // Cleanup interval on unmount or dependency change
    return () => clearInterval(interval);
  }, [expiresAt, calculateRemaining]);

  // Format the time for display
  const formatTime = (ms) => {
    if (ms <= 0) return '00:00:00';
    
    const duration = dayjs.duration(ms);
    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();
    const seconds = duration.seconds();

    const pad = (num) => String(num).padStart(2, '0');

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  return {
    remainingTime: formatTime(remainingMs),
    isExpired: remainingMs <= 0,
    remainingMs,
  };
};

dayjs.extend(require('dayjs/plugin/duration')); 