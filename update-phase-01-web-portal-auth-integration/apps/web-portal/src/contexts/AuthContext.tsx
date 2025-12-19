import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi } from '../lib/api/auth';
import { organizationsApi } from '../lib/api/organizations';
import type { User, Organization } from '../types/database';

interface AuthContextType {
  user: User | null;
  profile: User | null;
  organization: Organization | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isSuperAdmin: boolean;
  isOrgAdmin: boolean;
  canManage: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (!authApi.isAuthenticated()) {
        setLoading(false);
        return;
      }

      const currentUser = await authApi.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setProfile(currentUser);

        if (currentUser.organization_id) {
          try {
            const org = await organizationsApi.getOrganization(currentUser.organization_id);
            setOrganization(org);
          } catch {
          }
        }
      }
    } catch {
      setUser(null);
      setProfile(null);
      setOrganization(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { user: authUser } = await authApi.login({ email, password });
      setUser(authUser);
      setProfile(authUser);

      if (authUser.organization_id) {
        try {
          const org = await organizationsApi.getOrganization(authUser.organization_id);
          setOrganization(org);
        } catch {
        }
      }

      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Login failed') };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { user: authUser } = await authApi.register({
        email,
        password,
        password_confirmation: password,
        name,
      });
      setUser(authUser);
      setProfile(authUser);
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Registration failed') };
    }
  };

  const signOut = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout failures; token will be cleared client-side
    }
    setUser(null);
    setProfile(null);
    setOrganization(null);
    window.location.replace('/login');
  };

  const isSuperAdmin = profile?.role === 'super_admin';
  const isOrgAdmin = profile?.role === 'org_owner' || profile?.role === 'org_admin';
  const canManage = isSuperAdmin || isOrgAdmin;

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      organization,
      loading,
      signIn,
      signUp,
      signOut,
      isSuperAdmin,
      isOrgAdmin,
      canManage,
    }}>
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
