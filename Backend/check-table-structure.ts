import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SECRET_KEY in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseSecretKey);

async function checkTableStructure() {
  try {
    console.log('=== CHECKING TABLE STRUCTURES ===');

    // Check listings table structure
    console.log('\n=== LISTINGS TABLE STRUCTURE ===');
    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select('*')
      .limit(1);

    if (listingsError) {
      console.error('Error fetching listings:', listingsError);
    } else if (listings && listings.length > 0) {
      console.log('Listings table columns:', Object.keys(listings[0]));
      console.log('Sample listing ID:', listings[0].id);
    } else {
      console.log('No listings found, checking table info...');
      // Try to get table info
      const { data: tableInfo } = await supabase.rpc('get_table_structure', { table_name: 'listings' });
      console.log('Table info:', tableInfo);
    }

    // Check provider_profiles table structure
    console.log('\n=== PROVIDER_PROFILES TABLE STRUCTURE ===');
    const { data: providers, error: providersError } = await supabase
      .from('provider_profiles')
      .select('*')
      .limit(1);

    if (providersError) {
      console.error('Error fetching provider_profiles:', providersError);
    } else if (providers && providers.length > 0) {
      console.log('Provider_profiles table columns:', Object.keys(providers[0]));
      console.log('Sample provider ID:', providers[0].id);
    } else {
      console.log('No providers found');
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkTableStructure();
