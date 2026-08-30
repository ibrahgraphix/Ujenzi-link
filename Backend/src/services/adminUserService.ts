import { supabase } from '../config';
import { User, UserRole } from '../models';

export class AdminUserService {
  async getAllUsers(filters: {
    role?: UserRole;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { role, search, page = 1, limit = 20 } = filters;

    let query = supabase
      .from('users')
      .select('*', { count: 'exact' });

    // Filter by role
    if (role) {
      query = query.eq('role', role);
    }

    // Search by name, email, or phone
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    // Order by created_at (newest first)
    query = query.order('created_at', { ascending: false });

    const { data: users, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    return {
      users: users || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };
  }

  async deactivateUser(userId: string, adminId: string) {
    // Check if user exists
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError || !user) {
      throw new Error('User not found');
    }

    // Update user status (assuming there's an is_active column, otherwise we'll add a note)
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to deactivate user: ${updateError.message}`);
    }

    // Log admin action
    await this.logAdminAction(adminId, 'deactivate_user', 'users', userId, `Deactivated user: ${user.email}`);

    return updatedUser;
  }

  async reactivateUser(userId: string, adminId: string) {
    // Check if user exists
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError || !user) {
      throw new Error('User not found');
    }

    // Update user status
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to reactivate user: ${updateError.message}`);
    }

    // Log admin action
    await this.logAdminAction(adminId, 'reactivate_user', 'users', userId, `Reactivated user: ${user.email}`);

    return updatedUser;
  }

  private async logAdminAction(adminId: string, action: string, targetTable: string, targetId: string, details?: string) {
    const { error } = await supabase
      .from('admin_logs')
      .insert({
        id: crypto.randomUUID(),
        admin_id: adminId,
        action,
        target_table: targetTable,
        target_id: targetId,
        details,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error(`Failed to log admin action: ${error.message}`);
    }
  }
}
