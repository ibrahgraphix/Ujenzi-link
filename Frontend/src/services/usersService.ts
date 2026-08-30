import { User } from '../types';
import apiClient from './apiClient';

const STORAGE_KEY_USERS = 'ujenzi_users_v1';
const STORAGE_KEY_FAVORITES = 'ujenzi_favorites_v1';

function mapBackendUser(u: any): User {
  return {
    id: u.id || `user-${Date.now()}`,
    name: u.name || u.email?.split('@')[0] || 'User',
    email: u.email || '',
    phone: u.phone || '+255 700 000 000',
    accountType: u.role || u.accountType || 'buyer',
    buyerRole: u.buyerType || u.buyerRole || 'Customer',
    providerType: u.providerType || 'Retailer/Supplier',
    businessName: u.businessName || u.business_name,
    location: u.location || { country: 'Tanzania', region: 'Dar es Salaam' },
    createdAt: u.created_at || u.createdAt || new Date().toISOString(),
  };
}

export async function getUsers(): Promise<User[]> {
  try {
    const res = await apiClient.get<any[]>('/api/admin/users');
    const items = Array.isArray(res) ? res : (res as any)?.users || (res as any)?.data || [];
    if (Array.isArray(items)) {
      return items.map(mapBackendUser);
    }
  } catch (err) {
    console.warn('Failed to fetch users from admin API:', err);
  }

  try {
    const item = localStorage.getItem(STORAGE_KEY_USERS);
    if (item) return JSON.parse(item);
  } catch {
    // fallback
  }

  return [];
}

export async function deactivateUser(userId: string): Promise<boolean> {
  try {
    await apiClient.put(`/api/admin/users/${userId}/deactivate`);
    return true;
  } catch (err) {
    console.warn(`Failed to deactivate user ${userId} via API:`, err);
    return false;
  }
}

export async function reactivateUser(userId: string): Promise<boolean> {
  try {
    await apiClient.put(`/api/admin/users/${userId}/reactivate`);
    return true;
  } catch (err) {
    console.warn(`Failed to reactivate user ${userId} via API:`, err);
    return false;
  }
}

export async function getFavorites(userId: string): Promise<string[]> {
  try {
    const item = localStorage.getItem(STORAGE_KEY_FAVORITES);
    if (item) {
      const favMap = JSON.parse(item);
      return favMap[userId] || [];
    }
  } catch {
    // fallback
  }
  return [];
}

export async function toggleFavorite(userId: string, listingId: string): Promise<string[]> {
  let favMap: Record<string, string[]> = {};
  try {
    const item = localStorage.getItem(STORAGE_KEY_FAVORITES);
    if (item) favMap = JSON.parse(item);
  } catch {
    favMap = {};
  }
  const current = favMap[userId] || [];
  const exists = current.includes(listingId);
  const updated = exists ? current.filter((id) => id !== listingId) : [...current, listingId];
  favMap[userId] = updated;
  localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(favMap));
  return updated;
}
