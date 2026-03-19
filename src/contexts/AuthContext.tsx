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

const VALID_OFFICER_IDS = [
  'ESW-001', 'ESW-002', 'ESW-003', 'ESW-004', 'ESW-005',
  'ESW-006', 'ESW-007', 'ESW-008', 'ESW-009', 'ESW-010'
];
const VALID_RESIDENTS = [
  { username: 'demo_user', password: 'demo_pass' },
  { username: 'citizen', password: '123456' },
  { username: 'enugu_res01', password: 'password01' },
  { username: 'enugu_res02', password: 'password02' },
  { username: 'enugu_res03', password: 'password03' },
  { username: 'enugu_res04', password: 'password04' },
  { username: 'enugu_res05', password: 'password05' },
  { username: 'enugu_res06', password: 'password06' },
  { username: 'enugu_res07', password: 'password07' },
  { username: 'enugu_res08', password: 'password08' },
  { username: 'enugu_res09', password: 'password09' },
  { username: 'enugu_res10', password: 'password10' },
];


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const loginAsOfficer = (officerId: string) => {
    if (VALID_OFFICER_IDS.includes(officerId)) {
      setUser({ id: officerId, role: 'officer', name: `Officer ${officerId}` });
      return true;
    }
    return false;
  };

  const loginAsResident = (username: string, password: string) => {
    const resident = VALID_RESIDENTS.find(
      (r) => r.username === username && r.password === password
    );
    if (resident) {
      setUser({ id: username, role: 'resident', name: 'Resident User' });
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
