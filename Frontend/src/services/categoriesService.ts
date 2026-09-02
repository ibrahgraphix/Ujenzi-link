import { Category } from '../types';
import apiClient from './apiClient';

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
    console.log('Fetching categories from API...');
    const res = await apiClient.get<{ categories?: any[] } | any[]>('/api/categories');
    console.log('Categories API response:', res);
    
    const items = Array.isArray(res) ? res : res?.categories;
    if (items && Array.isArray(items) && items.length > 0) {
      const mapped = items.map(mapBackendCategory);
      console.log('Mapped categories:', mapped);
      return mapped;
    } else {
      console.log('No categories found in API response');
    }
  } catch (err) {
    console.error('Failed to fetch categories from API:', err);
  }

  console.log('Returning empty categories array');
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
    console.warn('Failed to save category via API:', err);
    throw err;
  }

  return category;
}

export async function deleteCategory(id: string): Promise<boolean> {
  try {
    await apiClient.delete(`/api/categories/${id}`);
    return true;
  } catch (err) {
    console.warn(`Failed to delete category ${id} via API:`, err);
    throw err;
  }
}
