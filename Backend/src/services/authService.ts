import { supabase } from '../config';
import { User, UserRole, BuyerType, ProviderType, AvailabilityStatus } from '../models';
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
    availabilityStatus?: AvailabilityStatus;
    institutionName?: string;
    projectName?: string;
    projectDescription?: string;
  }) {
    const { email, password, name, phone, role, buyerType, providerType, businessName, description, locationId, availabilityStatus, institutionName, projectName, projectDescription } = data;

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
      console.log('Creating provider profile for user:', userId, 'with data:', { providerType, businessName, description, locationId, availabilityStatus });
      const { error: profileError } = await supabase
        .from('provider_profiles')
        .insert({
          user_id: userId,
          provider_type: providerType,
          business_name: businessName,
          description,
          location_id: locationId,
          availability_status: availabilityStatus,
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
    let authData: any = null;
    let signInError: any = null;

    try {
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      authData = result.data;
      signInError = result.error;
    } catch (err: any) {
      signInError = err;
    }

    if (signInError || !authData?.user || !authData?.session) {
      // Check if user exists in public users table (e.g. manually created admin or provider with bcrypt hash)
      const { data: dbUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (dbUser && dbUser.password_hash) {
        const isMatch = await bcrypt.compare(password, dbUser.password_hash);
        if (isMatch) {
          // Fast sync: update password in Supabase Auth so future logins succeed directly
          try {
            await supabase.auth.admin.updateUserById(dbUser.id, { password });
            const directLogin = await supabase.auth.signInWithPassword({ email, password });
            if (directLogin.data?.session?.access_token) {
              return { user: dbUser, token: directLogin.data.session.access_token };
            }
          } catch (syncErr) {
            console.warn('Direct auth update sync failed, falling back to session creation:', syncErr);
          }

          const token = await this.createSessionForUser(dbUser);
          return { user: dbUser, token };
        }
      }

      // Check if the underlying error was a transient timeout from Supabase or gateway
      const errLower = signInError?.message?.toLowerCase() || '';
      if (errLower.includes('timeout') || errLower.includes('gateway') || errLower.includes('504')) {
        throw new Error('Connection timeout while verifying credentials. Please try again.');
      }

      throw new Error('Invalid email or password');
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

  private async createSessionForUser(user: any): Promise<string> {
    // Ensure user exists in Supabase Auth
    const { data: authUser } = await supabase.auth.admin.getUserById(user.id);
    if (!authUser || !authUser.user) {
      const { error: createError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: 'AdminTempPass_' + uuidv4(),
        email_confirm: true,
        user_metadata: { name: user.name || user.full_name, phone: user.phone, role: user.role }
      });
      if (createError && !createError.message?.toLowerCase().includes('already')) {
        throw new Error(`Failed to initialize auth account: ${createError.message}`);
      }
    }

    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: user.email
    });

    if (linkError || !linkData?.properties?.hashed_token) {
      throw new Error(`Failed to generate auth token: ${linkError?.message || 'Unknown error'}`);
    }

    const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: linkData.properties.hashed_token,
      type: 'magiclink'
    });

    if (verifyError || !verifyData?.session) {
      throw new Error(`Failed to create session: ${verifyError?.message || 'Unknown error'}`);
    }

    return verifyData.session.access_token;
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

  async forceAdminPasswordChange(userId: string, newPassword: string) {
    const passwordHash = await bcrypt.hash(newPassword, 10);

    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        must_change_password: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      throw new Error(`Failed to update password: ${updateError.message}`);
    }

    try {
      await supabase.auth.admin.updateUserById(userId, {
        password: newPassword
      });
    } catch (authError) {
      console.warn('Note: Could not update Supabase auth user password:', authError);
    }

    return true;
  }
}
