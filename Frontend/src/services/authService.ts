import { User, AccountType, BuyerRole, ProviderType } from '../types';
import apiClient, { setStoredToken, getStoredToken, TOKEN_KEY, USER_KEY } from './apiClient';

interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    phone?: string;
    role: 'buyer' | 'provider' | 'admin';
    buyerType?: string;
    providerType?: string;
    businessName?: string;
  };
  token: string;
}

function mapBackendUserToFrontendUser(backendUser: any): User {
  const role: AccountType = backendUser.role || backendUser.accountType || 'buyer';

  return {
    id: backendUser.id || `user-${Date.now()}`,
    name: backendUser.name || backendUser.email?.split('@')[0] || 'User',
    email: backendUser.email || '',
    phone: backendUser.phone || '+255 700 000 000',
    accountType: role,
    buyerRole: backendUser.buyerRole || (backendUser.buyerType as BuyerRole) || 'Customer',
    providerType: backendUser.providerType as ProviderType || 'Retailer/Supplier',
    businessName: backendUser.businessName || backendUser.business_name,
    location: backendUser.location || {
      country: 'Tanzania',
      region: 'Dar es Salaam',
    },
    avatar: backendUser.avatar,
    isVerified: backendUser.isVerified ?? backendUser.is_verified ?? false,
    createdAt: backendUser.createdAt || backendUser.created_at || new Date().toISOString(),
  };
}

export async function login(email: string, password?: string): Promise<{ user: User; token: string }> {
  const res = await apiClient.post<AuthResponse>('/api/auth/login', {
    email,
    password: password || '',
  });

  const frontendUser = mapBackendUserToFrontendUser(res.user);
  setStoredToken(res.token);
  localStorage.setItem(USER_KEY, JSON.stringify(frontendUser));

  return { user: frontendUser, token: res.token };
}

export async function register(
  userData: Omit<User, 'id' | 'createdAt'> & { password?: string; createdAt?: string }
): Promise<{ user: User; token: string }> {
  const payload = {
    email: userData.email,
    password: userData.password || '',
    name: userData.name,
    phone: userData.phone || '+255 700 000 000',
    role: userData.accountType,
    buyerType: userData.buyerRole?.toLowerCase(),
    providerType: userData.providerType,
    businessName: userData.businessName || userData.name,
  };

  const res = await apiClient.post<AuthResponse>('/api/auth/register', payload);
  const frontendUser = mapBackendUserToFrontendUser(res.user);
  setStoredToken(res.token);
  localStorage.setItem(USER_KEY, JSON.stringify(frontendUser));

  return { user: frontendUser, token: res.token };
}

export async function logout(): Promise<void> {
  setStoredToken(null);
  localStorage.removeItem(USER_KEY);
}

export async function getCurrentUser(): Promise<User | null> {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const res = await apiClient.get<{ user: any }>('/api/auth/me');
    if (res && res.user) {
      const user = mapBackendUserToFrontendUser(res.user);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    }
  } catch (err) {
    // Token is invalid or expired — clear local session
    console.warn('Session check failed, clearing local token:', err);
    setStoredToken(null);
    localStorage.removeItem(USER_KEY);
    return null;
  }

  return null;
}

export async function getToken(): Promise<string | null> {
  return getStoredToken();
}

export async function isAuthenticated(): Promise<boolean> {
  const token = getStoredToken();
  return !!token;
}
