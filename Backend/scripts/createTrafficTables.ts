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

async function createTrafficTables() {
  try {
    console.log('Creating traffic tracking tables...');

    // Create page_visits table
    console.log('\n=== Creating page_visits table ===');
    const { error: pageVisitsError } = await serviceRoleClient.rpc('create_page_visits_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS page_visits (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          ip_address TEXT NOT NULL,
          page_url TEXT NOT NULL,
          visit_count INTEGER DEFAULT 1,
          first_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          last_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_page_visits_ip_page ON page_visits(ip_address, page_url);
        CREATE INDEX IF NOT EXISTS idx_page_visits_page ON page_visits(page_url);
      `
    });

    if (pageVisitsError) {
      console.log('Error creating page_visits table via RPC, trying direct SQL...');
      // Try direct SQL approach
      const { error: directError } = await serviceRoleClient
        .from('page_visits')
        .select('*')
        .limit(1);

      if (directError && directError.message.includes('does not exist')) {
        console.log('Table does not exist. Please create it manually in Supabase SQL editor:');
        console.log(`
          CREATE TABLE IF NOT EXISTS page_visits (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            ip_address TEXT NOT NULL,
            page_url TEXT NOT NULL,
            visit_count INTEGER DEFAULT 1,
            first_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            last_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS idx_page_visits_ip_page ON page_visits(ip_address, page_url);
          CREATE INDEX IF NOT EXISTS idx_page_visits_page ON page_visits(page_url);
        `);
      } else {
        console.log('page_visits table might already exist or was created successfully');
      }
    } else {
      console.log('✅ page_visits table created successfully');
    }

    // Create listing_visits table
    console.log('\n=== Creating listing_visits table ===');
    const { error: listingVisitsError } = await serviceRoleClient
      .from('listing_visits')
      .select('*')
      .limit(1);

    if (listingVisitsError && listingVisitsError.message.includes('does not exist')) {
      console.log('listing_visits table does not exist. Please create it manually in Supabase SQL editor:');
      console.log(`
        CREATE TABLE IF NOT EXISTS listing_visits (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
          ip_address TEXT NOT NULL,
          visit_count INTEGER DEFAULT 1,
          first_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          last_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_listing_visits_listing_ip ON listing_visits(listing_id, ip_address);
        CREATE INDEX IF NOT EXISTS idx_listing_visits_listing ON listing_visits(listing_id);
      `);
    } else {
      console.log('✅ listing_visits table exists or was created successfully');
    }

    // Create provider_visits table
    console.log('\n=== Creating provider_visits table ===');
    const { error: providerVisitsError } = await serviceRoleClient
      .from('provider_visits')
      .select('*')
      .limit(1);

    if (providerVisitsError && providerVisitsError.message.includes('does not exist')) {
      console.log('provider_visits table does not exist. Please create it manually in Supabase SQL editor:');
      console.log(`
        CREATE TABLE IF NOT EXISTS provider_visits (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
          ip_address TEXT NOT NULL,
          visit_count INTEGER DEFAULT 1,
          first_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          last_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_provider_visits_provider_ip ON provider_visits(provider_id, ip_address);
        CREATE INDEX IF NOT EXISTS idx_provider_visits_provider ON provider_visits(provider_id);
      `);
    } else {
      console.log('✅ provider_visits table exists or was created successfully');
    }

    console.log('\n✅ Traffic table setup completed');
    console.log('Note: If tables don\'t exist, please run the SQL commands in Supabase SQL editor');

  } catch (error) {
    console.error('❌ Error creating traffic tables:', error);
    process.exit(1);
  }
}

createTrafficTables()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
