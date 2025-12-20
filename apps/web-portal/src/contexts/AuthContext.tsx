import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi } from '../lib/api/auth';
import { organizationsApi } from '../lib/api/organizations';
import type { User, Organization } from '../types/database';

const USER_STORAGE_KEY = 'auth_user';

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
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token') || params.get('auth_token');

    if (tokenFromUrl) {
      handleTokenLogin(tokenFromUrl);
    } else {
      checkAuth();
    }
  }, []);

  const loadStoredUser = (): User | null => {
    try {
      const raw = localStorage.getItem(USER_STORAGE_KEY);
      return raw ? JSON.parse(raw) as User : null;
    } catch {
      return null;
    }
  };

  const clearStoredUser = () => {
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  const checkAuth = async () => {
    setLoading(true);
    try {
      if (!authApi.isAuthenticated()) {
        clearStoredUser();
        setUser(null);
        setProfile(null);
        setOrganization(null);
        setLoading(false);
        return;
      }

      const storedUser = loadStoredUser();
      if (storedUser) {
        setUser(storedUser);
        setProfile(storedUser);
      }

      const { user: currentUser, unauthorized } = await authApi.getCurrentUserDetailed({ skipRedirect: true });

      if (unauthorized) {
        authApi.clearSession();
        clearStoredUser();
        setUser(null);
        setProfile(null);
        setOrganization(null);
        return;
      }

      if (currentUser) {
        await setAuthenticatedUser(currentUser);
      } else if (!storedUser) {
        setUser(null);
        setProfile(null);
        setOrganization(null);
      }
    } catch {
      // Preserve stored session on transient failures; clearing happens only on explicit unauthorized responses
    } finally {
      setLoading(false);
    }
  };

  const setAuthenticatedUser = async (authUser: User) => {
    setUser(authUser);
    setProfile(authUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authUser));

    if (authUser.organization_id) {
      try {
        const org = await organizationsApi.getOrganization(authUser.organization_id);
        setOrganization(org);
      } catch {
        setOrganization(null);
      }
    } else {
      setOrganization(null);
    }
  };

  const handleTokenLogin = async (token: string) => {
    setLoading(true);
    try {
      const authenticatedUser = await authApi.authenticateWithToken(token);
      await setAuthenticatedUser(authenticatedUser);
    } catch {
      setUser(null);
      setProfile(null);
      setOrganization(null);
    } finally {
      setLoading(false);
      const url = new URL(window.location.href);
      url.searchParams.delete('token');
      url.searchParams.delete('auth_token');
      window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { user: authUser } = await authApi.login({ email, password });
      await setAuthenticatedUser(authUser);

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
      await setAuthenticatedUser(authUser);
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Registration failed') };
    }
  };

  const signOut = async () => {
    clearStoredUser();
    setUser(null);
    setProfile(null);
    setOrganization(null);
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Failed to revoke session during sign out', error);
    }
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
