// src/components/LiveStudentList.jsx
import React, { useMemo } from 'react';
import { CheckCircle2, User, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { useSessionStore } from '../store/useSessionStore';
import { formatTime } from '../utils/formatDate';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Displays the real-time list of students who have marked attendance.
 */
const LiveStudentList = () => {
  const { activeAttendees } = useSessionStore();

  const sortedAttendees = useMemo(() => {
    // Sort by timestamp (most recent first)
    return [...activeAttendees].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [activeAttendees]);

  return (
    <Card className="shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Live Attendees ({sortedAttendees.length})</span>
          <CheckCircle2 className="h-6 w-6 text-green-500" />
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[400px] overflow-y-auto">
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {sortedAttendees.map((attendee) => (
              <motion.li
                key={attendee.regNo}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between rounded-lg bg-secondary/50 p-3 shadow-sm border border-green-500/30"
              >
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">{attendee.name}</p>
                    <p className="text-sm text-muted-foreground">{attendee.regNo}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="font-mono">{formatTime(attendee.timestamp)}</span>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
          {!sortedAttendees.length && (
            <li className="text-center py-10 text-muted-foreground">
              No attendance marked yet.
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
};

export default LiveStudentList;