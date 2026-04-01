import { Link, useNavigate } from 'react-router-dom';
import { Hammer, User, MessageSquare, LogOut, Search } from 'lucide-react';
import { useAuth } from './AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, profile, isAuthReady } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (!isAuthReady) return null;

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-blue-600 font-bold text-xl">
          <Hammer className="w-6 h-6" />
          <span>ServiceHub</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/search" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1">
            <Search className="w-4 h-4" />
            <span>Find Services</span>
          </Link>
          <Link to="/how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors">How It Works</Link>
          <Link to="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <NotificationBell />
              <Link to="/dashboard" className="p-2 text-gray-600 hover:bg-gray-100 rounded-full flex items-center gap-2">
                <User className="w-5 h-5" />
                <span className="hidden sm:inline text-sm font-medium text-gray-700">{profile?.name || 'User'}</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-4 py-2 text-gray-600 hover:text-blue-600 font-medium">
                Login
              </Link>
              <Link to="/register" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
