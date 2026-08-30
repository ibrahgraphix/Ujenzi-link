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
  }) {
    const { email, password, name, phone, role, buyerType, providerType, businessName, description, locationId } = data;

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
        name,
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
      const { error: profileError } = await supabase
        .from('buyer_profiles')
        .insert({
          id: uuidv4(),
          user_id: userId,
          buyer_type: buyerType,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        throw new Error(`Failed to create buyer profile: ${profileError.message}`);
      }
    } else if (role === UserRole.PROVIDER && providerType && businessName) {
      const { error: profileError } = await supabase
        .from('provider_profiles')
        .insert({
          id: uuidv4(),
          user_id: userId,
          provider_type: providerType,
          business_name: businessName,
          description,
          location_id: locationId,
          is_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        throw new Error(`Failed to create provider profile: ${profileError.message}`);
      }
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
      throw new Error('User profile not found');
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
}
