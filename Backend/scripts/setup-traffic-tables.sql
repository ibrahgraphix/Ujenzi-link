-- Traffic Tracking Tables for Ujenzi Link
-- Run this in Supabase SQL Editor

-- Drop existing tables if they exist (to fix foreign key issues)
DROP TABLE IF EXISTS provider_visits CASCADE;
DROP TABLE IF EXISTS listing_visits CASCADE;
DROP TABLE IF EXISTS page_visits CASCADE;

-- 1. Page visits table (for general page traffic)
CREATE TABLE page_visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  page_url TEXT NOT NULL,
  visit_count INTEGER DEFAULT 1,
  first_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_page_visits_ip_page ON page_visits(ip_address, page_url);
CREATE INDEX idx_page_visits_page ON page_visits(page_url);

-- 2. Listing visits table (for individual listing page views)
CREATE TABLE listing_visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  ip_address TEXT NOT NULL,
  visit_count INTEGER DEFAULT 1,
  first_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_listing_visits_listing_ip ON listing_visits(listing_id, ip_address);
CREATE INDEX idx_listing_visits_listing ON listing_visits(listing_id);

-- 3. Provider visits table (for provider profile page views)
CREATE TABLE provider_visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES provider_profiles(user_id) ON DELETE CASCADE,
  ip_address TEXT NOT NULL,
  visit_count INTEGER DEFAULT 1,
  first_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_provider_visits_provider_ip ON provider_visits(provider_id, ip_address);
CREATE INDEX idx_provider_visits_provider ON provider_visits(provider_id);

-- Enable Row Level Security (optional - for now, allow public inserts)
ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_visits ENABLE ROW LEVEL SECURITY;

-- Allow public inserts for traffic tracking
CREATE POLICY "Allow public inserts on page_visits" ON page_visits FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public inserts on listing_visits" ON listing_visits FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public inserts on provider_visits" ON provider_visits FOR INSERT WITH CHECK (true);

-- Allow service role to read all data
CREATE POLICY "Allow service role to read page_visits" ON page_visits FOR SELECT USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role to read listing_visits" ON listing_visits FOR SELECT USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role to read provider_visits" ON provider_visits FOR SELECT USING (auth.role() = 'service_role');
