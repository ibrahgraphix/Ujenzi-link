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

async function testSearch() {
  try {
    console.log('Testing search query similar to backend...');
    
    let query = supabase
      .from('listings')
      .select(`
        *,
        categories (*),
        locations (*),
        provider_profiles (
          *,
          users (*)
        ),
        listing_images (*)
      `, { count: 'exact' });

    // Add status filter like the backend does
    query = query.eq('status', 'active');

    // Add pagination like the backend does
    query = query.range(0, 19);
    query = query.order('created_at', { ascending: false });

    const { data: listings, error, count } = await query;

    if (error) {
      console.error('Search query error:', error);
      process.exit(1);
    }

    console.log(`Search results: ${listings?.length || 0} listings (count: ${count})`);
    if (listings && listings.length > 0) {
      listings.forEach((l: any) => console.log(`  - ${l.title} (status: ${l.status})`));
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testSearch();
