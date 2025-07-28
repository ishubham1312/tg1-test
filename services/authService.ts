import { supabase } from '../lib/supabase';
import { User } from '../types';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  initials: string;
}

export class AuthService {
  // Sign up with email and password
  static async signUp(email: string, password: string, name: string): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const initials = name.trim().split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'TU';
      
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            initials
          }
        }
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        const user: AuthUser = {
          id: data.user.id,
          email: data.user.email!,
          name: name.trim(),
          initials
        };
        return { user, error: null };
      }

      return { user: null, error: 'Failed to create user' };
    } catch (error) {
      return { user: null, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  }

  // Sign in with email and password
  static async signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        // Get profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError || !profile) {
          return { user: null, error: 'Failed to load user profile' };
        }

        const user: AuthUser = {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          initials: profile.initials
        };
        return { user, error: null };
      }

      return { user: null, error: 'Failed to sign in' };
    } catch (error) {
      return { user: null, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  }

  // Sign in with Google
  static async signInWithGoogle(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`
        }
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  }

  // Sign out
  static async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error: error.message };
      }
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      // Get profile data
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !profile) return null;

      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        initials: profile.initials
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Update user profile
  static async updateProfile(userId: string, updates: { name?: string; initials?: string }): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  }

  // Listen to auth state changes
  static onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await this.getCurrentUser();
        callback(user);
      } else {
        callback(null);
      }
    });
  }
}