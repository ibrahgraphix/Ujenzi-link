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
    console.log('Checking all listings...');
    
    const { data: allListings, error: allError } = await supabase
      .from('listings')
      .select('id, title, status, created_at');

    if (allError) {
      console.error('Error fetching all listings:', allError);
    } else {
      console.log(`Total listings: ${allListings?.length || 0}`);
      allListings?.forEach((l: any) => console.log(`  - ${l.title} (status: ${l.status})`));
    }

    console.log('\nChecking active listings...');
    const { data: activeListings, error: activeError } = await supabase
      .from('listings')
      .select('id, title, status, created_at')
      .eq('status', 'active');

    if (activeError) {
      console.error('Error fetching active listings:', activeError);
    } else {
      console.log(`Active listings: ${activeListings?.length || 0}`);
      activeListings?.forEach((l: any) => console.log(`  - ${l.title} (status: ${l.status})`));
    }

    console.log('\nTesting search query with joins...');
    const { data: searchResults, error: searchError } = await supabase
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
      `, { count: 'exact' })
      .eq('status', 'active')
      .range(0, 19)
      .order('created_at', { ascending: false });

    if (searchError) {
      console.error('Search query error:', searchError);
    } else {
      console.log(`Search results: ${searchResults?.length || 0} listings`);
      if (searchResults && searchResults.length > 0) {
        searchResults.forEach((l: any) => console.log(`  - ${l.title} (status: ${l.status})`));
      }
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkListings();
