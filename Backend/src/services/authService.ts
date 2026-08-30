import { supabase } from '../config';
import { User, BuyerProfile, ProviderProfile, UserRole, BuyerType, ProviderType } from '../models';
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

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const userId = uuidv4();
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
      throw new Error(`Failed to create user: ${userError.message}`);
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
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw new Error('Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    return user;
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
