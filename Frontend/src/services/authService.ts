import { User, AccountType, BuyerRole, ProviderType, AvailabilityStatus } from '../types';
import apiClient, { setStoredToken, getStoredToken, TOKEN_KEY, USER_KEY } from './apiClient';

interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    phone?: string;
    role: 'buyer' | 'provider' | 'admin';
    buyerType?: string;
    buyer_type?: string;
    providerType?: string;
    provider_type?: string;
    businessName?: string;
    business_name?: string;
    institutionName?: string;
    institution_name?: string;
    projectName?: string;
    project_name?: string;
    projectDescription?: string;
    project_description?: string;
    isVerified?: boolean;
    is_verified?: boolean;
  };
  token: string;
}

function mapBackendUserToFrontendUser(backendUser: any): User {
  const role: AccountType = backendUser.role || backendUser.accountType || 'buyer';
  const buyerType = backendUser.buyerType || backendUser.buyer_type;
  const buyerRole: BuyerRole =
    buyerType === 'client'
      ? 'Client'
      : buyerType === 'customer'
        ? 'Customer'
        : backendUser.buyerRole || 'Customer';

  // Map backend provider types to frontend format
  const providerTypeMap: Record<string, ProviderType> = {
    'manufacturer_wholesaler': 'Manufacturer/Wholesaler',
    'retailer_supplier': 'Retailer/Supplier',
    'contractor': 'Contractor',
    'consultant': 'Consultant',
    'freelancer': 'Freelancer',
    'technician': 'Technician',
    'casual_labourer': 'Casual Labourer'
  };

  const backendProviderType = backendUser.providerType || backendUser.provider_type;
  const mappedProviderType = backendProviderType ? providerTypeMap[backendProviderType] : 'Retailer/Supplier';

  return {
    id: backendUser.id || `user-${Date.now()}`,
    name: backendUser.full_name || backendUser.name || backendUser.email?.split('@')[0] || 'User',
    email: backendUser.email || '',
    phone: backendUser.phone || '+255 700 000 000',
    accountType: role,
    buyerRole,
    buyerType: buyerType as 'customer' | 'client' | undefined,
    institutionName: backendUser.institutionName || backendUser.institution_name,
    projectName: backendUser.projectName || backendUser.project_name,
    projectDescription: backendUser.projectDescription || backendUser.project_description,
    providerType: mappedProviderType,
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

  setStoredToken(res.token);

  // Hydrate full profile (buyer_type, institution fields, etc.)
  const fullUser = await getCurrentUser();
  const frontendUser = fullUser || mapBackendUserToFrontendUser(res.user);
  localStorage.setItem(USER_KEY, JSON.stringify(frontendUser));

  return { user: frontendUser, token: res.token };
}

export async function register(
  userData: Omit<User, 'id' | 'createdAt'> & {
    password?: string;
    createdAt?: string;
    buyerType?: 'customer' | 'client';
    institutionName?: string;
    projectName?: string;
    projectDescription?: string;
    availabilityStatus?: AvailabilityStatus;
  }
): Promise<{ user: User; token: string }> {
  const buyerType = userData.buyerType || userData.buyerRole?.toLowerCase();

  // Map frontend provider types to backend format
  const providerTypeMap: Record<string, string> = {
    'Manufacturer/Wholesaler': 'manufacturer_wholesaler',
    'Retailer/Supplier': 'retailer_supplier',
    'Contractor': 'contractor',
    'Consultant': 'consultant',
    'Freelancer': 'freelancer',
    'Technician': 'technician',
    'Casual Labourer': 'casual_labourer'
  };

  const payload: Record<string, unknown> = {
    email: userData.email,
    password: userData.password || '',
    name: userData.name,
    phone: userData.phone || '+255 700 000 000',
    role: userData.accountType,
    buyerType,
    providerType: userData.providerType ? providerTypeMap[userData.providerType] : undefined,
    businessName: userData.businessName || userData.name,
    availabilityStatus: userData.availabilityStatus,
  };

  if (buyerType === 'client') {
    payload.institutionName = userData.institutionName;
    payload.projectName = userData.projectName;
    payload.projectDescription = userData.projectDescription;
  }

  const res = await apiClient.post<AuthResponse>('/api/auth/register', payload);
  setStoredToken(res.token);

  const fullUser = await getCurrentUser();
  const frontendUser = fullUser || mapBackendUserToFrontendUser(res.user);
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
