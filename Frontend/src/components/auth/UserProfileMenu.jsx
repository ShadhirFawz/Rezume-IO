import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogIn, 
  UserPlus, 
  LogOut, 
  User, 
  ChevronDown 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function UserProfileMenu() {
  const { user, profile, isAuthenticated, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openAuth = (mode) => {
    const target = mode === 'register' ? '/register' : mode === 'forgot' ? '/forgot' : '/login';
    setDropdownOpen(false);
    navigate(target);
  };

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await signOut();
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const displayRole = profile?.role || user?.user_metadata?.role || 'user';
  const initial = displayName.charAt(0).toUpperCase();

  const roleStyles = {
    admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    recruiter: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    user: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 pr-6">
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="relative pr-6" ref={dropdownRef}>
      {isAuthenticated && user ? (
        <>
          {/* Authenticated User Button */}
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 pl-2.5 pr-3 rounded-full bg-white/70 dark:bg-gray-800/70 hover:bg-white dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-xs backdrop-blur-md transition-all duration-150"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-gray-900 to-gray-700 text-white flex items-center justify-center text-xs font-semibold shadow-xs">
              {initial}
            </div>
            <div className="text-left hidden sm:block">
              <span className="block text-xs font-semibold text-gray-800 dark:text-gray-200 leading-tight">
                {displayName}
              </span>
              <span className="block text-[10px] text-gray-500 dark:text-gray-400 capitalize">
                {displayRole}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500 transition-transform duration-150" />
          </button>

          {/* User Dropdown Menu */}
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-6 mt-2 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 py-2 z-200"
              >
                {/* User Header */}
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {displayName}
                    </p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize ${roleStyles[displayRole] || roleStyles.user}`}>
                      {displayRole}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {user.email}
                  </p>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate('/profile');
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2.5 transition"
                  >
                    <User className="w-4 h-4 text-gray-400" />
                    Manage Profile
                  </button>

                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-2 text-left text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2.5 transition"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        /* Guest Buttons */
        <div className="flex items-center gap-2">
          <button
            onClick={() => openAuth('login')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-2xs backdrop-blur-md transition duration-150"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            onClick={() => openAuth('register')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-gray-900 hover:bg-black dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 rounded-xl shadow-xs transition duration-150"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register</span>
          </button>
        </div>
      )}
    </div>
  );
}

