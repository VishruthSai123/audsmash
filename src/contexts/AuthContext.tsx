import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfileAvatar: (newAvatarUrl: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Set timeout to prevent infinite loading (increased to 8 seconds)
    const loadingTimeout = setTimeout(() => {
      if (mounted) {
        console.warn('Auth loading timeout - forcing loading to false');
        setLoading(false);
      }
    }, 8000);

    // Check active sessions and sets the user
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('Error getting session:', error);
        }
        
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Failed to get session:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('Auth state change:', event, 'User:', session?.user?.id);
      
      // Update session and user
      setSession(session);
      setUser(session?.user ?? null);
      
      // Ensure loading is false immediately
      setLoading(false);
      
      // Only create/sync profile on initial sign-in, never on refresh or update
      if (event === 'SIGNED_IN' && session?.user) {
        ensureProfileExists(session.user).catch(error => {
          console.error('Error ensuring profile exists:', error);
        });
      }
      
      // NEVER sync Google avatar on TOKEN_REFRESHED, USER_UPDATED, or INITIAL_SESSION
      // This prevents avatar flipping on page refresh
    });

    return () => {
      mounted = false;
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    try {
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Wait a bit for auth to fully register
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Check if profile already exists
        const { data: existingProfile } = await (supabase as any)
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle();

        // Only create profile if it doesn't exist
        if (!existingProfile) {
          const { error: profileError } = await (supabase as any)
            .from('profiles')
            .insert({
              id: data.user.id,
              username: username,
              avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
              total_weekly_votes: 0
            });

          if (profileError) {
            console.error('Profile creation error:', profileError);
            
            // Check if it's an RLS policy error
            if (profileError.code === '42501') {
              throw new Error(
                'Database policies are not set up correctly. Please run the fix_profile_policy.sql file from the database folder in your Supabase SQL Editor.'
              );
            }
            
            // Ignore duplicate key errors (race condition)
            if (profileError.code !== '23505') {
              throw new Error(`Failed to create profile: ${profileError.message}`);
            }
          }
        } else {
          console.log('Profile already exists, skipping creation');
        }
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const ensureProfileExists = async (user: User) => {
    // Timeout wrapper to prevent hanging
    const profilePromise = (async () => {
      try {
        // Check if profile already exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id, avatar_url, created_at')
          .eq('id', user.id)
          .maybeSingle() as { data: { id: string; avatar_url: string; created_at: string } | null };

        if (!existingProfile) {
          // Generate username from email or user metadata
          const username = 
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split('@')[0] ||
            `user_${user.id.slice(0, 8)}`;

          // Get Google profile picture with better quality
          // Priority: OAuth provider avatar > Dicebear default
          const avatarUrl = 
            user.user_metadata?.avatar_url ||
            user.user_metadata?.picture ||
            (user.identities?.[0]?.identity_data?.avatar_url) ||
            (user.identities?.[0]?.identity_data?.picture) ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

          console.log('Creating profile with avatar:', avatarUrl.substring(0, 50) + '...');

          const { error: profileError } = await (supabase as any)
            .from('profiles')
            .insert({
              id: user.id,
              username: username,
              avatar_url: avatarUrl,
              total_weekly_votes: 0
            });

          if (profileError && profileError.code !== '23505') {
            console.error('Profile creation error:', profileError);
          }
        } else {
          // Profile already exists - only update avatar if using dicebear default AND on initial OAuth login
          // This ensures Google avatars are used initially, but allows users to have custom avatars
          const googleAvatar = 
            user.user_metadata?.avatar_url ||
            user.user_metadata?.picture ||
            (user.identities?.[0]?.identity_data?.avatar_url) ||
            (user.identities?.[0]?.identity_data?.picture);

          // Only update from dicebear to Google avatar ONE TIME (when profile is very new)
          // Check if profile was created very recently (within 5 minutes) - indicates first OAuth login
          if (googleAvatar && existingProfile.avatar_url?.includes('dicebear.com')) {
            const profileCreatedAt = new Date(existingProfile.created_at).getTime();
            const now = new Date().getTime();
            const ageInMinutes = (now - profileCreatedAt) / (1000 * 60);

            // Only auto-update dicebear to Google if profile is less than 5 minutes old
            if (ageInMinutes < 5) {
              console.log('Updating new profile dicebear avatar to Google avatar');
              await (supabase as any)
                .from('profiles')
                .update({ avatar_url: googleAvatar })
                .eq('id', user.id)
                .then(() => console.log('Updated profile with Google avatar'))
                .catch((err: any) => console.error('Failed to update avatar:', err));
            } else {
              console.log('Profile is old, keeping existing dicebear avatar');
            }
          }
          // If already has a Google avatar or custom avatar, never change it on refresh
        }
      } catch (error) {
        console.error('Error ensuring profile exists:', error);
      }
    })();

    // Add timeout - don't wait more than 5 seconds
    const timeout = new Promise((resolve) => setTimeout(resolve, 5000));
    await Promise.race([profilePromise, timeout]);
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const updateProfileAvatar = async (newAvatarUrl: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const { error } = await (supabase as any)
        .from('profiles')
        .update({ avatar_url: newAvatarUrl })
        .eq('id', user.id);

      if (error) throw error;
      console.log('Profile avatar updated successfully');
    } catch (error: any) {
      console.error('Avatar update error:', error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfileAvatar,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
