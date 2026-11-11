import { useAuth } from '../../hooks/useAuth';
import { ShieldAlert, Lock } from 'lucide-react';

export default function ProtectedRoute({ 
  children, 
  requiredRole = null, 
  fallback = null 
}) {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    if (fallback) return fallback;

    return (
      <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          Authentication Required
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Please sign in or create an account to access this feature.
        </p>
      </div>
    );
  }

  if (requiredRole && role !== requiredRole && role !== 'admin') {
    return (
      <div className="p-8 text-center bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800 shadow-sm">
        <ShieldAlert className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
          Access Restricted
        </h3>
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
          This feature requires a <span className="font-semibold capitalize">{requiredRole}</span> account. Your current role is <span className="font-semibold capitalize">{role}</span>.
        </p>
      </div>
    );
  }

  return children;
}

