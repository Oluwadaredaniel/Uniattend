// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from './store/useAuthStore';
import { useSocket } from './context/SocketProvider';

// Layouts & UI
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LoadingScreen from './pages/LoadingScreen';
import NotFound from './pages/NotFound';
import RoleProtectedRoute from './components/RoleProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForceChangePassword from './pages/auth/ForceChangePassword';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import JoinSession from './pages/student/JoinSession';
import AttendanceHistory from './pages/student/AttendanceHistory';
import Profile from './pages/student/Profile';

// Rep Pages
import RepDashboard from './pages/rep/RepDashboard';
import CreateSession from './pages/rep/CreateSession';
import SessionLive from './pages/rep/SessionLive';
import ManageStudents from './pages/rep/ManageStudents';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageFaculties from './pages/admin/ManageFaculties';
import ManageDepartments from './pages/admin/ManageDepartments';
import UploadClassList from './pages/admin/UploadClassList';
import AssignClassRep from './pages/admin/AssignClassRep';
import Analytics from './pages/admin/Analytics';

const App = () => {
  const { user, token, initializing } = useAuthStore();
  const { isConnected } = useSocket();

  if (initializing) {
    return <LoadingScreen />;
  }
  
  const isAuthenticated = !!token;
  const requiresPasswordChange = user && !user.passwordChanged;

  const getLayout = (element) => (
    <div className="flex min-h-screen bg-background">
      {isAuthenticated && <Sidebar user={user} />}
      <div className="flex-1">
        {isAuthenticated && <Navbar />}
        <main className="p-4 md:p-8">
          {element}
        </main>
      </div>
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!isAuthenticated ? getLayout(<Login />) : <Navigate to="/" />} />
        <Route path="/signup" element={!isAuthenticated ? getLayout(<Signup />) : <Navigate to="/" />} />
        
        {/* Force Password Change Route (Protected if logged in and needs change) */}
        <Route 
          path="/force-change-password" 
          element={
            isAuthenticated && requiresPasswordChange 
              ? getLayout(<ForceChangePassword />) 
              : <Navigate to={isAuthenticated ? '/' : '/login'} />
          } 
        />

        {/* Home Route Redirects based on Role */}
        <Route path="/" element={
          isAuthenticated 
            ? requiresPasswordChange 
              ? <Navigate to="/force-change-password" />
              : user.role === 'super_admin' 
                ? <Navigate to="/admin/dashboard" />
                : user.role === 'class_rep' || user.role === 'course_rep'
                  ? <Navigate to="/rep/dashboard" />
                  : <Navigate to="/student/dashboard" />
            : <Navigate to="/login" />
        } />
        
        {/* STUDENT Routes */}
        <Route element={<RoleProtectedRoute allowedRoles={['student']} />}>
          <Route path="/student/dashboard" element={getLayout(<StudentDashboard />)} />
          <Route path="/student/session" element={getLayout(<JoinSession />)} />
          <Route path="/student/history" element={getLayout(<AttendanceHistory />)} />
          <Route path="/student/profile" element={getLayout(<Profile />)} />
        </Route>

        {/* REP Routes */}
        <Route element={<RoleProtectedRoute allowedRoles={['class_rep', 'course_rep']} />}>
          <Route path="/rep/dashboard" element={getLayout(<RepDashboard />)} />
          <Route path="/rep/session/create" element={getLayout(<CreateSession />)} />
          <Route path="/rep/session/live/:sessionId" element={getLayout(<SessionLive />)} />
          <Route path="/rep/manage/students" element={getLayout(<ManageStudents />)} />
        </Route>

        {/* ADMIN Routes */}
        <Route element={<RoleProtectedRoute allowedRoles={['super_admin']} />}>
          <Route path="/admin/dashboard" element={getLayout(<AdminDashboard />)} />
          <Route path="/admin/manage/faculties" element={getLayout(<ManageFaculties />)} />
          <Route path="/admin/manage/departments" element={getLayout(<ManageDepartments />)} />
          <Route path="/admin/manage/classlist" element={getLayout(<UploadClassList />)} />
          <Route path="/admin/manage/reps" element={getLayout(<AssignClassRep />)} />
          <Route path="/admin/analytics" element={getLayout(<Analytics />)} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={getLayout(<NotFound />)} />
      </Routes>
    </AnimatePresence>
  );
};

export default App;