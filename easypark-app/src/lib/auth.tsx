'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from './types';
import { DEMO_USERS } from './mockData';

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => { success: boolean; error?: string };
  loginAsRole: (role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const ROLE_EMAILS: Record<UserRole, string> = {
  customer: 'customer@easypark.lk',
  owner: 'owner@easypark.lk',
  operator: 'operator@easypark.lk',
  government: 'government@easypark.lk',
  checker: 'checker@easypark.lk',
  admin: 'admin@easypark.lk',
};

const ROLE_REDIRECTS: Record<UserRole, string> = {
  customer: '/dashboard',
  owner: '/owner',
  operator: '/operator',
  government: '/government',
  checker: '/government-checker',
  admin: '/admin',
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  login: () => ({ success: false }),
  loginAsRole: () => {},
  logout: () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('easypark_user');
      if (stored) setUser(JSON.parse(stored));
    } catch {} finally {
      setRestored(true);
    }
  }, []);

  const login = (email: string, password: string) => {
    if (password !== 'demo123') return { success: false, error: 'Invalid password. Use demo123' };
    const found = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) return { success: false, error: 'No demo account found for this email.' };
    setUser(found);
    localStorage.setItem('easypark_user', JSON.stringify(found));
    return { success: true };
  };

  const loginAsRole = (role: UserRole) => {
    const email = ROLE_EMAILS[role];
    const found = DEMO_USERS.find(u => u.email === email);
    if (found) {
      setUser(found);
      localStorage.setItem('easypark_user', JSON.stringify(found));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('easypark_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, loginAsRole, logout, isAuthenticated: !!user || !restored }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export { ROLE_REDIRECTS };
