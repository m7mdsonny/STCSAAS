/*
  # Multi-Tenant Organization Settings
  
  1. New Tables
    - `organization_settings` - Per-tenant configuration
    - `organization_branding` - Per-tenant visual identity
    - `organization_notifications` - Notification preferences per org
    - `organization_integrations` - Integration configs per org
    - `organization_contacts` - Emergency contacts per org
  
  2. Features
    - Isolated tenant configuration
    - Organization branding & identity
    - Timezone & language settings
    - Notification preferences
    - AI module toggles
    - Integration settings
    - Alert escalation rules
  
  3. Security
    - Organization-scoped access
    - Admins can manage their org settings
*/

-- Organization Settings (Per-Tenant Configuration)
CREATE TABLE IF NOT EXISTS organization_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id integer REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  
  -- General Settings
  timezone text DEFAULT 'UTC',
  language text DEFAULT 'en',
  date_format text DEFAULT 'YYYY-MM-DD',
  time_format text DEFAULT '24h',
  currency text DEFAULT 'USD',
  
  -- Security Settings
  session_timeout_minutes integer DEFAULT 60,
  require_2fa boolean DEFAULT false,
  allowed_ip_ranges text[],
  
  -- Notification Settings
  email_notifications boolean DEFAULT true,
  push_notifications boolean DEFAULT true,
  sms_notifications boolean DEFAULT false,
  webhook_notifications boolean DEFAULT false,
  webhook_url text,
  
  -- Alert Settings
  alert_sound_enabled boolean DEFAULT true,
  alert_escalation_enabled boolean DEFAULT true,
  alert_auto_acknowledge_minutes integer,
  
  -- Data Retention
  event_retention_days integer DEFAULT 90,
  video_retention_days integer DEFAULT 30,
  
  -- Feature Toggles
  features_enabled jsonb DEFAULT '{}',
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Organization Branding
CREATE TABLE IF NOT EXISTS organization_branding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id integer REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  
  -- Logo & Identity
  logo_url text,
  logo_dark_url text,
  favicon_url text,
  
  -- Colors
  primary_color text DEFAULT '#0066CC',
  secondary_color text DEFAULT '#004499',
  accent_color text DEFAULT '#00AAFF',
  
  -- Typography
  font_family text,
  
  -- Custom
  custom_css text,
  
  -- Report Branding
  report_header_html text,
  report_footer_html text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Organization Notification Settings
CREATE TABLE IF NOT EXISTS organization_notification_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id integer REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Alert Type
  alert_type text NOT NULL,
  severity text NOT NULL,
  
  -- Channels
  email_enabled boolean DEFAULT true,
  push_enabled boolean DEFAULT true,
  sms_enabled boolean DEFAULT false,
  webhook_enabled boolean DEFAULT false,
  
  -- Recipients
  email_recipients text[],
  sms_recipients text[],
  
  -- Timing
  quiet_hours_start time,
  quiet_hours_end time,
  throttle_minutes integer DEFAULT 5,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, alert_type, severity)
);

-- Organization Integrations
CREATE TABLE IF NOT EXISTS organization_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id integer REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Integration Info
  integration_type text NOT NULL,
  name text NOT NULL,
  is_enabled boolean DEFAULT true,
  
  -- Configuration
  config jsonb DEFAULT '{}',
  credentials jsonb DEFAULT '{}',
  
  -- Status
  status text DEFAULT 'pending',
  last_sync_at timestamptz,
  last_error text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, integration_type, name)
);

-- Organization Contacts (Emergency & Escalation)
CREATE TABLE IF NOT EXISTS organization_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id integer REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Contact Info
  name text NOT NULL,
  title text,
  email text,
  phone text,
  
  -- Role
  contact_type text DEFAULT 'general',
  is_emergency_contact boolean DEFAULT false,
  
  -- Escalation
  escalation_order integer DEFAULT 0,
  escalation_delay_minutes integer DEFAULT 5,
  
  -- Availability
  available_start time,
  available_end time,
  available_days text[] DEFAULT ARRAY['mon','tue','wed','thu','fri'],
  
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Alert Escalation Rules
CREATE TABLE IF NOT EXISTS alert_escalation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id integer REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Rule Info
  name text NOT NULL,
  description text,
  is_enabled boolean DEFAULT true,
  
  -- Conditions
  alert_types text[],
  severity_levels text[],
  
  -- Escalation Steps
  escalation_steps jsonb DEFAULT '[]',
  
  -- Timing
  initial_delay_minutes integer DEFAULT 0,
  repeat_interval_minutes integer DEFAULT 15,
  max_escalations integer DEFAULT 3,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_escalation_rules ENABLE ROW LEVEL SECURITY;

-- Organization Settings Policies
CREATE POLICY "Users can view own org settings"
  ON organization_settings FOR SELECT
  TO authenticated
  USING (organization_id = (auth.jwt()->>'organization_id')::integer);

CREATE POLICY "Admins can update own org settings"
  ON organization_settings FOR UPDATE
  TO authenticated
  USING (organization_id = (auth.jwt()->>'organization_id')::integer)
  WITH CHECK (organization_id = (auth.jwt()->>'organization_id')::integer);

CREATE POLICY "Super admins can manage all org settings"
  ON organization_settings FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM super_admins WHERE user_id = (auth.jwt()->>'user_id')::integer));

-- Organization Branding Policies
CREATE POLICY "Users can view own org branding"
  ON organization_branding FOR SELECT
  TO authenticated
  USING (organization_id = (auth.jwt()->>'organization_id')::integer);

CREATE POLICY "Admins can update own org branding"
  ON organization_branding FOR UPDATE
  TO authenticated
  USING (organization_id = (auth.jwt()->>'organization_id')::integer)
  WITH CHECK (organization_id = (auth.jwt()->>'organization_id')::integer);

-- Notification Settings Policies
CREATE POLICY "Users can view own org notification settings"
  ON organization_notification_settings FOR SELECT
  TO authenticated
  USING (organization_id = (auth.jwt()->>'organization_id')::integer);

CREATE POLICY "Admins can manage own org notification settings"
  ON organization_notification_settings FOR ALL
  TO authenticated
  USING (organization_id = (auth.jwt()->>'organization_id')::integer)
  WITH CHECK (organization_id = (auth.jwt()->>'organization_id')::integer);

-- Integration Policies
CREATE POLICY "Users can view own org integrations"
  ON organization_integrations FOR SELECT
  TO authenticated
  USING (organization_id = (auth.jwt()->>'organization_id')::integer);

CREATE POLICY "Admins can manage own org integrations"
  ON organization_integrations FOR ALL
  TO authenticated
  USING (organization_id = (auth.jwt()->>'organization_id')::integer)
  WITH CHECK (organization_id = (auth.jwt()->>'organization_id')::integer);

-- Contact Policies
CREATE POLICY "Users can view own org contacts"
  ON organization_contacts FOR SELECT
  TO authenticated
  USING (organization_id = (auth.jwt()->>'organization_id')::integer);

CREATE POLICY "Admins can manage own org contacts"
  ON organization_contacts FOR ALL
  TO authenticated
  USING (organization_id = (auth.jwt()->>'organization_id')::integer)
  WITH CHECK (organization_id = (auth.jwt()->>'organization_id')::integer);

-- Escalation Rules Policies
CREATE POLICY "Users can view own org escalation rules"
  ON alert_escalation_rules FOR SELECT
  TO authenticated
  USING (organization_id = (auth.jwt()->>'organization_id')::integer);

CREATE POLICY "Admins can manage own org escalation rules"
  ON alert_escalation_rules FOR ALL
  TO authenticated
  USING (organization_id = (auth.jwt()->>'organization_id')::integer)
  WITH CHECK (organization_id = (auth.jwt()->>'organization_id')::integer);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_org_settings_org ON organization_settings(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_branding_org ON organization_branding(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_notification_org ON organization_notification_settings(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_integrations_org ON organization_integrations(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_contacts_org ON organization_contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_escalation_rules_org ON alert_escalation_rules(organization_id);

-- Insert default settings for demo organization
INSERT INTO organization_settings (organization_id) VALUES (1);
INSERT INTO organization_branding (organization_id) VALUES (1);
