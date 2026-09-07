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

async function checkTrafficTables() {
  try {
    console.log('=== CHECKING FOR TRAFFIC/VISIT TABLES ===');

    // Check for traffic table
    console.log('\n=== TRAFFIC TABLE ===');
    const { data: traffic, error: trafficError } = await supabase
      .from('traffic')
      .select('*')
      .limit(5);

    if (trafficError) {
      console.log('Traffic table not found or error:', trafficError.message);
    } else {
      console.log('Traffic table exists. Sample data:');
      traffic?.forEach((t: any) => console.log(`  - IP: ${t.ip_address}, Page: ${t.page_url}, Count: ${t.visit_count}`));
    }

    // Check for page_visits table
    console.log('\n=== PAGE_VISITS TABLE ===');
    const { data: pageVisits, error: pageVisitsError } = await supabase
      .from('page_visits')
      .select('*')
      .limit(5);

    if (pageVisitsError) {
      console.log('Page_visits table not found or error:', pageVisitsError.message);
    } else {
      console.log('Page_visits table exists. Sample data:');
      pageVisits?.forEach((pv: any) => console.log(`  - IP: ${pv.ip_address}, Page: ${pv.page_url}, Count: ${pv.visit_count}`));
    }

    // Check for analytics table
    console.log('\n=== ANALYTICS TABLE ===');
    const { data: analytics, error: analyticsError } = await supabase
      .from('analytics')
      .select('*')
      .limit(5);

    if (analyticsError) {
      console.log('Analytics table not found or error:', analyticsError.message);
    } else {
      console.log('Analytics table exists. Sample data:');
      analytics?.forEach((a: any) => console.log(`  - ID: ${a.id}, Type: ${a.metric_type}`));
    }

    // Check for listing_visits table
    console.log('\n=== LISTING_VISITS TABLE ===');
    const { data: listingVisits, error: listingVisitsError } = await supabase
      .from('listing_visits')
      .select('*')
      .limit(5);

    if (listingVisitsError) {
      console.log('Listing_visits table not found or error:', listingVisitsError.message);
    } else {
      console.log('Listing_visits table exists. Sample data:');
      listingVisits?.forEach((lv: any) => console.log(`  - Listing ID: ${lv.listing_id}, IP: ${lv.ip_address}, Count: ${lv.visit_count}`));
    }

    // Check for provider_visits table
    console.log('\n=== PROVIDER_VISITS TABLE ===');
    const { data: providerVisits, error: providerVisitsError } = await supabase
      .from('provider_visits')
      .select('*')
      .limit(5);

    if (providerVisitsError) {
      console.log('Provider_visits table not found or error:', providerVisitsError.message);
    } else {
      console.log('Provider_visits table exists. Sample data:');
      providerVisits?.forEach((pv: any) => console.log(`  - Provider ID: ${pv.provider_id}, IP: ${pv.ip_address}, Count: ${pv.visit_count}`));
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkTrafficTables();
