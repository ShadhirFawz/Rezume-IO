import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

/**
 * Service handling all Supabase Authentication and custom 'users' table interactions.
 */
export const authService = {
  /**
   * Register a new user with Supabase Auth and initialize their custom 'users' profile
   */
  async signUp({ email, password, fullName, role = 'user' }) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please add your credentials to .env.local');
    }

    // 1. Sign up user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    });

    if (authError) throw authError;

    // 2. Fallback upsert into the custom 'users' table in case the Supabase database trigger
    // has not been executed yet in the Supabase Table Editor.
    if (authData?.user) {
      try {
        await this.ensureUserProfile(authData.user, {
          full_name: fullName,
          role,
        });
      } catch (profileError) {
        console.warn('Note: Profile creation in public.users fallback:', profileError.message);
      }
    }

    return authData;
  },

  /**
   * Sign in an existing user with email and password
   */
  async signIn({ email, password }) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please add your credentials to .env.local');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign out the currently active user session
   */
  async signOut() {
    if (!isSupabaseConfigured()) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Send a password reset email
   */
  async resetPassword(email) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please add your credentials to .env.local');
    }

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Fetch current active session
   */
  async getSession() {
    if (!isSupabaseConfigured()) return null;
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  /**
   * Fetch the custom user profile from the separate 'users' table
   */
  async getUserProfile(userId) {
    if (!isSupabaseConfigured() || !userId) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.warn('Error fetching custom profile from users table:', error.message);
      return null;
    }

    return data;
  },

  /**
   * Ensure user record exists in the separate 'users' table
   */
  async ensureUserProfile(user, metadata = {}) {
    if (!isSupabaseConfigured() || !user) return null;

    const fullName = metadata.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
    const role = metadata.role || user.user_metadata?.role || 'user';

    const { data, error } = await supabase
      .from('users')
      .upsert(
        {
          id: user.id,
          email: user.email,
          full_name: fullName,
          role,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
      .select()
      .maybeSingle();

    if (error) {
      console.warn('ensureUserProfile notice:', error.message);
    }
    return data;
  },

  /**
   * Update fields in the custom 'users' table
   */
  async updateUserProfile(userId, updates) {
    if (!isSupabaseConfigured() || !userId) {
      throw new Error('Supabase is not configured or user is invalid.');
    }

    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export default authService;

