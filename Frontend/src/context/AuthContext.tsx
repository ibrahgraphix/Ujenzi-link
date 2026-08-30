import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AccountType, ProviderType, BuyerRole, LocationHierarchy } from '../types';
import { MOCK_USERS } from '../data/mockData';
import { api } from '../services/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loginAs: (role: 'buyer' | 'provider' | 'admin') => void;
  login: (email: string, password?: string) => boolean | Promise<boolean>;
  signUp: (userData: Omit<User, 'id' | 'createdAt'>) => void | Promise<boolean>;
  signup: (userData: Omit<User, 'id' | 'createdAt'>) => void | Promise<boolean>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  favorites: string[];
  isFavorite: (listingId: string) => boolean;
  toggleFavorite: (listingId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'ujenzi_current_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // Default to Buyer user for interactive ease
    return MOCK_USERS[0];
  });

  const [favorites, setFavorites] = useState<string[]>([]);
  const { success, info } = useToast();

  useEffect(() => {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      api.getFavorites(user.id).then(setFavorites);
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
      setFavorites([]);
    }
  }, [user]);

  const loginAs = (role: 'buyer' | 'provider' | 'admin') => {
    let targetUser: User;
    if (role === 'provider') {
      targetUser = MOCK_USERS[1];
    } else if (role === 'admin') {
      targetUser = MOCK_USERS[2];
    } else {
      targetUser = MOCK_USERS[0];
    }
    setUser(targetUser);
    success(`Switched role to ${targetUser.name} (${targetUser.accountType.toUpperCase()})`, 'Demo Profile Activated');
  };

  const login = (email: string, _password?: string): boolean => {
    const found = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setUser(found);
      success(`Welcome back, ${found.name}!`, 'Signed In');
      return true;
    }
    // Create new temporary user if email not found
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: email.split('@')[0],
      email,
      phone: '+255 700 000 000',
      accountType: 'buyer',
      buyerRole: 'Developer',
      location: {
        country: 'Tanzania',
        region: 'Dar es Salaam',
      },
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUser(newUser);
    success(`Welcome to Ujenzi Link, ${newUser.name}!`, 'Account Created');
    return true;
  };

  const signUp = (userData: Omit<User, 'id' | 'createdAt'>): boolean => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUser(newUser);
    success(`Account created successfully as ${newUser.accountType === 'provider' ? newUser.providerType : newUser.buyerRole}!`, 'Welcome');
    return true;
  };

  const logout = () => {
    setUser(null);
    info('You have been signed out.');
  };

  const updateUser = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    success('Your profile settings have been updated.');
  };

  const isFavorite = (listingId: string) => favorites.includes(listingId);

  const toggleFavorite = async (listingId: string) => {
    if (!user) {
      info('Please sign in or select a demo role to bookmark listings.');
      return;
    }
    const updated = await api.toggleFavorite(user.id, listingId);
    setFavorites(updated);
    if (updated.includes(listingId)) {
      success('Listing added to your saved favorites!');
    } else {
      info('Listing removed from saved favorites.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loginAs,
        login,
        signUp,
        signup: signUp,
        logout,
        updateUser,
        favorites,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
