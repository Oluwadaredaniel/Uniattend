// src/pages/rep/RepDashboard.jsx
import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, ListPlus, Users, Monitor } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import { useSessionStore } from '../../store/useSessionStore';
import { formatDateTime } from '../../utils/formatDate';
import { Separator } from '../../components/ui/Separator';

const RepDashboard = () => {
  const { user } = useAuth();
  const { repSessions, fetchRepSessions, sessionLoading } = useSessionStore();

  useEffect(() => {
    fetchRepSessions();
  }, [fetchRepSessions]);

  const activeSession = useMemo(() => {
    return repSessions.find(s => s.isActive && dayjs(s.expiresAt).isAfter(dayjs()));
  }, [repSessions]);
  
  const recentSessions = useMemo(() => {
    return repSessions
      .filter(s => !s.isActive || dayjs(s.expiresAt).isBefore(dayjs()))
      .slice(0, 5);
  }, [repSessions]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <h1 className="text-3xl font-bold">Class Rep Dashboard</h1>
      <p className="text-muted-foreground">Managing {user.deptId} - Level {user.level}</p>
      
      {/* --- Quick Actions --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/rep/session/create">
          <Card className="hover:shadow-xl transition-shadow bg-primary/10 border-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold">Create New Session</CardTitle>
              <Clock className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent><p className="text-xl font-bold">Start Class Now</p></CardContent>
          </Card>
        </Link>
        <Link to="/rep/manage/students">
          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold">Manage Students</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent><p className="text-xl font-bold">Roster & Overrides</p></CardContent>
          </Card>
        </Link>
      </div>

      {/* --- Active Session --- */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center space-x-2">
            <Monitor />
            <span>{activeSession ? 'LIVE SESSION ACTIVE' : 'No Active Session'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeSession ? (
            <div className="space-y-3">
              <p className="text-xl font-semibold">{activeSession.course}: {activeSession.title}</p>
              <p className="text-muted-foreground">Expires: {formatDateTime(activeSession.expiresAt)}</p>
              <Link to={`/rep/session/live/${activeSession._id}`}>
                <Button className="mt-2" variant="destructive">Go to Live Monitor</Button>
              </Link>
            </div>
          ) : (
            <p className="text-muted-foreground">Use "Create New Session" to start a class.</p>
          )}
        </CardContent>
      </Card>
      
      <Separator />

      {/* --- Recent Sessions History --- */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Recent Past Sessions</h2>
        <div className="space-y-3">
          {sessionLoading && <p>Loading sessions...</p>}
          {!sessionLoading && recentSessions.length === 0 && <p className="text-muted-foreground">No past sessions found.</p>}
          
          {recentSessions.map(session => (
            <Card key={session._id} className="p-4 flex justify-between items-center hover:bg-muted transition-colors">
              <div>
                <p className="font-semibold">{session.course}: {session.title}</p>
                <p className="text-sm text-muted-foreground">Ended: {formatDateTime(session.expiresAt)}</p>
              </div>
              {/* NOTE: Link to a detailed history view for this session (assumed route) */}
              <Link to={`/rep/history/${session._id}`}> 
                <Button variant="outline" size="sm">View Details</Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default RepDashboard;