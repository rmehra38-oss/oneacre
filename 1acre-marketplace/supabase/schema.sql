-- =======================================================
-- 1Acre Real Estate Marketplace - Supabase Database Schema
-- Focus: Haryana (Rohtak, Gurgaon, Sonipat, Jhajjar, etc.)
-- =======================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES / USERS TABLE
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT CHECK (role IN ('buyer', 'seller', 'broker', 'builder', 'admin')) DEFAULT 'buyer',
    profile_image TEXT,
    city TEXT DEFAULT 'Rohtak',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PROPERTIES TABLE
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT CHECK (category IN ('Agriculture', 'Residential', 'Commercial')) NOT NULL,
    subcategory TEXT NOT NULL, -- 'Agricultural Land', 'Farm House', 'Villa', 'Plot', 'Flat', 'Apartment', 'Shop', 'Office Space'
    price NUMERIC NOT NULL,
    price_display TEXT, -- e.g., "₹ 2.5 Cr / Acre" or "₹ 85 Lakhs"
    area NUMERIC NOT NULL,
    unit TEXT CHECK (unit IN ('Acre', 'Bigha', 'Square Yard', 'Square Feet')) NOT NULL,
    state TEXT DEFAULT 'Haryana',
    district TEXT NOT NULL, -- 'Rohtak', 'Gurgaon', 'Sonipat', 'Jhajjar', 'Panipat', 'Bahadurgarh', 'Manesar', 'Hisar', 'Karnal'
    city TEXT NOT NULL,
    village_landmark TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    
    -- Feature Attributes
    road_width_ft NUMERIC,
    facing TEXT, -- 'North', 'East', 'North-East', 'South', 'West'
    electricity_available BOOLEAN DEFAULT true,
    water_facility BOOLEAN DEFAULT true,
    registry_status TEXT DEFAULT 'Clear Title / Intakal', -- 'Registry Clear', 'Mutation Done', 'Pattadar'
    loan_availability BOOLEAN DEFAULT true,
    ownership_type TEXT DEFAULT 'Single Owner', -- 'Single Owner', 'Joint Family', 'Developer'
    seller_type TEXT CHECK (seller_type IN ('Owner', 'Broker', 'Builder', 'Developer')) DEFAULT 'Owner',
    
    -- Verification & Status
    status TEXT CHECK (status IN ('active', 'pending', 'sold', 'rejected')) DEFAULT 'pending',
    verification_status BOOLEAN DEFAULT false, -- 1Acre Verified Badge
    is_featured BOOLEAN DEFAULT false,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PROPERTY IMAGES & MEDIA TABLE
CREATE TABLE IF NOT EXISTS property_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. INQUIRIES & LEADS TABLE
CREATE TABLE IF NOT EXISTS inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    buyer_name TEXT NOT NULL,
    buyer_phone TEXT NOT NULL,
    buyer_email TEXT,
    message TEXT NOT NULL,
    status TEXT CHECK (status IN ('new', 'contacted', 'closed')) DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. SITE VISIT REQUESTS TABLE
CREATE TABLE IF NOT EXISTS visit_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    buyer_name TEXT NOT NULL,
    buyer_phone TEXT NOT NULL,
    preferred_date DATE NOT NULL,
    preferred_time TEXT NOT NULL,
    status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. FAVORITES TABLE
CREATE TABLE IF NOT EXISTS favorites (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, property_id)
);

-- 7. BLOGS TABLE (SEO & KNOWLEDGE BASE)
CREATE TABLE IF NOT EXISTS blogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT DEFAULT 'Haryana Property News',
    content TEXT NOT NULL,
    image TEXT,
    seo_title TEXT,
    seo_description TEXT,
    author TEXT DEFAULT '1Acre Research Team',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =======================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =======================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Properties Policies
CREATE POLICY "Public read active properties" ON properties
    FOR SELECT USING (status = 'active' OR auth.uid() = seller_id);

CREATE POLICY "Sellers create properties" ON properties
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Sellers update own properties" ON properties
    FOR UPDATE USING (auth.uid() = seller_id);

-- Inquiries Policies
CREATE POLICY "Sellers view inquiries for their properties" ON inquiries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM properties 
            WHERE properties.id = inquiries.property_id 
            AND properties.seller_id = auth.uid()
        )
    );

CREATE POLICY "Public insert inquiries" ON inquiries
    FOR INSERT WITH CHECK (true);

-- Blogs Policy
CREATE POLICY "Public read blogs" ON blogs
    FOR SELECT USING (true);
