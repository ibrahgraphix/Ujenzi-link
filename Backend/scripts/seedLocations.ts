import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
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

const locations = [
  // Dar es Salaam
  { id: uuidv4(), country: 'Tanzania', region: 'Dar es Salaam', district: 'Kinondoni' },
  { id: uuidv4(), country: 'Tanzania', region: 'Dar es Salaam', district: 'Ilala' },
  { id: uuidv4(), country: 'Tanzania', region: 'Dar es Salaam', district: 'Temeke' },
  { id: uuidv4(), country: 'Tanzania', region: 'Dar es Salaam', district: 'Ubungo' },
  { id: uuidv4(), country: 'Tanzania', region: 'Dar es Salaam', district: 'Kigamboni' },
  
  // Arusha
  { id: uuidv4(), country: 'Tanzania', region: 'Arusha', district: 'Arusha Urban' },
  { id: uuidv4(), country: 'Tanzania', region: 'Arusha', district: 'Arumeru' },
  { id: uuidv4(), country: 'Tanzania', region: 'Arusha', district: 'Karatu' },
  { id: uuidv4(), country: 'Tanzania', region: 'Arusha', district: 'Monduli' },
  
  // Mwanza
  { id: uuidv4(), country: 'Tanzania', region: 'Mwanza', district: 'Nyamagana' },
  { id: uuidv4(), country: 'Tanzania', region: 'Mwanza', district: 'Ilemela' },
  { id: uuidv4(), country: 'Tanzania', region: 'Mwanza', district: 'Sengerema' },
  
  // Dodoma
  { id: uuidv4(), country: 'Tanzania', region: 'Dodoma', district: 'Dodoma Urban' },
  { id: uuidv4(), country: 'Tanzania', region: 'Dodoma', district: 'Bahi' },
  { id: uuidv4(), country: 'Tanzania', region: 'Dodoma', district: 'Chamwino' },
  
  // Tanga
  { id: uuidv4(), country: 'Tanzania', region: 'Tanga', district: 'Tanga Urban' },
  { id: uuidv4(), country: 'Tanzania', region: 'Tanga', district: 'Muheza' },
  { id: uuidv4(), country: 'Tanzania', region: 'Tanga', district: 'Korogwe' },
  
  // Kilimanjaro
  { id: uuidv4(), country: 'Tanzania', region: 'Kilimanjaro', district: 'Moshi Urban' },
  { id: uuidv4(), country: 'Tanzania', region: 'Kilimanjaro', district: 'Hai' },
  { id: uuidv4(), country: 'Tanzania', region: 'Kilimanjaro', district: 'Rombo' },
  
  // Mbeya
  { id: uuidv4(), country: 'Tanzania', region: 'Mbeya', district: 'Mbeya Urban' },
  { id: uuidv4(), country: 'Tanzania', region: 'Mbeya', district: 'Kyela' },
  
  // Morogoro
  { id: uuidv4(), country: 'Tanzania', region: 'Morogoro', district: 'Morogoro Urban' },
  { id: uuidv4(), country: 'Tanzania', region: 'Morogoro', district: 'Mvomero' },
  
  // Pwani
  { id: uuidv4(), country: 'Tanzania', region: 'Pwani', district: 'Bagamoyo' },
  { id: uuidv4(), country: 'Tanzania', region: 'Pwani', district: 'Kibaha' },
  
  // Zanzibar
  { id: uuidv4(), country: 'Tanzania', region: 'Zanzibar', district: 'Zanzibar Urban' },
  { id: uuidv4(), country: 'Tanzania', region: 'Zanzibar', district: 'West' },
];

async function seedLocations() {
  try {
    console.log('Seeding locations...');

    const { data: existing, error: checkError } = await supabase
      .from('locations')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('Error checking locations table:', checkError.message);
      return;
    }

    if (existing && existing.length > 0) {
      console.log('Locations already exist, skipping seed.');
      return;
    }

    const { data, error } = await supabase
      .from('locations')
      .insert(locations)
      .select();

    if (error) {
      console.error('Error seeding locations:', error.message);
      return;
    }

    console.log(`✅ Successfully seeded ${data?.length || 0} locations`);

  } catch (error) {
    console.error('Error seeding locations:', error);
  }
}

seedLocations();
