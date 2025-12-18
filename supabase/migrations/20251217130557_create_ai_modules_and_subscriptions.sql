/*
  # AI Modules, Subscription Plans & Feature Governance
  
  1. New Tables
    - `subscription_plans` - Available subscription tiers
    - `plan_features` - Features included in each plan
    - `ai_modules` - Available AI modules (system-wide)
    - `ai_module_configs` - Per-organization AI module configuration
    - `cameras` - Camera management
    - `camera_zones` - Detection zones per camera
  
  2. New AI Modules
    - fire_detection
    - intrusion_detection
    - face_recognition
    - vehicle_recognition
    - crowd_detection
    - ppe_detection
    - production_monitoring (NEW)
    - warehouse_monitoring (NEW)
    - drowning_detection (NEW)
  
  3. Security
    - Plan-based feature access
    - Organization-scoped configuration
*/

-- Subscription Plans
CREATE TABLE IF NOT EXISTS subscription_plans (
  id SERIAL PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  
  -- Limits
  max_cameras integer DEFAULT 10,
  max_edge_servers integer DEFAULT 1,
  max_users integer DEFAULT 5,
  max_storage_gb integer DEFAULT 100,
  event_retention_days integer DEFAULT 30,
  video_retention_days integer DEFAULT 7,
  
  -- Features
  features_enabled text[] DEFAULT ARRAY[]::text[],
  ai_modules_enabled text[] DEFAULT ARRAY[]::text[],
  
  -- Pricing
  price_monthly numeric(10,2) DEFAULT 0,
  price_yearly numeric(10,2) DEFAULT 0,
  currency text DEFAULT 'USD',
  
  -- Status
  is_active boolean DEFAULT true,
  is_public boolean DEFAULT true,
  display_order integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Plan Features (Detailed)
CREATE TABLE IF NOT EXISTS plan_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id integer REFERENCES subscription_plans(id) ON DELETE CASCADE,
  feature_key text NOT NULL,
  feature_name text NOT NULL,
  feature_description text,
  is_enabled boolean DEFAULT true,
  limit_value integer,
  created_at timestamptz DEFAULT now()
);

-- AI Modules (System-wide Definition)
CREATE TABLE IF NOT EXISTS ai_modules (
  id SERIAL PRIMARY KEY,
  module_key text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  category text DEFAULT 'detection',
  
  -- Availability
  is_enabled boolean DEFAULT true,
  is_premium boolean DEFAULT false,
  min_plan_level integer DEFAULT 1,
  
  -- Configuration Schema
  config_schema jsonb DEFAULT '{}',
  default_config jsonb DEFAULT '{}',
  
  -- Requirements
  required_camera_type text,
  min_fps integer DEFAULT 15,
  min_resolution text DEFAULT '720p',
  
  -- Display
  icon text,
  display_order integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Per-Organization AI Module Configuration
CREATE TABLE IF NOT EXISTS ai_module_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id integer REFERENCES organizations(id) ON DELETE CASCADE,
  module_id integer REFERENCES ai_modules(id) ON DELETE CASCADE,
  
  -- Status
  is_enabled boolean DEFAULT false,
  is_licensed boolean DEFAULT false,
  
  -- Configuration
  config jsonb DEFAULT '{}',
  
  -- Thresholds
  confidence_threshold numeric(3,2) DEFAULT 0.75,
  alert_threshold integer DEFAULT 1,
  cooldown_seconds integer DEFAULT 30,
  
  -- Schedule
  schedule_enabled boolean DEFAULT false,
  schedule jsonb DEFAULT '{}',
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, module_id)
);

-- Cameras
CREATE TABLE IF NOT EXISTS cameras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id integer REFERENCES organizations(id) ON DELETE CASCADE,
  edge_server_id integer REFERENCES edge_servers(id),
  
  -- Identity
  camera_id text NOT NULL,
  name text NOT NULL,
  description text,
  location text,
  
  -- Connection
  rtsp_url text,
  http_url text,
  credentials jsonb DEFAULT '{}',
  
  -- Specs
  camera_type text DEFAULT 'fixed',
  resolution text,
  fps integer DEFAULT 25,
  
  -- AI Configuration
  ai_modules_enabled text[] DEFAULT ARRAY[]::text[],
  
  -- Status
  status text DEFAULT 'offline',
  is_active boolean DEFAULT true,
  last_seen_at timestamptz,
  
  -- Metadata
  tags text[],
  metadata jsonb DEFAULT '{}',
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, camera_id)
);

-- Camera Zones (Detection Regions)
CREATE TABLE IF NOT EXISTS camera_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  camera_id uuid REFERENCES cameras(id) ON DELETE CASCADE,
  
  -- Zone Info
  name text NOT NULL,
  zone_type text DEFAULT 'detection',
  
  -- Geometry (polygon coordinates)
  coordinates jsonb NOT NULL,
  
  -- AI Configuration
  ai_modules text[] DEFAULT ARRAY[]::text[],
  
  -- Rules
  rules jsonb DEFAULT '{}',
  
  -- Display
  color text DEFAULT '#FF0000',
  opacity numeric(3,2) DEFAULT 0.3,
  
  is_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_module_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cameras ENABLE ROW LEVEL SECURITY;
ALTER TABLE camera_zones ENABLE ROW LEVEL SECURITY;

-- Plans are public read
CREATE POLICY "Anyone can view active plans"
  ON subscription_plans FOR SELECT
  USING (is_active = true AND is_public = true);

CREATE POLICY "Super admins can manage plans"
  ON subscription_plans FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM super_admins WHERE user_id = (auth.jwt()->>'user_id')::integer));

CREATE POLICY "Anyone can view plan features"
  ON plan_features FOR SELECT
  USING (true);

CREATE POLICY "Super admins can manage plan features"
  ON plan_features FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM super_admins WHERE user_id = (auth.jwt()->>'user_id')::integer));

-- AI Modules are public read
CREATE POLICY "Anyone can view enabled AI modules"
  ON ai_modules FOR SELECT
  USING (is_enabled = true);

CREATE POLICY "Super admins can manage AI modules"
  ON ai_modules FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM super_admins WHERE user_id = (auth.jwt()->>'user_id')::integer));

-- AI Module Configs are org-scoped
CREATE POLICY "Users can view own org AI configs"
  ON ai_module_configs FOR SELECT
  TO authenticated
  USING (organization_id = (auth.jwt()->>'organization_id')::integer);

CREATE POLICY "Admins can manage own org AI configs"
  ON ai_module_configs FOR ALL
  TO authenticated
  USING (organization_id = (auth.jwt()->>'organization_id')::integer)
  WITH CHECK (organization_id = (auth.jwt()->>'organization_id')::integer);

-- Cameras are org-scoped
CREATE POLICY "Users can view own org cameras"
  ON cameras FOR SELECT
  TO authenticated
  USING (organization_id = (auth.jwt()->>'organization_id')::integer);

CREATE POLICY "Admins can manage own org cameras"
  ON cameras FOR ALL
  TO authenticated
  USING (organization_id = (auth.jwt()->>'organization_id')::integer)
  WITH CHECK (organization_id = (auth.jwt()->>'organization_id')::integer);

-- Camera Zones are camera-scoped
CREATE POLICY "Users can view camera zones"
  ON camera_zones FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cameras c 
      WHERE c.id = camera_zones.camera_id 
      AND c.organization_id = (auth.jwt()->>'organization_id')::integer
    )
  );

CREATE POLICY "Admins can manage camera zones"
  ON camera_zones FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cameras c 
      WHERE c.id = camera_zones.camera_id 
      AND c.organization_id = (auth.jwt()->>'organization_id')::integer
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cameras c 
      WHERE c.id = camera_zones.camera_id 
      AND c.organization_id = (auth.jwt()->>'organization_id')::integer
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_module_configs_org ON ai_module_configs(organization_id);
CREATE INDEX IF NOT EXISTS idx_cameras_org ON cameras(organization_id);
CREATE INDEX IF NOT EXISTS idx_cameras_edge ON cameras(edge_server_id);
CREATE INDEX IF NOT EXISTS idx_camera_zones_camera ON camera_zones(camera_id);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, slug, description, max_cameras, max_edge_servers, max_users, features_enabled, ai_modules_enabled, price_monthly, display_order) VALUES
  ('Starter', 'starter', 'Perfect for small businesses', 5, 1, 3, 
   ARRAY['basic_alerts', 'email_notifications'], 
   ARRAY['fire_detection', 'intrusion_detection'], 
   49.00, 1),
  ('Professional', 'professional', 'For growing organizations', 20, 3, 10, 
   ARRAY['basic_alerts', 'email_notifications', 'sms_notifications', 'advanced_reports', 'api_access'], 
   ARRAY['fire_detection', 'intrusion_detection', 'face_recognition', 'vehicle_recognition', 'crowd_detection'], 
   149.00, 2),
  ('Enterprise', 'enterprise', 'Full-featured enterprise solution', 100, 10, -1, 
   ARRAY['basic_alerts', 'email_notifications', 'sms_notifications', 'advanced_reports', 'api_access', 'white_label', 'custom_integrations', 'sla_support', 'model_training'], 
   ARRAY['fire_detection', 'intrusion_detection', 'face_recognition', 'vehicle_recognition', 'crowd_detection', 'ppe_detection', 'production_monitoring', 'warehouse_monitoring', 'drowning_detection'], 
   499.00, 3);

-- Insert AI modules
INSERT INTO ai_modules (module_key, name, description, category, is_premium, min_plan_level, icon, display_order) VALUES
  ('fire_detection', 'Fire & Smoke Detection', 'Detect fire and smoke in real-time', 'safety', false, 1, 'flame', 1),
  ('intrusion_detection', 'Intrusion Detection', 'Detect unauthorized access and perimeter breaches', 'security', false, 1, 'shield-alert', 2),
  ('face_recognition', 'Face Recognition', 'Identify and verify individuals', 'identification', true, 2, 'scan-face', 3),
  ('vehicle_recognition', 'Vehicle Recognition', 'License plate and vehicle identification', 'identification', true, 2, 'car', 4),
  ('crowd_detection', 'Crowd Detection', 'Monitor crowd density and movement', 'monitoring', true, 2, 'users', 5),
  ('ppe_detection', 'PPE Detection', 'Ensure personal protective equipment compliance', 'safety', true, 3, 'hard-hat', 6),
  ('production_monitoring', 'Production Line Monitoring', 'Monitor production lines and detect anomalies', 'industrial', true, 3, 'factory', 7),
  ('warehouse_monitoring', 'Warehouse Monitoring', 'Monitor warehouse operations and safety', 'industrial', true, 3, 'warehouse', 8),
  ('drowning_detection', 'Drowning Detection', 'Critical safety monitoring for swimming pools', 'safety', true, 3, 'waves', 9);

-- Update licenses table to link to plans
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS plan_id integer REFERENCES subscription_plans(id);
UPDATE licenses SET plan_id = 2 WHERE plan_id IS NULL;
