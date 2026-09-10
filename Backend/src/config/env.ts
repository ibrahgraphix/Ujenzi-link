import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SECRET_KEY',
  'SUPABASE_JWKS_URL',
  'SUPABASE_PUBLISHABLE_KEY',
  'IMAGEKIT_PUBLIC_KEY',
  'IMAGEKIT_PRIVATE_KEY',
  'IMAGEKIT_URL_ENDPOINT',
];

const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingEnvVars.length > 0) {
  console.error('\n❌ CRITICAL STARTUP ERROR: Missing required environment variables:');
  missingEnvVars.forEach((key) => {
    console.error(`   - ${key}`);
  });
  console.error('\nPlease check your .env file or server environment and restart the server.\n');
  process.exit(1);
}

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseSecretKey: process.env.SUPABASE_SECRET_KEY!,
  supabaseJwksUrl: process.env.SUPABASE_JWKS_URL!,
  supabasePublishableKey: process.env.SUPABASE_PUBLISHABLE_KEY!,
  internalEmailDomain: process.env.INTERNAL_EMAIL_DOMAIN || 'ujenzilink.internal',
  imagekitPublicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  imagekitPrivateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  imagekitUrlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};
export type Config = typeof config;
