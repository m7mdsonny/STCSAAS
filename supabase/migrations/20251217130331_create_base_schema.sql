/*
  # Base Schema - Core Tables
  
  1. New Tables
    - `distributors` - Reseller/distributor companies
    - `organizations` - Tenant organizations
    - `users` - User accounts
    - `licenses` - License keys
    - `edge_servers` - Edge server registrations
    - `events` - Event logs from edge servers
    - `notifications` - User notifications
  
  2. Security
    - Enable RLS on all tables
    - Organization-scoped access policies
*/

-- Distributors (Resellers)
CREATE TABLE IF NOT EXISTS distributors (
  id SERIAL PRIMARY KEY,
  name text NOT NULL,
  contact_email text,
  contact_phone text,
  address text,
  commission_rate numeric(5,2) DEFAULT 0,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Organizations (Tenants)
CREATE TABLE IF NOT EXISTS organizations (
  id SERIAL PRIMARY KEY,
  distributor_id integer REFERENCES distributors(id),
  name text NOT NULL,
  slug text UNIQUE,
  contact_email text,
  contact_phone text,
  address text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  organization_id integer REFERENCES organizations(id),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  role text DEFAULT 'user',
  avatar_url text,
  phone text,
  is_active boolean DEFAULT true,
  email_verified_at timestamptz,
  last_login_at timestamptz,
  remember_token text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Licenses
CREATE TABLE IF NOT EXISTS licenses (
  id SERIAL PRIMARY KEY,
  organization_id integer REFERENCES organizations(id),
  license_key text UNIQUE NOT NULL,
  plan_id integer,
  max_cameras integer DEFAULT 10,
  max_edge_servers integer DEFAULT 1,
  expires_at timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Edge Servers
CREATE TABLE IF NOT EXISTS edge_servers (
  id SERIAL PRIMARY KEY,
  edge_id text UNIQUE NOT NULL,
  organization_id integer REFERENCES organizations(id),
  name text,
  location text,
  version text,
  ip_address text,
  online boolean DEFAULT false,
  last_seen_at timestamptz,
  system_info jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Events
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  edge_id text NOT NULL,
  organization_id integer,
  camera_id text,
  event_type text NOT NULL,
  severity text NOT NULL,
  title text,
  description text,
  occurred_at timestamptz NOT NULL,
  acknowledged_at timestamptz,
  acknowledged_by integer,
  resolved_at timestamptz,
  resolved_by integer,
  meta jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id integer REFERENCES users(id),
  organization_id integer REFERENCES organizations(id),
  channel text NOT NULL,
  title text,
  message text NOT NULL,
  type text DEFAULT 'info',
  read_at timestamptz,
  data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE distributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE edge_servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
CREATE POLICY "Users can view own organization"
  ON organizations FOR SELECT
  TO authenticated
  USING (id = (auth.jwt()->>'organization_id')::integer);

-- RLS Policies for users
CREATE POLICY "Users can view organization members"
  ON users FOR SELECT
  TO authenticated
  USING (organization_id = (auth.jwt()->>'organization_id')::integer);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id = (auth.jwt()->>'user_id')::integer)
  WITH CHECK (id = (auth.jwt()->>'user_id')::integer);

-- RLS Policies for licenses
CREATE POLICY "Users can view organization licenses"
  ON licenses FOR SELECT
  TO authenticated
  USING (organization_id = (auth.jwt()->>'organization_id')::integer);

-- RLS Policies for edge_servers
CREATE POLICY "Users can view organization edge servers"
  ON edge_servers FOR SELECT
  TO authenticated
  USING (organization_id = (auth.jwt()->>'organization_id')::integer);

-- RLS Policies for events
CREATE POLICY "Users can view organization events"
  ON events FOR SELECT
  TO authenticated
  USING (organization_id = (auth.jwt()->>'organization_id')::integer);

CREATE POLICY "Users can update organization events"
  ON events FOR UPDATE
  TO authenticated
  USING (organization_id = (auth.jwt()->>'organization_id')::integer)
  WITH CHECK (organization_id = (auth.jwt()->>'organization_id')::integer);

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = (auth.jwt()->>'user_id')::integer);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = (auth.jwt()->>'user_id')::integer)
  WITH CHECK (user_id = (auth.jwt()->>'user_id')::integer);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_edge_servers_organization ON edge_servers(organization_id);
CREATE INDEX IF NOT EXISTS idx_edge_servers_edge_id ON edge_servers(edge_id);
CREATE INDEX IF NOT EXISTS idx_events_organization ON events(organization_id);
CREATE INDEX IF NOT EXISTS idx_events_edge_id ON events(edge_id);
CREATE INDEX IF NOT EXISTS idx_events_occurred_at ON events(occurred_at);
CREATE INDEX IF NOT EXISTS idx_events_severity ON events(severity);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- Demo data
INSERT INTO distributors (name, contact_email) VALUES
  ('Demo Distributor', 'partner@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO organizations (distributor_id, name, slug, contact_email) VALUES
  (1, 'Demo Organization', 'demo-org', 'admin@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO users (organization_id, name, email, password, role) VALUES
  (1, 'Demo Admin', 'admin@example.com', '$2y$12$3vfMvDoZX6mE6xPD58Ll35yYtBXexlI33.fRbE5U8zVCUZiMHB9KW', 'admin')
ON CONFLICT DO NOTHING;

INSERT INTO licenses (organization_id, license_key, expires_at) VALUES
  (1, 'DEMO-LICENSE-1234', now() + interval '30 days')
ON CONFLICT DO NOTHING;

INSERT INTO edge_servers (edge_id, organization_id, name, version, online, last_seen_at) VALUES
  ('EDGE-DEMO-001', 1, 'Demo Edge Server', '1.0.0', true, now())
ON CONFLICT DO NOTHING;
