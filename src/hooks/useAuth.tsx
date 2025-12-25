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

  const fetchUserData = useCallback(async (userId: string): Promise<{ hasProfile: boolean; hasRole: boolean }> => {
    // Prevent duplicate fetches
    if (fetchingRef.current) return { hasProfile: false, hasRole: false };
    fetchingRef.current = true;
    
    let hasProfile = false;
    let hasRole = false;
    
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
      
      if (mountedRef.current) {
        setProfile(profileData);
        hasProfile = !!profileData;
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
      
      if (mountedRef.current) {
        setRole(roleData?.role as AppRole ?? null);
        hasRole = !!roleData;
      }
      
      return { hasProfile, hasRole };
    } catch (error) {
      console.error('Error in fetchUserData:', error);
      return { hasProfile: false, hasRole: false };
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
          // For sign in events only (NOT signup - that's handled in signUp function)
          if (event === 'SIGNED_IN') {
            // Check if we're already handling signup flow
            if (!fetchingRef.current) {
              setLoading(true);
              fetchingRef.current = false; // Reset to allow fetch
              await fetchUserData(newSession.user.id);
              // CRITICAL: Always resolve loading
              if (mountedRef.current) {
                setLoading(false);
              }
            }
          } else if (event === 'TOKEN_REFRESHED') {
            // Token refresh - just update data silently
            fetchingRef.current = false;
            await fetchUserData(newSession.user.id);
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

    // If signup successful, CREATE profile and role (don't rely on triggers)
    if (data.user) {
      try {
        // Wait a moment for the auth trigger to create initial profile
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Upsert profile - create if doesn't exist, update if it does
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({ 
            user_id: data.user.id, 
            email: email,
            name, 
            organization 
          }, { 
            onConflict: 'user_id' 
          });
        
        if (profileError) {
          console.error('Error creating profile:', profileError);
        }

        // Insert user role (use insert with error handling for duplicates)
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ user_id: data.user.id, role: userRole });
        
        if (roleError && !roleError.message.includes('duplicate')) {
          console.error('Error creating role:', roleError);
        }
        
        // Reset fetch ref and fetch user data
        fetchingRef.current = false;
        await fetchUserData(data.user.id);
        
        // CRITICAL: Always set loading to false after signup completes
        if (mountedRef.current) {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error setting up user profile:', err);
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    } else {
      setLoading(false);
    }
    
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
