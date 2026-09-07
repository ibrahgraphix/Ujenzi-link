import { createClient } from '@supabase/supabase-js';
import { config } from '../src/config';

// Create a dedicated service role client for database operations
const serviceRoleClient = createClient(config.supabaseUrl, config.supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'apikey': config.supabaseSecretKey,
      'Authorization': `Bearer ${config.supabaseSecretKey}`
    }
  }
});

async function addExpertsCategory() {
  try {
    console.log('Adding "Experts & service providers direct" category to database...');

    const { data: existingCategory, error: checkError } = await serviceRoleClient
      .from('categories')
      .select('*')
      .eq('name', 'Experts & service providers direct')
      .single();

    if (existingCategory) {
      console.log('Category "Experts & service providers direct" already exists with ID:', existingCategory.id);
      return;
    }

    const { data: category, error } = await serviceRoleClient
      .from('categories')
      .insert({
        id: crypto.randomUUID(),
        name: 'Experts & service providers direct',
        parent_id: null,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create category: ${error.message}`);
    }

    console.log('✅ Category "Experts & service providers direct" created successfully!');
    console.log('Category ID:', category.id);
    console.log('Category Name:', category.name);

  } catch (error) {
    console.error('❌ Error adding category:', error);
    process.exit(1);
  }
}

addExpertsCategory()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
