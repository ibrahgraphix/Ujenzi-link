import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { getFavorites, toggleFavorite as toggleFavoriteApi } from '../services/usersService';
import * as authService from '../services/authService';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loginAs: (role: 'buyer' | 'provider' | 'admin') => void;
  login: (email: string, password?: string) => Promise<boolean>;
  signUp: (userData: Omit<User, 'id' | 'createdAt'> & { password?: string }) => Promise<boolean>;
  signup: (userData: Omit<User, 'id' | 'createdAt'> & { password?: string }) => Promise<boolean>;
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
    return null;
  });

  const [favorites, setFavorites] = useState<string[]>([]);
  const { success, info, error } = useToast();

  useEffect(() => {
    // Sync current auth state from backend or local token
    authService.getCurrentUser().then((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      }
    });

    const handleUnauthorized = () => {
      setUser(null);
      localStorage.removeItem(CURRENT_USER_KEY);
      error('Session expired. Please log in again.', 'Authentication Error');
    };

    window.addEventListener('ujenzi:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('ujenzi:unauthorized', handleUnauthorized);
    };
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      getFavorites(user.id).then(setFavorites);
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
      setFavorites([]);
    }
  }, [user]);

  const loginAs = (role: 'buyer' | 'provider' | 'admin') => {
    let targetUser: User;
    if (role === 'provider') {
      targetUser = {
        id: 'user-provider-1',
        name: 'Plan Moja Contractors',
        email: 'info@planmoja.co.tz',
        phone: '+255 755 890 123',
        accountType: 'provider',
        providerType: 'Contractor',
        businessName: 'Plan Moja Construction Co. Ltd',
        location: { country: 'Tanzania', region: 'Dar es Salaam', district: 'Kinondoni' },
        createdAt: new Date().toISOString(),
      };
    } else if (role === 'admin') {
      targetUser = {
        id: 'user-admin-1',
        name: 'Ujenzi Link Admin',
        email: 'admin@ujenzilink.co.tz',
        phone: '+255 711 000 999',
        accountType: 'admin',
        location: { country: 'Tanzania', region: 'Dar es Salaam' },
        createdAt: new Date().toISOString(),
      };
    } else {
      targetUser = {
        id: 'user-buyer-1',
        name: 'Baraka Mwambapa',
        email: 'baraka@gmail.com',
        phone: '+255 712 345 678',
        accountType: 'buyer',
        buyerRole: 'Developer',
        location: { country: 'Tanzania', region: 'Dar es Salaam', district: 'Kinondoni' },
        createdAt: new Date().toISOString(),
      };
    }
    setUser(targetUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(targetUser));
    success(`Switched role to ${targetUser.name} (${targetUser.accountType.toUpperCase()})`, 'Profile Activated');
  };

  const login = async (email: string, password?: string): Promise<boolean> => {
    try {
      const res = await authService.login(email, password);
      setUser(res.user);
      success(`Welcome back, ${res.user.name}!`, 'Signed In');
      return true;
    } catch (err: any) {
      error(err.message || 'Login failed. Please check your credentials.');
      return false;
    }
  };

  const signUp = async (userData: Omit<User, 'id' | 'createdAt'> & { password?: string }): Promise<boolean> => {
    try {
      const res = await authService.register(userData);
      setUser(res.user);
      success(`Account created successfully as ${res.user.name}!`, 'Welcome');
      return true;
    } catch (err: any) {
      error(err.message || 'Registration failed.');
      return false;
    }
  };

  const logout = async () => {
    await authService.logout();
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
      info('Please sign in to bookmark listings.');
      return;
    }
    const updated = await toggleFavoriteApi(user.id, listingId);
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
