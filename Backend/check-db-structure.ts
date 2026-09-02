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

async function checkDBStructure() {
  try {
    console.log('=== CATEGORIES TABLE ===');
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .limit(5);

    if (catError) {
      console.error('Error fetching categories:', catError);
    } else {
      console.log('Sample categories:');
      categories?.forEach((c: any) => console.log(`  - ID: ${c.id}, Name: ${c.name}`));
    }

    console.log('\n=== PROVIDER PROFILES TABLE (provider_type values) ===');
    const { data: providers, error: provError } = await supabase
      .from('provider_profiles')
      .select('provider_type')
      .limit(10);

    if (provError) {
      console.error('Error fetching providers:', provError);
    } else {
      console.log('Sample provider types:');
      const uniqueTypes = [...new Set(providers?.map((p: any) => p.provider_type))];
      uniqueTypes.forEach((type: any) => console.log(`  - ${type}`));
    }

    console.log('\n=== LISTINGS TABLE (sample) ===');
    const { data: listings, error: listError } = await supabase
      .from('listings')
      .select('id, title, category_id, provider_id')
      .limit(3);

    if (listError) {
      console.error('Error fetching listings:', listError);
    } else {
      console.log('Sample listings:');
      listings?.forEach((l: any) => console.log(`  - ${l.title}, Category ID: ${l.category_id}, Provider ID: ${l.provider_id}`));
    }

    console.log('\n=== LOCATIONS TABLE (sample) ===');
    const { data: locations, error: locError } = await supabase
      .from('locations')
      .select('region, district')
      .limit(5);

    if (locError) {
      console.error('Error fetching locations:', locError);
    } else {
      console.log('Sample locations:');
      locations?.forEach((l: any) => console.log(`  - Region: ${l.region}, District: ${l.district}`));
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDBStructure();
