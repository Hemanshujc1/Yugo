import React, { createContext, useContext, useState } from 'react';

export interface User {
  id: string;
  name: string;
  phone: string;
  shopName: string;
  role: 'shopkeeper' | 'admin';
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (phone?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  const login = (phone?: string) => {
    setUser({
      id: 'usr_shop_01',
      name: 'Demo Shopkeeper',
      phone: phone || '+91 98765 43210',
      shopName: 'Yugo Supermart',
      role: 'shopkeeper',
    });
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
