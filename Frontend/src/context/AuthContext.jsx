import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [configured] = useState(isSupabaseConfigured());

  // Fetch or sync the profile from custom 'users' table
  const fetchProfile = useCallback(async (currentUser) => {
    if (!currentUser) {
      setProfile(null);
      return null;
    }

    try {
      let customProfile = await authService.getUserProfile(currentUser.id);
      // If trigger hasn't created the user record yet, ensure it exists
      if (!customProfile) {
        customProfile = await authService.ensureUserProfile(currentUser);
      }
      setProfile(customProfile);
      return customProfile;
    } catch (err) {
      console.error('Error fetching profile from users table:', err);
      // Fallback to basic auth metadata so UI remains operational
      const fallback = {
        id: currentUser.id,
        email: currentUser.email,
        full_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0],
        role: currentUser.user_metadata?.role || 'user',
      };
      setProfile(fallback);
      return fallback;
    }
  }, []);

  // Listen to Supabase Auth State changes and sync sessions
  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!isMounted) return;
      setSession(initialSession);
      const currentUser = initialSession?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        fetchProfile(currentUser).finally(() => {
          if (isMounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // 2. Subscribe to auth changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      const currentUser = newSession?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await fetchProfile(currentUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [configured, fetchProfile]);

  const signUp = useCallback(async (params) => {
    const data = await authService.signUp(params);
    if (data?.user) {
      setUser(data.user);
      await fetchProfile(data.user);
    }
    return data;
  }, [fetchProfile]);

  const signIn = useCallback(async (params) => {
    const data = await authService.signIn(params);
    if (data?.user) {
      setUser(data.user);
      setSession(data.session);
      await fetchProfile(data.user);
    }
    return data;
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    await authService.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  }, []);

  const resetPassword = useCallback(async (email) => {
    return authService.resetPassword(email);
  }, []);

  const updateProfile = useCallback(async (updates) => {
    if (!user) throw new Error('No authenticated user');
    const updated = await authService.updateUserProfile(user.id, updates);
    setProfile(updated);
    return updated;
  }, [user]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      return await fetchProfile(user);
    }
    return null;
  }, [user, fetchProfile]);

  const value = useMemo(() => {
    const role = profile?.role || user?.user_metadata?.role || 'user';
    return {
      user,
      session,
      profile,
      role,
      isAuthenticated: Boolean(user),
      isAdmin: role === 'admin',
      isRecruiter: role === 'recruiter',
      loading,
      isConfigured: configured,
      signUp,
      signIn,
      signOut,
      resetPassword,
      updateProfile,
      refreshProfile,
    };
  }, [user, session, profile, loading, configured, signUp, signIn, signOut, resetPassword, updateProfile, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

