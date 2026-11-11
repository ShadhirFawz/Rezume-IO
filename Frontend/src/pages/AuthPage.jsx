import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  X,
  Mail,
  Lock,
  User,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  ArrowRight,
  Briefcase,
  Home,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function AuthPage({ mode: initialMode = 'login' }) {
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword, isConfigured, isAuthenticated, loading } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
  });
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    setMode(initialMode);
    setError(null);
    setSuccessMessage(null);
  }, [initialMode]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950">
        <div className="w-8 h-8 border-2 border-gray-900 dark:border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!isConfigured) {
      setError('Supabase is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your local .env.local file.');
      return;
    }

    setPageLoading(true);

    try {
      if (mode === 'login') {
        await signIn({
          email: formData.email.trim(),
          password: formData.password,
        });
        setSuccessMessage('Successfully signed in!');
        setTimeout(() => navigate('/'), 500);
      } else if (mode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }

        const data = await signUp({
          email: formData.email.trim(),
          password: formData.password,
          fullName: formData.fullName.trim(),
          role: formData.role,
        });

        if (data?.session) {
          setSuccessMessage('Account created and signed in successfully!');
          setTimeout(() => navigate('/'), 700);
        } else {
          setSuccessMessage('Account created! Please check your email to confirm your account (if email confirmation is enabled in your Supabase project).');
        }
      } else if (mode === 'forgot') {
        await resetPassword(formData.email.trim());
        setSuccessMessage('Password reset instructions have been sent to your email.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setPageLoading(false);
    }
  };

  const stepTitle = mode === 'login' ? 'Sign in to RezumeIO' : mode === 'register' ? 'Create your Account' : 'Reset Password';
  const stepSubtitle = mode === 'login'
    ? 'Access your resume analyses and job match histories'
    : mode === 'register'
      ? 'Join RezumeIO to store and track your career profiles'
      : 'Enter your email to receive recovery instructions';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 via-white to-slate-300 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition"
        >
          <Home className="w-4 h-4" />
          Back to home
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                {stepTitle}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stepSubtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!isConfigured && (
            <div className="mx-6 mt-4 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 dark:text-amber-300">
                <span className="font-semibold block mb-0.5">Supabase credentials required</span>
                Create or fill in your <code className="bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded font-mono">Frontend/.env.local</code> file with your Supabase Project URL and Anon Key.
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 text-xs bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-xl flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 rounded-xl flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </motion.div>
            )}

            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Jane Doe"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-300 focus:outline-none dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Role / Account Type</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-300 focus:outline-none dark:text-white"
                    >
                      <option value="user">Candidate / Job Seeker</option>
                      <option value="recruiter">Recruiter / HR Manager</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-300 focus:outline-none dark:text-white"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setError(null);
                        setSuccessMessage(null);
                      }}
                      className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 transition underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2 text-sm bg-gray-50 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-300 focus:outline-none dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-300 focus:outline-none dark:text-white"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={pageLoading}
              className="w-full mt-2 py-2.5 px-4 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white font-medium text-sm rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pageLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 dark:border-gray-900/30 border-t-white dark:border-t-gray-900 rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' && 'Sign In'}
                  {mode === 'register' && 'Create Account'}
                  {mode === 'forgot' && 'Send Reset Link'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 text-center text-xs text-gray-600 dark:text-gray-400">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="font-semibold text-gray-900 dark:text-white hover:underline"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="font-semibold text-gray-900 dark:text-white hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
