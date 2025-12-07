// src/components/CountdownTimer.jsx
import React from 'react';
import { Clock } from 'lucide-react';
import { useSessionTimer } from '../hooks/useSessionTimer';
import { cn } from '../../lib/utils';

/**
 * Displays a countdown timer for an active session.
 * @param {string} expiresAt - ISO string of session expiry time.
 * @param {boolean} large - Whether to render a large display.
 */
const CountdownTimer = ({ expiresAt, large = false }) => {
  const { remainingTime, isExpired, remainingMs } = useSessionTimer(expiresAt);

  const getColorClass = () => {
    if (isExpired) return 'text-destructive';
    if (remainingMs < 5 * 60 * 1000) return 'text-orange-500 animate-pulse'; // Less than 5 mins
    return 'text-green-500';
  };
  
  const textSize = large ? 'text-6xl font-extrabold' : 'text-3xl font-bold';
  const labelSize = large ? 'text-lg' : 'text-sm';

  return (
    <div className={cn("flex items-center justify-center space-x-4 p-4 rounded-xl bg-card shadow-lg", getColorClass())}>
      <Clock className={cn("shrink-0", large ? "h-10 w-10" : "h-6 w-6")} />
      <div className="flex flex-col items-center">
        <span className={textSize}>
          {isExpired ? 'EXPIRED' : remainingTime}
        </span>
        <span className={cn("uppercase tracking-wider", labelSize, isExpired ? 'text-destructive/80' : 'text-muted-foreground')}>
          {isExpired ? 'Session Ended' : 'Time Remaining'}
        </span>
      </div>
    </div>
  );
};

export default CountdownTimer;