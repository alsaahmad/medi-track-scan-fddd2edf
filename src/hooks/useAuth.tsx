import { useState, useEffect, createContext, useContext, ReactNode, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'manufacturer' | 'distributor' | 'pharmacy' | 'consumer' | 'admin';

interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  organization: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, organization: string, role: AppRole) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Use ref to track if we're currently fetching to prevent duplicate calls
  const fetchingRef = useRef(false);
  const mountedRef = useRef(true);

  const fetchUserData = useCallback(async (userId: string): Promise<boolean> => {
    // Prevent duplicate fetches
    if (fetchingRef.current) return false;
    fetchingRef.current = true;
    
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }
      
      if (mountedRef.current && profileData) {
        setProfile(profileData);
      }

      // Fetch role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (roleError) {
        console.error('Error fetching role:', roleError);
      }
      
      if (mountedRef.current && roleData) {
        setRole(roleData.role as AppRole);
      }
      
      return true;
    } catch (error) {
      console.error('Error in fetchUserData:', error);
      return false;
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    
    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!mountedRef.current) return;
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          await fetchUserData(currentSession.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    // Initialize auth first
    initializeAuth();

    // Set up auth state listener for future changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mountedRef.current) return;
        
        console.log('Auth state change:', event);
        
        // Update session and user immediately
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user) {
          // For sign in/sign up events, fetch user data
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            // Reset fetching ref to allow new fetch
            fetchingRef.current = false;
            setLoading(true);
            await fetchUserData(newSession.user.id);
            if (mountedRef.current) {
              setLoading(false);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          // Clear user data on sign out
          setProfile(null);
          setRole(null);
          setLoading(false);
        }
      }
    );

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [fetchUserData]);

  const signUp = async (email: string, password: string, name: string, organization: string, userRole: AppRole) => {
    const redirectUrl = `${window.location.origin}/`;
    
    // Set loading before signup
    setLoading(true);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { name, organization }
      }
    });

    if (error) {
      setLoading(false);
      return { error };
    }

    // If signup successful, add role and update profile
    if (data.user) {
      try {
        // Update profile with organization (trigger creates initial profile)
        await supabase
          .from('profiles')
          .update({ name, organization })
          .eq('user_id', data.user.id);

        // Add user role
        await supabase
          .from('user_roles')
          .insert({ user_id: data.user.id, role: userRole });
        
        // Reset fetch ref and fetch user data
        fetchingRef.current = false;
        await fetchUserData(data.user.id);
      } catch (err) {
        console.error('Error setting up user profile:', err);
      }
    }
    
    // Note: Don't set loading to false here - onAuthStateChange will handle it
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
    }
    // Note: Don't set loading to false on success - onAuthStateChange will handle it
    return { error };
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setProfile(null);
    setRole(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      profile, 
      role, 
      loading, 
      signUp, 
      signIn, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
