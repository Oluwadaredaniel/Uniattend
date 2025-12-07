// src/pages/student/JoinSession.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Loader2, CheckCircle, Clock } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import { useAuth } from '../../hooks/useAuth';
import { markAttendanceApi } from '../../api/attendance.api';
import CountdownTimer from '../../components/CountdownTimer';
import toast from 'react-hot-toast';
import { formatDateTime } from '../../utils/formatDate';

const JoinSession = () => {
  const { user } = useAuth();
  const { activeSession, fetchActiveSession, sessionLoading, activeAttendees } = useSessionStore();
  const [isMarking, setIsMarking] = useState(false);
  const isPresent = activeAttendees.some(a => a.regNo === user.regNo);

  useEffect(() => {
    fetchActiveSession();
  }, [fetchActiveSession]);

  const handleMarkAttendance = async () => {
    if (!activeSession || isPresent) return;
    
    setIsMarking(true);
    try {
      await markAttendanceApi(activeSession._id);
      toast.success("Attendance marked successfully! 🎉");
      // The socket update will add the student to the activeAttendees list
    } catch (error) {
      console.error("Attendance failed:", error);
      // Error toast is handled by interceptor
    } finally {
      setIsMarking(false);
    }
  };

  if (sessionLoading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="mt-4">Checking for session...</p>
      </motion.div>
    );
  }

  if (!activeSession) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
        <h2 className="text-3xl font-bold">No Active Session</h2>
        <p className="text-muted-foreground mt-2">Please check the dashboard or contact your class rep.</p>
      </motion.div>
    );
  }
  
  const isExpired = dayjs(activeSession.expiresAt).isBefore(dayjs());

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center">Mark Attendance for Class</h1>
      
      <CountdownTimer expiresAt={activeSession.expiresAt} large={false} />

      <Card className="shadow-2xl border-primary/50">
        <CardHeader>
          <CardTitle className="text-2xl">{activeSession.course}: {activeSession.title}</CardTitle>
          <p className="text-sm text-muted-foreground flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Session ends: {formatDateTime(activeSession.expiresAt)}</span>
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            **Your Class:** Level {user.level}, Dept {user.deptId}.
            {activeSession.createdBy && <span className="block text-sm text-muted-foreground">Created by: {activeSession.createdBy.firstname} {activeSession.createdBy.surname}</span>}
          </p>
        </CardContent>
        <CardFooter className="pt-4">
          <Button 
            className="w-full h-12 text-lg"
            onClick={handleMarkAttendance}
            disabled={isExpired || isPresent || isMarking}
            variant={isExpired ? 'destructive' : isPresent ? 'secondary' : 'default'}
          >
            {isMarking ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : isExpired ? (
              'SESSION EXPIRED'
            ) : isPresent ? (
              <span className="flex items-center"><CheckCircle className="mr-2 h-5 w-5" /> Attendance Already Marked</span>
            ) : (
              'MARK ATTENDANCE NOW'
            )}
          </Button>
        </CardFooter>
      </Card>
      {isExpired && <p className="text-center text-destructive font-medium">You missed the window. Please contact your instructor.</p>}
    </motion.div>
  );
};

export default JoinSession;