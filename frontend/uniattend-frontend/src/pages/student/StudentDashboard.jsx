// src/pages/student/StudentDashboard.jsx
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Link } from 'react-router-dom';
import { Clock, BookOpen, Users } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSessionStore } from '../../store/useSessionStore';
import CountdownTimer from '../../components/CountdownTimer';
import { Button } from '../../components/ui/Button';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { activeSession, fetchActiveSession, sessionLoading } = useSessionStore();

  useEffect(() => {
    fetchActiveSession();
  }, [fetchActiveSession]);
  
  const greeting = dayjs().hour() < 12 ? 'Good Morning' : dayjs().hour() < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <header>
        <h1 className="text-3xl font-bold">{greeting}, {user.firstname}! 👋</h1>
        <p className="text-muted-foreground">Welcome to UniAttend. Check for your current class session below.</p>
      </header>

      {/* --- Active Session Status --- */}
      <Card className="shadow-lg border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center space-x-2">
            <Clock />
            <span>Active Session Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessionLoading ? (
            <p className="text-center py-8">Checking for active sessions...</p>
          ) : activeSession ? (
            <div className="space-y-4">
              <CountdownTimer expiresAt={activeSession.expiresAt} large={true} />
              <div className="text-center">
                <p className="text-xl font-semibold">Course: {activeSession.course}</p>
                <p className="text-md text-muted-foreground">{activeSession.title}</p>
              </div>
              <Button asChild className="w-full max-w-sm mx-auto block">
                <Link to="/student/session">Go Mark Attendance</Link>
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-xl font-medium text-green-600">No active sessions found for your class.</p>
              <p className="text-muted-foreground mt-2">Check back later or contact your Class Rep.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* --- Quick Links --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/student/history">
          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance History</CardTitle>
              <BookOpen className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">View Records</div>
              <p className="text-xs text-muted-foreground">All your marked sessions.</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/student/profile">
          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Profile</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.regNo}</div>
              <p className="text-xs text-muted-foreground">Department: {user.deptId || 'N/A'}</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </motion.div>
  );
};

export default StudentDashboard;