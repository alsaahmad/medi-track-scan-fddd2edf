import { useState, useEffect, createContext, useContext, ReactNode, useRef } from 'react';
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

// Fallback role for demo - used when DB profile is unavailable
const FALLBACK_ROLE: AppRole = 'pharmacy';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  
  const mountedRef = useRef(true);
  // Store the selected role during signup for fallback
  const pendingRoleRef = useRef<AppRole | null>(null);

  // Non-blocking profile fetch - runs in background
  const fetchUserDataInBackground = (userId: string) => {
    // Use setTimeout to ensure this is non-blocking
    setTimeout(async () => {
      try {
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (mountedRef.current && profileData) {
          setProfile(profileData);
        }

        // Fetch role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (mountedRef.current && roleData?.role) {
          console.log('Role fetched from DB:', roleData.role);
          setRole(roleData.role as AppRole);
          pendingRoleRef.current = null;
        }
      } catch (error) {
        console.error('Background profile fetch error:', error);
      }
    }, 0);
  };

  useEffect(() => {
    mountedRef.current = true;
    
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!mountedRef.current) return;
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // Quick role check - with 1 second max wait
          const rolePromise = supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', currentSession.user.id)
            .maybeSingle();
          
          const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1000));
          
          const result = await Promise.race([rolePromise, timeoutPromise]);
          
          if (mountedRef.current) {
            if (result && 'data' in result && result.data?.role) {
              setRole(result.data.role as AppRole);
            } else {
              console.log('Role fetch timeout or empty, using fallback:', FALLBACK_ROLE);
              setRole(FALLBACK_ROLE);
            }
          }
          
          // Fetch full profile in background
          fetchUserDataInBackground(currentSession.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Use fallback on error
        if (mountedRef.current && user) {
          setRole(FALLBACK_ROLE);
        }
      } finally {
        // ALWAYS set loading to false
        if (mountedRef.current) {
          console.log('Auth init complete - loading = false');
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!mountedRef.current) return;
        
        console.log('Auth state change:', event);
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (event === 'SIGNED_IN' && newSession?.user) {
          // Use pending role from signup, or fallback
          const effectiveRole = pendingRoleRef.current || role || FALLBACK_ROLE;
          console.log('SIGNED_IN - using role:', effectiveRole);
          setRole(effectiveRole);
          setLoading(false);
          // Fetch real data in background
          fetchUserDataInBackground(newSession.user.id);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setRole(null);
          pendingRoleRef.current = null;
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED') {
          // Just refresh data in background
          if (newSession?.user) {
            fetchUserDataInBackground(newSession.user.id);
          }
        }
      }
    );

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, name: string, organization: string, userRole: AppRole) => {
    // Store the selected role BEFORE signup for immediate use
    pendingRoleRef.current = userRole;
    setRole(userRole); // Set role immediately for instant dashboard access
    
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { name, organization }
      }
    });

    if (error) {
      pendingRoleRef.current = null;
      setRole(null);
      return { error };
    }

    // Set loading false immediately - don't wait for DB
    setLoading(false);

    // Insert profile and role in background (non-blocking)
    if (data.user) {
      const userId = data.user.id;
      setTimeout(async () => {
        try {
          await supabase.from('profiles').upsert({ 
            user_id: userId, 
            email, 
            name, 
            organization 
          }, { onConflict: 'user_id' });
          
          await supabase.from('user_roles').insert({ 
            user_id: userId, 
            role: userRole 
          });
          
          console.log('Profile and role saved to DB');
        } catch (err) {
          console.error('Background DB insert error:', err);
        }
      }, 100);
    }
    
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { error };
    }
    return { error: null };
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setProfile(null);
    setRole(null);
    pendingRoleRef.current = null;
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
