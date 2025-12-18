/*
  # Landing Page Configuration - Fully Dynamic
  
  1. New Tables
    - `landing_page_settings` - Main landing page configuration
    - `landing_page_sections` - Configurable sections (hero, features, etc.)
    - `landing_page_features` - Feature highlights
    - `landing_page_testimonials` - Customer testimonials
    - `landing_page_cta` - Call-to-action buttons
    - `landing_page_images` - Managed images (hero, gallery, etc.)
  
  2. Features
    - Section enable/disable
    - All text content editable
    - SEO configuration
    - Image management
    - Maintenance/coming-soon mode
  
  3. Security
    - Public read access for landing page
    - Super admin write access
*/

-- Landing Page Settings (Main Configuration)
CREATE TABLE IF NOT EXISTS landing_page_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Page State
  is_enabled boolean DEFAULT true,
  is_coming_soon boolean DEFAULT false,
  coming_soon_message text DEFAULT 'We are launching soon. Stay tuned!',
  coming_soon_date timestamptz,
  
  -- SEO Settings
  meta_title text DEFAULT 'AI Video Analytics Platform',
  meta_description text DEFAULT 'Enterprise-grade AI-powered video analytics for security and operations.',
  meta_keywords text DEFAULT 'AI, video analytics, security, surveillance, edge computing',
  og_image_url text,
  
  -- Header
  header_logo_url text,
  header_show_login boolean DEFAULT true,
  header_show_register boolean DEFAULT true,
  header_cta_text text DEFAULT 'Get Started',
  header_cta_url text DEFAULT '/register',
  
  -- Hero Section
  hero_enabled boolean DEFAULT true,
  hero_title text DEFAULT 'Intelligent Video Analytics',
  hero_subtitle text DEFAULT 'Transform your security with AI-powered surveillance',
  hero_description text DEFAULT 'Real-time detection, instant alerts, and actionable insights from your existing camera infrastructure.',
  hero_image_url text,
  hero_video_url text,
  hero_primary_cta_text text DEFAULT 'Start Free Trial',
  hero_primary_cta_url text DEFAULT '/register',
  hero_secondary_cta_text text DEFAULT 'Watch Demo',
  hero_secondary_cta_url text DEFAULT '#demo',
  
  -- Features Section
  features_enabled boolean DEFAULT true,
  features_title text DEFAULT 'Powerful Features',
  features_subtitle text DEFAULT 'Everything you need for intelligent video analytics',
  
  -- How It Works Section
  how_it_works_enabled boolean DEFAULT true,
  how_it_works_title text DEFAULT 'How It Works',
  how_it_works_subtitle text DEFAULT 'Simple setup, powerful results',
  
  -- Testimonials Section
  testimonials_enabled boolean DEFAULT true,
  testimonials_title text DEFAULT 'Trusted by Industry Leaders',
  testimonials_subtitle text DEFAULT 'See what our customers say',
  
  -- Pricing Section
  pricing_enabled boolean DEFAULT true,
  pricing_title text DEFAULT 'Simple, Transparent Pricing',
  pricing_subtitle text DEFAULT 'Choose the plan that fits your needs',
  
  -- Contact Section
  contact_enabled boolean DEFAULT true,
  contact_title text DEFAULT 'Get in Touch',
  contact_subtitle text DEFAULT 'Have questions? We are here to help.',
  contact_email text DEFAULT 'contact@platform.com',
  contact_phone text,
  contact_address text,
  
  -- Footer
  footer_copyright text DEFAULT '© 2024 AI-VAP Platform. All rights reserved.',
  footer_links jsonb DEFAULT '[]',
  social_links jsonb DEFAULT '{}',
  
  -- Analytics
  google_analytics_id text,
  facebook_pixel_id text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Landing Page Sections (Reorderable)
CREATE TABLE IF NOT EXISTS landing_page_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text UNIQUE NOT NULL,
  title text NOT NULL,
  subtitle text,
  content text,
  is_enabled boolean DEFAULT true,
  display_order integer DEFAULT 0,
  background_color text,
  background_image_url text,
  custom_css text,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Landing Page Features
CREATE TABLE IF NOT EXISTS landing_page_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  icon text,
  image_url text,
  is_enabled boolean DEFAULT true,
  display_order integer DEFAULT 0,
  link_url text,
  link_text text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Landing Page Testimonials
CREATE TABLE IF NOT EXISTS landing_page_testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name text NOT NULL,
  author_title text,
  author_company text,
  author_avatar_url text,
  quote text NOT NULL,
  rating integer DEFAULT 5,
  is_enabled boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Landing Page Images
CREATE TABLE IF NOT EXISTS landing_page_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_key text NOT NULL,
  image_url text NOT NULL,
  alt_text text,
  caption text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE landing_page_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_page_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_page_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_page_images ENABLE ROW LEVEL SECURITY;

-- Public read policies (landing page is public)
CREATE POLICY "Public can view landing page settings"
  ON landing_page_settings FOR SELECT
  USING (true);

CREATE POLICY "Public can view landing page sections"
  ON landing_page_sections FOR SELECT
  USING (true);

CREATE POLICY "Public can view landing page features"
  ON landing_page_features FOR SELECT
  USING (true);

CREATE POLICY "Public can view landing page testimonials"
  ON landing_page_testimonials FOR SELECT
  USING (true);

CREATE POLICY "Public can view landing page images"
  ON landing_page_images FOR SELECT
  USING (true);

-- Super admin write policies
CREATE POLICY "Super admins can update landing page settings"
  ON landing_page_settings FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM super_admins WHERE user_id = (auth.jwt()->>'user_id')::integer))
  WITH CHECK (EXISTS (SELECT 1 FROM super_admins WHERE user_id = (auth.jwt()->>'user_id')::integer));

CREATE POLICY "Super admins can manage landing page sections"
  ON landing_page_sections FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM super_admins WHERE user_id = (auth.jwt()->>'user_id')::integer))
  WITH CHECK (EXISTS (SELECT 1 FROM super_admins WHERE user_id = (auth.jwt()->>'user_id')::integer));

CREATE POLICY "Super admins can manage landing page features"
  ON landing_page_features FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM super_admins WHERE user_id = (auth.jwt()->>'user_id')::integer))
  WITH CHECK (EXISTS (SELECT 1 FROM super_admins WHERE user_id = (auth.jwt()->>'user_id')::integer));

CREATE POLICY "Super admins can manage landing page testimonials"
  ON landing_page_testimonials FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM super_admins WHERE user_id = (auth.jwt()->>'user_id')::integer))
  WITH CHECK (EXISTS (SELECT 1 FROM super_admins WHERE user_id = (auth.jwt()->>'user_id')::integer));

CREATE POLICY "Super admins can manage landing page images"
  ON landing_page_images FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM super_admins WHERE user_id = (auth.jwt()->>'user_id')::integer))
  WITH CHECK (EXISTS (SELECT 1 FROM super_admins WHERE user_id = (auth.jwt()->>'user_id')::integer));

-- Insert default landing page settings
INSERT INTO landing_page_settings (id) VALUES (gen_random_uuid());

-- Insert default sections
INSERT INTO landing_page_sections (section_key, title, subtitle, display_order) VALUES
  ('hero', 'Hero Section', 'Main landing area', 1),
  ('features', 'Features', 'Platform capabilities', 2),
  ('how_it_works', 'How It Works', 'Process overview', 3),
  ('testimonials', 'Testimonials', 'Customer reviews', 4),
  ('pricing', 'Pricing', 'Subscription plans', 5),
  ('contact', 'Contact', 'Contact information', 6);

-- Insert default features
INSERT INTO landing_page_features (title, description, icon, display_order) VALUES
  ('Real-Time Detection', 'AI-powered detection of people, vehicles, and objects in real-time.', 'eye', 1),
  ('Instant Alerts', 'Receive immediate notifications on mobile and web when events occur.', 'bell', 2),
  ('Edge Computing', 'Process video locally for privacy and low latency.', 'cpu', 3),
  ('Smart Analytics', 'Gain insights from historical data and trends.', 'bar-chart-2', 4),
  ('Multi-Site Management', 'Monitor all your locations from a single dashboard.', 'map-pin', 5),
  ('Enterprise Security', 'Bank-grade encryption and role-based access control.', 'shield', 6);
