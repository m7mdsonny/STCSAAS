-- PostgreSQL schema + demo data for Laravel SaaS
CREATE TABLE IF NOT EXISTS distributors (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    contact_email TEXT
);

CREATE TABLE IF NOT EXISTS organizations (
    id SERIAL PRIMARY KEY,
    distributor_id INTEGER REFERENCES distributors(id),
    name TEXT NOT NULL,
    contact_email TEXT
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    remember_token TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS licenses (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id),
    license_key TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS edge_servers (
    id SERIAL PRIMARY KEY,
    edge_id TEXT UNIQUE NOT NULL,
    organization_id INTEGER REFERENCES organizations(id),
    version TEXT,
    online BOOLEAN DEFAULT false,
    last_seen_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    edge_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    occurred_at TIMESTAMP NOT NULL,
    meta JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    channel TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

INSERT INTO distributors (name, contact_email) VALUES
('Demo Distributor', 'partner@example.com') ON CONFLICT DO NOTHING;

INSERT INTO organizations (distributor_id, name, contact_email) VALUES
(1, 'Demo Organization', 'admin@example.com') ON CONFLICT DO NOTHING;

INSERT INTO users (organization_id, name, email, password, role) VALUES
(1, 'Demo Admin', 'admin@example.com', '$2y$12$3vfMvDoZX6mE6xPD58Ll35yYtBXexlI33.fRbE5U8zVCUZiMHB9KW', 'admin')
ON CONFLICT DO NOTHING;

INSERT INTO licenses (organization_id, license_key, expires_at) VALUES
(1, 'DEMO-LICENSE-1234', now() + interval '30 days') ON CONFLICT DO NOTHING;

INSERT INTO edge_servers (edge_id, organization_id, version, online, last_seen_at) VALUES
('EDGE-DEMO-001', 1, '1.0.0', true, now()) ON CONFLICT DO NOTHING;

INSERT INTO events (edge_id, event_type, severity, occurred_at, meta) VALUES
('EDGE-DEMO-001', 'fire', 'critical', now(), '{"camera":"cam-1"}') ON CONFLICT DO NOTHING;

INSERT INTO notifications (user_id, channel, message) VALUES
(1, 'push', 'Welcome to STC AI-VAP demo') ON CONFLICT DO NOTHING;
