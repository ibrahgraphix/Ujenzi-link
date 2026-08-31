import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!;

const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdmin() {
  try {
    const email = 'admin@ujenzilink.co.tz';
    const password = 'Admin';
    const name = 'Admin';
    const phone = '+255 711 000 999';
    const role = 'admin';

    console.log('Creating admin account...');

    // Create user in Supabase Auth via Admin API
    const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, phone, role }
    });

    if (signUpError) {
      console.error('Failed to create auth user:', signUpError.message);
      return;
    }

    if (!authData.user) {
      console.error('No user returned from auth creation');
      return;
    }

    console.log('Auth user created:', authData.user.id);

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
      console.error('Failed to create user profile:', userError.message);
      // Clean up Supabase Auth user if public profile insertion fails
      await supabase.auth.admin.deleteUser(userId);
      return;
    }

    console.log('✅ Admin account created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('User ID:', userId);

  } catch (error) {
    console.error('Error creating admin:', error);
  }
}

createAdmin();
