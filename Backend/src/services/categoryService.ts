import { supabase } from '../config';
import { Category } from '../models';

export class CategoryService {
  async getAllCategories() {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    return categories;
  }

  async getCategoryById(categoryId: string) {
    const { data: category, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single();

    if (error || !category) {
      throw new Error('Category not found');
    }

    return category;
  }

  async getCategoriesWithSubcategories() {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    // Build hierarchy: parent categories with their subcategories
    const categoryMap = new Map<string, Category & { subcategories?: Category[] }>();
    const rootCategories: (Category & { subcategories?: Category[] })[] = [];

    // First pass: create map
    categories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, subcategories: [] });
    });

    // Second pass: build hierarchy
    categories.forEach(cat => {
      const categoryWithSubs = categoryMap.get(cat.id)!;
      if (cat.parent_id) {
        const parent = categoryMap.get(cat.parent_id);
        if (parent) {
          parent.subcategories!.push(categoryWithSubs);
        }
      } else {
        rootCategories.push(categoryWithSubs);
      }
    });

    // Clean up empty subcategories arrays
    rootCategories.forEach(cat => {
      if (cat.subcategories && cat.subcategories.length === 0) {
        delete cat.subcategories;
      }
    });

    return rootCategories;
  }

  async createCategory(data: {
    name: string;
    description?: string;
    parentId?: string;
  }) {
    const { name, description, parentId } = data;

    const { data: category, error } = await supabase
      .from('categories')
      .insert({
        id: crypto.randomUUID(),
        name,
        description,
        parent_id: parentId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create category: ${error.message}`);
    }

    return category;
  }

  async updateCategory(categoryId: string, data: {
    name?: string;
    description?: string;
    parentId?: string;
  }) {
    const { name, description, parentId } = data;

    const { data: category, error } = await supabase
      .from('categories')
      .update({
        name,
        description,
        parent_id: parentId,
        updated_at: new Date().toISOString()
      })
      .eq('id', categoryId)
      .select()
      .single();

    if (error || !category) {
      throw new Error('Failed to update category or category not found');
    }

    return category;
  }

  async deleteCategory(categoryId: string) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      throw new Error(`Failed to delete category: ${error.message}`);
    }

    return { message: 'Category deleted successfully' };
  }
}
