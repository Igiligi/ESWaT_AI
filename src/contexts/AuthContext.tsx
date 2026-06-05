import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type Role = 'officer' | 'resident' | null;

interface User {
  id: string;
  role: Role;
  name?: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  loginAsOfficer: (officerId: string) => boolean;
  loginAsResident: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple authentication - single officer password and single resident account
const OFFICER_PASSWORD = '123';
const RESIDENT_USERNAME = 'resident';
const RESIDENT_PASSWORD = '123';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const loginAsOfficer = (officerId: string) => {
    if (officerId === OFFICER_PASSWORD) {
      setUser({ id: 'officer', role: 'officer', name: 'Waste Officer' });
      return true;
    }
    return false;
  };

  const loginAsResident = (username: string, password: string) => {
    if (username === RESIDENT_USERNAME && password === RESIDENT_PASSWORD) {
      setUser({ id: username, role: 'resident', name: 'Citizen User' });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginAsOfficer, loginAsResident, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};