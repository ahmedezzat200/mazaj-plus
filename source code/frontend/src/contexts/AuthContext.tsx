import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../lib/api';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  tier: string;
  subscription_status: string;
  onboarding_complete: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: any) => Promise<any>;
  register: (data: any) => Promise<any>;
  logout: () => Promise<any>;
  refreshUser: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    setLoading(true);
    try {
      const response = await api.get('/auth/me/');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data.user) {
          const userData = data.data.user;
          setUser(userData);
          return userData;
        } else {
          setUser(null);
          return null;
        }
      } else {
        setUser(null);
        return null;
      }
    } catch (error) {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (credentials: any) => {
    const response = await api.post('/auth/login/', credentials);
    const result = await response.json();
    if (result.success) {
      await refreshUser();
    }
    return result;
  };

  const register = async (userData: any) => {
    const response = await api.post('/auth/register/', userData);
    const result = await response.json();
    if (result.success) {
      await refreshUser();
    }
    return result;
  };

  const logout = async () => {
    const response = await api.post('/auth/logout/', {});
    if (response.ok) {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
