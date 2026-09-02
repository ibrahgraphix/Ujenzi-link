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

async function activateAllListings() {
  try {
    console.log('Fetching non-active listings...');
    
    const { data: listings, error: fetchError } = await supabase
      .from('listings')
      .select('id, status, title')
      .neq('status', 'active');

    if (fetchError) {
      console.error('Error fetching listings:', fetchError);
      process.exit(1);
    }

    if (!listings || listings.length === 0) {
      console.log('No listings to activate');
      process.exit(0);
    }

    console.log(`Found ${listings.length} listings to activate:`);
    listings.forEach((l: any) => console.log(`  - ${l.title} (current status: ${l.status})`));

    const listingIds = listings.map((l: any) => l.id);
    
    const { error: updateError } = await supabase
      .from('listings')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .in('id', listingIds);

    if (updateError) {
      console.error('Error activating listings:', updateError);
      process.exit(1);
    }

    console.log(`Successfully activated ${listingIds.length} listings`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

activateAllListings();
