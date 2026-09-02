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

async function checkListings() {
  try {
    console.log('Fetching all listings...');
    
    const { data: listings, error: fetchError } = await supabase
      .from('listings')
      .select('id, status, title, created_at');

    if (fetchError) {
      console.error('Error fetching listings:', fetchError);
      process.exit(1);
    }

    if (!listings || listings.length === 0) {
      console.log('No listings found in database');
      process.exit(0);
    }

    console.log(`Found ${listings.length} listings in database:`);
    listings.forEach((l: any) => console.log(`  - ${l.title} (status: ${l.status}, created: ${l.created_at})`));

    console.log('\nFetching active listings...');
    const { data: activeListings, error: activeError } = await supabase
      .from('listings')
      .select('id, status, title')
      .eq('status', 'active');

    if (activeError) {
      console.error('Error fetching active listings:', activeError);
    } else {
      console.log(`Found ${activeListings?.length || 0} active listings`);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkListings();
