import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Shield, Calendar, Database, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function ProfileModal({ isOpen, onClose }) {
  const { user, profile, updateProfile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState({ type: null, message: null });

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setAvatarUrl(profile.avatar_url || '');
    } else if (user) {
      setFullName(user.user_metadata?.full_name || '');
    }
  }, [profile, user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setStatus({ type: null, message: null });

    try {
      await updateProfile({
        full_name: fullName.trim(),
        avatar_url: avatarUrl.trim() || null,
      });
      await refreshProfile();
      setStatus({ type: 'success', message: 'Profile updated in custom users table!' });
      setTimeout(() => {
        setStatus({ type: null, message: null });
      }, 3000);
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  const roleBadgeColors = {
    admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    recruiter: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    user: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  };

  const userRole = profile?.role || user.user_metadata?.role || 'user';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-800 to-gray-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                {(fullName || user.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  Account Profile
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${roleBadgeColors[userRole] || roleBadgeColors.user}`}>
                    {userRole}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Database className="w-3 h-3" /> synced with 'users' table
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="p-6 space-y-4">
            {status.message && (
              <div
                className={`p-3 text-xs rounded-xl flex items-center gap-2 ${
                  status.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                }`}
              >
                {status.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{status.message}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address (Managed by Supabase Auth)
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  disabled
                  value={user.email || ''}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-gray-400" />
                <span>Role: <strong className="text-gray-700 dark:text-gray-200 capitalize">{userRole}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>Joined: {new Date(profile?.created_at || user.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 text-xs font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-black dark:hover:bg-gray-100 rounded-xl transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

