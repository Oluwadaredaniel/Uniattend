// src/pages/rep/SessionLive.jsx
import React, { useMemo, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Clock, ArrowRight, XCircle, Loader2 } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import CountdownTimer from '../../components/CountdownTimer';
import LiveStudentList from '../../components/LiveStudentList';
import ExportButtons from '../../components/ExportButtons';
import { repExtendSessionApi, repCloseSessionApi } from '../../api/rep.api';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const EXTENSION_OPTIONS = [5, 10, 30, 60];

const SessionLive = () => {
  const { sessionId } = useParams();
  const { repSessions, sessionLoading, fetchRepSessions, activeAttendees } = useSessionStore();
  const [isExtending, setIsExtending] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (!repSessions.length && !sessionLoading) {
      fetchRepSessions();
    }
  }, [repSessions.length, sessionLoading, fetchRepSessions]);

  const session = useMemo(() => {
    return repSessions.find(s => s._id === sessionId);
  }, [repSessions, sessionId]);

  if (sessionLoading) return <Loader2 className="h-8 w-8 animate-spin mx-auto mt-20" />;

  if (!session) return <Navigate to="/rep/dashboard" replace />; // Not found or not in scope

  const isExpired = dayjs(session.expiresAt).isBefore(dayjs());
  const isActive = session.isActive && !isExpired;

  const handleExtend = async (minutes) => {
    if (isExtending) return;
    setIsExtending(true);
    try {
      await repExtendSessionApi(session._id, minutes);
      toast.success(`Session extended by ${minutes} minutes!`);
    } catch (error) {
      console.error("Extend failed:", error);
    } finally {
      setIsExtending(false);
    }
  };

  const handleClose = async () => {
    if (isClosing) return;
    setIsClosing(true);
    try {
      await repCloseSessionApi(session._id);
      toast.success("Session closed successfully!");
    } catch (error) {
      console.error("Close failed:", error);
    } finally {
      setIsClosing(false);
    }
  };
  
  const currentAttendees = useMemo(() => {
    return activeAttendees.filter(a => a.sessionId === sessionId);
  }, [activeAttendees, sessionId]);
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <h1 className="text-3xl font-bold flex items-center space-x-3">
        <Monitor />
        <span>Live Session: {session.course}</span>
      </h1>
      <p className="text-muted-foreground">{session.title}</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- Column 1: Timer & Controls --- */}
        <div className="lg:col-span-2 space-y-6">
          <CountdownTimer expiresAt={session.expiresAt} large={true} />
          
          <Card className="p-6">
            <CardTitle className="mb-4">Session Statistics</CardTitle>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-4xl font-extrabold text-primary">{currentAttendees.length}</p>
                <p className="text-sm text-muted-foreground">Students Present</p>
              </div>
              <div>
                <p className="text-4xl font-extrabold text-red-500">N/A</p> {/* Total Roster needed */}
                <p className="text-sm text-muted-foreground">Total Class Size</p>
              </div>
            </div>
          </Card>

          {/* Controls */}
          <Card className="p-6">
            <CardTitle className="mb-4">Live Controls</CardTitle>
            <div className="space-y-4">
              {isActive && (
                <>
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="font-semibold text-sm mr-2">Extend By:</span>
                    {EXTENSION_OPTIONS.map(min => (
                      <Button 
                        key={min} 
                        onClick={() => handleExtend(min)}
                        disabled={isExtending}
                        variant="outline"
                        size="sm"
                      >
                        +{min} Min
                      </Button>
                    ))}
                    {isExtending && <Loader2 className="h-4 w-4 animate-spin text-primary ml-2" />}
                  </div>
                  
                  <Button 
                    onClick={handleClose} 
                    variant="destructive" 
                    className="w-full"
                    disabled={isClosing}
                  >
                    {isClosing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                    End Session Now
                  </Button>
                </>
              )}
              {!isActive && (
                <p className="text-center text-muted-foreground">Session is permanently closed.</p>
              )}
            </div>
          </Card>

          {/* Export */}
          <Card className="p-6">
            <CardTitle className="mb-4">Export Attendance Data</CardTitle>
            <ExportButtons sessionId={session._id} courseName={session.course} />
          </Card>
        </div>
        
        {/* --- Column 2: Live List --- */}
        <div className="lg:col-span-1">
          <LiveStudentList sessionId={session._id} />
        </div>
      </div>
    </motion.div>
  );
};

export default SessionLive;