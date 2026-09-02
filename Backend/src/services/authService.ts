import { supabase } from '../config';
import { User, UserRole, BuyerType, ProviderType } from '../models';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export class AuthService {
  async registerUser(data: {
    email: string;
    password: string;
    name: string;
    phone: string;
    role: UserRole;
    buyerType?: BuyerType;
    providerType?: ProviderType;
    businessName?: string;
    description?: string;
    locationId?: string;
    institutionName?: string;
    projectName?: string;
    projectDescription?: string;
  }) {
    const { email, password, name, phone, role, buyerType, providerType, businessName, description, locationId, institutionName, projectName, projectDescription } = data;

    // Create user in Supabase Auth via Admin API to bypass email confirmation
    const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, phone, role }
    });

    if (signUpError || !authData.user) {
      throw new Error(`Failed to create auth user: ${signUpError?.message}`);
    }

    const userId = authData.user.id;
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user profile in public users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email,
        password_hash: passwordHash,
        full_name: name,
        phone,
        role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (userError) {
      // Clean up Supabase Auth user if public profile insertion fails
      await supabase.auth.admin.deleteUser(userId);
      throw new Error(`Failed to create user profile: ${userError.message}`);
    }

    // Create role-specific profile
    if (role === UserRole.BUYER && buyerType) {
      const buyerInsertData: Record<string, any> = {
        user_id: userId,
        buyer_type: buyerType,
        created_at: new Date().toISOString()
      };

      // Add client-specific fields if buyer_type is 'client'
      if (buyerType === BuyerType.CLIENT) {
        if (institutionName) buyerInsertData.institution_name = institutionName;
        if (projectName) buyerInsertData.project_name = projectName;
        if (projectDescription) buyerInsertData.project_description = projectDescription;
      }

      const { error: profileError } = await supabase
        .from('buyer_profiles')
        .insert(buyerInsertData);

      if (profileError) {
        console.error('Buyer profile error:', profileError);
        throw new Error(`Failed to create buyer profile: ${profileError.message}`);
      }
    } else if (role === UserRole.PROVIDER && providerType && businessName) {
      console.log('Creating provider profile for user:', userId, 'with data:', { providerType, businessName, description, locationId });
      const { error: profileError } = await supabase
        .from('provider_profiles')
        .insert({
          user_id: userId,
          provider_type: providerType,
          business_name: businessName,
          description,
          location_id: locationId,
          is_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Provider profile error:', profileError);
        throw new Error(`Failed to create provider profile: ${profileError.message}`);
      }
      console.log('Provider profile created successfully for user:', userId);
    }

    return user;
  }

  async loginUser(email: string, password: string) {
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !authData.user || !authData.session) {
      throw new Error(signInError?.message || 'Invalid email or password');
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (error || !user) {
      console.log('User profile not found, creating from auth data:', authData.user.id);
      // If user profile doesn't exist in public table, create it from auth data
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          full_name: authData.user.user_metadata?.name || authData.user.email?.split('@')[0],
          phone: authData.user.user_metadata?.phone || '+255 700 000 000',
          role: authData.user.user_metadata?.role || 'buyer',
          password_hash: '', // Not needed for auth users
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError || !newUser) {
        console.error('Failed to create user profile:', insertError);
        throw new Error('Failed to create user profile');
      }

      return { user: newUser, token: authData.session.access_token };
    }

    return { user, token: authData.session.access_token };
  }

  async getUserById(userId: string) {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new Error('User not found');
    }

    return user;
  }

  async getBuyerProfile(userId: string) {
    const { data: profile, error } = await supabase
      .from('buyer_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !profile) {
      throw new Error('Buyer profile not found');
    }

    return profile;
  }

  async updateBuyerProfile(userId: string, data: {
    institutionName?: string;
    projectName?: string;
    projectDescription?: string;
  }) {
    // First get buyer profile to verify it's a client
    const { data: profile, error: fetchError } = await supabase
      .from('buyer_profiles')
      .select('buyer_type')
      .eq('user_id', userId)
      .single();

    if (fetchError || !profile) {
      throw new Error('Buyer profile not found');
    }

    if (profile.buyer_type !== 'client') {
      throw new Error('These fields can only be set for client buyer type');
    }

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    if (data.institutionName !== undefined) updateData.institution_name = data.institutionName;
    if (data.projectName !== undefined) updateData.project_name = data.projectName;
    if (data.projectDescription !== undefined) updateData.project_description = data.projectDescription;

    const { data: updated, error: updateError } = await supabase
      .from('buyer_profiles')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError || !updated) {
      throw new Error(`Failed to update buyer profile: ${updateError?.message}`);
    }

    return updated;
  }
}
