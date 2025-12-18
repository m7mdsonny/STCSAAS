/*
  # Super Admin System Settings & Platform Configuration
  
  1. New Tables
    - `system_settings` - Global platform configuration (single row)
    - `platform_branding` - Platform visual identity
    - `super_admins` - Super admin users (platform level)
  
  2. Features
    - Global system configuration
    - Platform branding & identity
    - Super admin management
    - White-label readiness
  
  3. Security
    - Enable RLS on all tables
    - Only super admins can access system settings
*/

-- System Settings (Global Platform Configuration)
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_name text NOT NULL DEFAULT 'AI-VAP Platform',
  platform_tagline text DEFAULT 'Intelligent Video Analytics Platform',
  support_email text DEFAULT 'support@platform.com',
  support_phone text,
  default_timezone text DEFAULT 'UTC',
  default_language text DEFAULT 'en',
  maintenance_mode boolean DEFAULT false,
  maintenance_message text DEFAULT 'System is under maintenance. Please try again later.',
  session_timeout_minutes integer DEFAULT 60,
  max_login_attempts integer DEFAULT 5,
  password_min_length integer DEFAULT 8,
  require_2fa boolean DEFAULT false,
  allow_registration boolean DEFAULT true,
  require_email_verification boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Platform Branding
CREATE TABLE IF NOT EXISTS platform_branding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_url text,
  logo_dark_url text,
  favicon_url text,
  primary_color text DEFAULT '#0066CC',
  secondary_color text DEFAULT '#004499',
  accent_color text DEFAULT '#00AAFF',
  danger_color text DEFAULT '#DC2626',
  warning_color text DEFAULT '#F59E0B',
  success_color text DEFAULT '#10B981',
  font_family text DEFAULT 'Inter, system-ui, sans-serif',
  heading_font text DEFAULT 'Inter, system-ui, sans-serif',
  border_radius text DEFAULT '8px',
  custom_css text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Super Admins
CREATE TABLE IF NOT EXISTS super_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id integer REFERENCES users(id) ON DELETE CASCADE,
  permissions jsonb DEFAULT '{"all": true}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;

-- Public read for branding (needed for landing page)
CREATE POLICY "Anyone can view platform branding"
  ON platform_branding FOR SELECT
  USING (true);

-- Public read for system settings (maintenance mode check)
CREATE POLICY "Anyone can view system settings"
  ON system_settings FOR SELECT
  USING (true);

-- Super admin management policies
CREATE POLICY "Super admins can update system settings"
  ON system_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM super_admins WHERE user_id = (auth.jwt()->>'user_id')::integer)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM super_admins WHERE user_id = (auth.jwt()->>'user_id')::integer)
  );

CREATE POLICY "Super admins can update platform branding"
  ON platform_branding FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM super_admins WHERE user_id = (auth.jwt()->>'user_id')::integer)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM super_admins WHERE user_id = (auth.jwt()->>'user_id')::integer)
  );

CREATE POLICY "Super admins can view super admin list"
  ON super_admins FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM super_admins WHERE user_id = (auth.jwt()->>'user_id')::integer)
  );

CREATE POLICY "Super admins can manage super admins"
  ON super_admins FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM super_admins WHERE user_id = (auth.jwt()->>'user_id')::integer)
  );

CREATE POLICY "Super admins can delete super admins"
  ON super_admins FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM super_admins WHERE user_id = (auth.jwt()->>'user_id')::integer)
  );

-- Insert default system settings
INSERT INTO system_settings (id) VALUES (gen_random_uuid());

-- Insert default platform branding
INSERT INTO platform_branding (id) VALUES (gen_random_uuid());

-- Make demo admin a super admin
INSERT INTO super_admins (user_id) VALUES (1);
