import { Category } from '../types';
import apiClient from './apiClient';

const STORAGE_KEY = 'ujenzi_categories_v1';

function mapBackendCategory(item: any): Category {
  return {
    id: item.id || `cat-${Date.now()}`,
    name: item.name || 'Category',
    slug: item.slug || (item.name ? item.name.toLowerCase().replace(/\s+/g, '-') : 'category'),
    iconName: item.iconName || item.icon_name || 'Package',
    description: item.description || '',
    itemCount: item.itemCount ?? item.item_count ?? 0,
    imageUrl: item.imageUrl || item.image_url || 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=400&q=80',
    popular: item.popular ?? true,
  };
}

export async function getCategories(): Promise<Category[]> {
  try {
    const res = await apiClient.get<{ categories?: any[] } | any[]>('/api/categories');
    const items = Array.isArray(res) ? res : res?.categories;
    if (items && Array.isArray(items) && items.length > 0) {
      return items.map(mapBackendCategory);
    }
  } catch (err) {
    console.warn('Failed to fetch categories from API:', err);
  }

  try {
    const item = localStorage.getItem(STORAGE_KEY);
    if (item) return JSON.parse(item);
  } catch {
    // fallback
  }

  return [];
}

export async function saveCategory(category: Category): Promise<Category> {
  try {
    let res: any;
    if (category.id && !category.id.startsWith('cat-demo-')) {
      res = await apiClient.put(`/api/categories/${category.id}`, {
        name: category.name,
        description: category.description,
      });
    } else {
      res = await apiClient.post('/api/categories', {
        name: category.name,
        description: category.description,
      });
    }
    if (res) return mapBackendCategory(res);
  } catch (err) {
    console.warn('Failed to save category via API, operating locally:', err);
  }

  const categories = await getCategories();
  const idx = categories.findIndex((c) => c.id === category.id);
  if (idx !== -1) {
    categories[idx] = category;
  } else {
    categories.push(category);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  return category;
}

export async function deleteCategory(id: string): Promise<boolean> {
  try {
    await apiClient.delete(`/api/categories/${id}`);
    return true;
  } catch (err) {
    console.warn(`Failed to delete category ${id} via API:`, err);
  }

  const categories = await getCategories();
  const filtered = categories.filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}
