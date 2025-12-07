// src/components/Sidebar.jsx
import { Link, useLocation } from 'react-router-dom';
import {
  Home, Users, BookOpen, Clock, Settings, Upload, Monitor, BarChart3,
  Building2, School, UserPlus
} from 'lucide-react';
import { cn } from '../../lib/utils'; // Assume cn utility exists
import { useAuthStore } from '../store/useAuthStore';

const NavItem = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center space-x-3 rounded-lg px-4 py-2 transition-colors",
        isActive
          ? "bg-primary/10 text-primary font-semibold"
          : "text-muted-foreground hover:bg-muted"
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  );
};

const Sidebar = () => {
  const { user } = useAuthStore();
  
  const studentLinks = [
    { to: "/student/dashboard", icon: Home, label: "Dashboard" },
    { to: "/student/session", icon: Clock, label: "Join Session" },
    { to: "/student/history", icon: BookOpen, label: "History" },
    { to: "/student/profile", icon: Users, label: "Profile" },
  ];

  const repLinks = [
    { to: "/rep/dashboard", icon: Home, label: "Dashboard" },
    { to: "/rep/session/create", icon: Clock, label: "Create Session" },
    { to: "/rep/manage/students", icon: Users, label: "Manage Class" },
  ];

  const adminLinks = [
    { to: "/admin/dashboard", icon: Home, label: "Dashboard" },
    { to: "/admin/manage/faculties", icon: Building2, label: "Manage Faculties" },
    { to: "/admin/manage/departments", icon: School, label: "Manage Depts" },
    { to: "/admin/manage/classlist", icon: Upload, label: "Upload Roster" },
    { to: "/admin/manage/reps", icon: UserPlus, label: "Assign Reps" },
    { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  ];
  
  const getLinks = () => {
    switch (user?.role) {
      case 'student': return studentLinks;
      case 'class_rep':
      case 'course_rep': return repLinks;
      case 'super_admin': return adminLinks;
      default: return [];
    }
  };

  const links = getLinks();
  
  if (!links.length) return null;

  return (
    <nav className="hidden md:flex flex-col w-64 border-r bg-card p-4 min-h-screen sticky top-0">
      <div className="mb-8 pt-4">
        <h2 className="text-2xl font-extrabold text-primary">UniAttend</h2>
        <span className="text-xs text-muted-foreground">{user.regNo}</span>
      </div>
      
      <div className="flex flex-col space-y-2">
        {links.map((link) => (
          <NavItem key={link.to} {...link} />
        ))}
      </div>
      
      {/* Footer/Settings link for all roles if needed */}
      <div className="mt-auto pt-4 border-t">
        <NavItem to="/student/profile" icon={Settings} label="Settings" />
      </div>
    </nav>
  );
};

export default Sidebar;