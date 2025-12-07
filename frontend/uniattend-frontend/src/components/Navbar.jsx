// src/components/Navbar.jsx
import { LogOut, Moon, Sun, Menu } from 'lucide-react';
import { Button } from './ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/useAuthStore';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { toggleTheme } = useAuthStore(); // Assuming theme toggle is in AuthStore or global context
  
  const handleLogout = () => {
    logout();
  };

  const getRoleDisplay = (role) => {
    if (!role) return 'User';
    return role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  // Simple theme toggle logic (not fully implemented in store, but provided for completeness)
  const toggleThemeMode = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background shadow-md">
      <div className="container flex h-16 items-center justify-between py-4">
        <Link to="/" className="text-xl font-bold text-primary">UniAttend</Link>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex flex-col items-end text-sm">
            <span className="font-semibold">{user.firstname} {user.surname}</span>
            <span className="text-xs text-muted-foreground">{getRoleDisplay(user.role)}</span>
          </div>

          <Button variant="ghost" size="icon" onClick={toggleThemeMode}>
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5 text-destructive" />
            <span className="sr-only">Logout</span>
          </Button>
          
          {/* Mobile menu toggle (assuming Sidebar is responsive and uses context) */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;