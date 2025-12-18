-- ============================================
-- STC AI-VAP Cloud Platform - Clean Database
-- PostgreSQL Database Dump
-- ============================================
-- Description: Production-ready database with test data
-- Version: 1.0.0
-- Date: 2024-12-17
-- ============================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS edge_servers CASCADE;
DROP TABLE IF EXISTS licenses CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS personal_access_tokens CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS distributors CASCADE;
DROP TABLE IF EXISTS ai_modules CASCADE;
DROP TABLE IF EXISTS organization_ai_modules CASCADE;
DROP TABLE IF EXISTS cameras CASCADE;
DROP TABLE IF EXISTS integrations CASCADE;
DROP TABLE IF EXISTS analytics_dashboards CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;

-- ============================================
-- 1. DISTRIBUTORS (Resellers)
-- ============================================
CREATE TABLE distributors (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    commission_rate NUMERIC(5,2) DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- 2. ORGANIZATIONS (Tenants)
-- ============================================
CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    distributor_id INTEGER REFERENCES distributors(id),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    status TEXT DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- 3. USERS
-- ============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    avatar_url TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    email_verified_at TIMESTAMP,
    last_login_at TIMESTAMP,
    remember_token TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- 4. LARAVEL SANCTUM TABLES
-- ============================================
CREATE TABLE personal_access_tokens (
    id SERIAL PRIMARY KEY,
    tokenable_type TEXT NOT NULL,
    tokenable_id BIGINT NOT NULL,
    name TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    abilities TEXT,
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_personal_access_tokens_tokenable ON personal_access_tokens(tokenable_type, tokenable_id);

-- ============================================
-- 5. SESSIONS (for web auth)
-- ============================================
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    user_id BIGINT,
    ip_address TEXT,
    user_agent TEXT,
    payload TEXT NOT NULL,
    last_activity INTEGER NOT NULL
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_last_activity ON sessions(last_activity);

-- ============================================
-- 6. LICENSES
-- ============================================
CREATE TABLE licenses (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id),
    license_key TEXT UNIQUE NOT NULL,
    plan_id INTEGER,
    max_cameras INTEGER DEFAULT 10,
    max_edge_servers INTEGER DEFAULT 1,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- 7. EDGE SERVERS
-- ============================================
CREATE TABLE edge_servers (
    id SERIAL PRIMARY KEY,
    edge_id TEXT UNIQUE NOT NULL,
    organization_id INTEGER REFERENCES organizations(id),
    name TEXT,
    location TEXT,
    version TEXT,
    ip_address TEXT,
    online BOOLEAN DEFAULT false,
    last_seen_at TIMESTAMP,
    system_info JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- 8. EVENTS
-- ============================================
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    edge_id TEXT NOT NULL,
    organization_id INTEGER,
    camera_id TEXT,
    event_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    title TEXT,
    description TEXT,
    occurred_at TIMESTAMP NOT NULL,
    acknowledged_at TIMESTAMP,
    acknowledged_by INTEGER,
    resolved_at TIMESTAMP,
    resolved_by INTEGER,
    meta JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- 9. NOTIFICATIONS
-- ============================================
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    organization_id INTEGER REFERENCES organizations(id),
    channel TEXT NOT NULL,
    title TEXT,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    read_at TIMESTAMP,
    data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- 10. AI MODULES
-- ============================================
CREATE TABLE ai_modules (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    category TEXT,
    is_active BOOLEAN DEFAULT true,
    default_config JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- 11. ORGANIZATION AI MODULES (Subscriptions)
-- ============================================
CREATE TABLE organization_ai_modules (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id),
    ai_module_id INTEGER REFERENCES ai_modules(id),
    is_enabled BOOLEAN DEFAULT true,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    UNIQUE(organization_id, ai_module_id)
);

-- ============================================
-- 12. CAMERAS
-- ============================================
CREATE TABLE cameras (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id),
    edge_server_id INTEGER REFERENCES edge_servers(id),
    name TEXT NOT NULL,
    camera_id TEXT UNIQUE NOT NULL,
    rtsp_url TEXT,
    location TEXT,
    status TEXT DEFAULT 'offline',
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- 13. INTEGRATIONS
-- ============================================
CREATE TABLE integrations (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- 14. ANALYTICS DASHBOARDS
-- ============================================
CREATE TABLE analytics_dashboards (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id),
    name TEXT NOT NULL,
    config JSONB DEFAULT '{}',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- 15. SUBSCRIPTION PLANS
-- ============================================
CREATE TABLE subscription_plans (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) DEFAULT 0,
    max_cameras INTEGER DEFAULT 10,
    max_users INTEGER DEFAULT 5,
    features JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_edge_servers_organization ON edge_servers(organization_id);
CREATE INDEX idx_edge_servers_edge_id ON edge_servers(edge_id);
CREATE INDEX idx_events_organization ON events(organization_id);
CREATE INDEX idx_events_edge_id ON events(edge_id);
CREATE INDEX idx_events_occurred_at ON events(occurred_at);
CREATE INDEX idx_events_severity ON events(severity);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_cameras_organization ON cameras(organization_id);
CREATE INDEX idx_cameras_edge_server ON cameras(edge_server_id);

-- ============================================
-- INSERT TEST DATA
-- ============================================

-- 1. Distributors
INSERT INTO distributors (id, name, contact_email, contact_phone, address, commission_rate, status) VALUES
(1, 'STC Solutions Master Distributor', 'partner@stc-solutions.com', '+966 11 000 0000', 'Riyadh, Saudi Arabia', 15.00, 'active');

-- 2. Organizations
INSERT INTO organizations (id, distributor_id, name, slug, contact_email, contact_phone, address, status) VALUES
(1, 1, 'Demo Corporation', 'demo-corp', 'contact@democorp.local', '+966 11 111 1111', 'King Fahd Road, Riyadh', 'active');

-- 3. Users (Super Admin & Organization Admin)
-- Password for superadmin@demo.local: Super@12345
-- Password for admin@org1.local: Admin@12345
-- Password for operator@org1.local: Admin@12345
-- Password for viewer@org1.local: Admin@12345
INSERT INTO users (id, organization_id, name, email, password, role, phone, is_active, email_verified_at) VALUES
(1, NULL, 'Super Administrator', 'superadmin@demo.local', '$2y$12$v.6QuWtKrrg7YZ8wTWoWxOIYAGnq1xCrA6V8TS8QbDeWUHsHFCpY.', 'super_admin', '+966 50 000 0001', true, now()),
(2, 1, 'Organization Administrator', 'admin@org1.local', '$2y$12$jX9.JiiNxIzibIXlwwM3Quq7/wQzDTr8tbllpOOY9V.wzwtg9424y', 'admin', '+966 50 000 0002', true, now()),
(3, 1, 'Security Operator', 'operator@org1.local', '$2y$12$jX9.JiiNxIzibIXlwwM3Quq7/wQzDTr8tbllpOOY9V.wzwtg9424y', 'operator', '+966 50 000 0003', true, now()),
(4, 1, 'Viewer User', 'viewer@org1.local', '$2y$12$jX9.JiiNxIzibIXlwwM3Quq7/wQzDTr8tbllpOOY9V.wzwtg9424y', 'viewer', '+966 50 000 0004', true, now());

-- 4. Licenses
INSERT INTO licenses (id, organization_id, license_key, plan_id, max_cameras, max_edge_servers, expires_at, is_active) VALUES
(1, 1, 'DEMO-CORP-2024-FULL-ACCESS', 1, 50, 5, now() + interval '1 year', true);

-- 5. Edge Servers
INSERT INTO edge_servers (id, edge_id, organization_id, name, location, version, ip_address, online, last_seen_at, system_info) VALUES
(1, 'EDGE-DEMO-MAIN-001', 1, 'Main Building Edge Server', 'Building A - Server Room', '1.0.0', '192.168.1.100', true, now(), '{"cpu":"Intel Core i7-10700","ram":"32GB","gpu":"NVIDIA RTX 3060","storage":"1TB SSD","os":"Ubuntu 22.04 LTS"}'),
(2, 'EDGE-DEMO-GATE-002', 1, 'Gate Entrance Edge Server', 'Main Gate', '1.0.0', '192.168.1.101', true, now(), '{"cpu":"Intel Core i5-10400","ram":"16GB","storage":"500GB SSD","os":"Ubuntu 22.04 LTS"}');

-- 6. AI Modules (All 9 Modules)
INSERT INTO ai_modules (id, name, display_name, description, icon, category, is_active) VALUES
(1, 'fire_detection', 'Fire & Smoke Detection', 'Detect fire and smoke in real-time', 'flame', 'safety', true),
(2, 'face_recognition', 'Face Recognition', 'Identify and track individuals', 'user', 'security', true),
(3, 'people_counting', 'People Counting', 'Count people entering/exiting areas', 'users', 'analytics', true),
(4, 'vehicle_anpr', 'Vehicle Recognition (ANPR)', 'Automatic Number Plate Recognition', 'car', 'security', true),
(5, 'attendance', 'Attendance System', 'Automated attendance tracking', 'clock', 'hr', true),
(6, 'intrusion', 'Intrusion Detection', 'Detect unauthorized access', 'alert-triangle', 'security', true),
(7, 'demographics', 'Age & Gender Detection', 'Demographic analytics', 'pie-chart', 'analytics', true),
(8, 'ppe_detection', 'PPE Detection', 'Safety equipment compliance', 'shield', 'safety', true),
(9, 'weapon_detection', 'Weapon Detection', 'Detect firearms and weapons', 'shield-alert', 'security', true);

-- 7. Enable AI Modules for Demo Organization
INSERT INTO organization_ai_modules (organization_id, ai_module_id, is_enabled) VALUES
(1, 1, true),
(1, 2, true),
(1, 3, true),
(1, 4, true),
(1, 5, true),
(1, 6, true),
(1, 7, true),
(1, 8, true),
(1, 9, true);

-- 8. Cameras
INSERT INTO cameras (id, organization_id, edge_server_id, name, camera_id, rtsp_url, location, status) VALUES
(1, 1, 1, 'Main Entrance Camera', 'CAM-001', 'rtsp://192.168.1.201:554/stream', 'Main Entrance', 'online'),
(2, 1, 1, 'Parking Lot Camera 1', 'CAM-002', 'rtsp://192.168.1.202:554/stream', 'Parking Area A', 'online'),
(3, 1, 1, 'Hallway Camera', 'CAM-003', 'rtsp://192.168.1.203:554/stream', 'First Floor Hallway', 'online'),
(4, 1, 2, 'Gate Camera', 'CAM-004', 'rtsp://192.168.1.204:554/stream', 'Main Gate', 'online'),
(5, 1, 2, 'Parking Lot Camera 2', 'CAM-005', 'rtsp://192.168.1.205:554/stream', 'Parking Area B', 'online'),
(6, 1, 1, 'Storage Room Camera', 'CAM-006', 'rtsp://192.168.1.206:554/stream', 'Storage Area', 'online'),
(7, 1, 1, 'Server Room Camera', 'CAM-007', 'rtsp://192.168.1.207:554/stream', 'Server Room', 'online'),
(8, 1, 2, 'Back Entrance Camera', 'CAM-008', 'rtsp://192.168.1.208:554/stream', 'Back Entrance', 'offline'),
(9, 1, 1, 'Reception Camera', 'CAM-009', 'rtsp://192.168.1.209:554/stream', 'Reception Area', 'online'),
(10, 1, 2, 'Emergency Exit Camera', 'CAM-010', 'rtsp://192.168.1.210:554/stream', 'Emergency Exit', 'online');

-- 9. Integrations
INSERT INTO integrations (id, organization_id, name, type, config, is_active) VALUES
(1, 1, 'Main Gate Arduino', 'arduino', '{"port":"/dev/ttyUSB0","baud_rate":9600}', true),
(2, 1, 'SMS Gateway', 'sms', '{"provider":"twilio","api_key":"demo_key"}', true),
(3, 1, 'WhatsApp Business', 'whatsapp', '{"phone":"+966500000000"}', true),
(4, 1, 'Email Notifications', 'email', '{"smtp_host":"smtp.gmail.com","smtp_port":587}', true);

-- 10. Subscription Plans
INSERT INTO subscription_plans (id, name, display_name, description, price, max_cameras, max_users, features) VALUES
(1, 'basic', 'Basic Plan', 'Essential features for small businesses', 99.00, 10, 5, '["face_recognition","people_counting","alerts"]'),
(2, 'professional', 'Professional Plan', 'Advanced features for medium businesses', 299.00, 30, 15, '["all_ai_modules","integrations","analytics"]'),
(3, 'enterprise', 'Enterprise Plan', 'Complete solution for large organizations', 999.00, 100, 50, '["all_ai_modules","integrations","advanced_analytics","priority_support","custom_training"]');

-- 11. Events (Sample events for different modules)
INSERT INTO events (edge_id, organization_id, camera_id, event_type, severity, title, description, occurred_at, meta) VALUES
-- Fire Detection
('EDGE-DEMO-MAIN-001', 1, 'CAM-006', 'fire_detection', 'critical', 'Fire Detected', 'Fire detected in storage area', now() - interval '2 hours', '{"confidence":0.95,"location":"Storage Area"}'),
('EDGE-DEMO-MAIN-001', 1, 'CAM-007', 'fire_detection', 'critical', 'Smoke Detected', 'Smoke detected in server room', now() - interval '5 hours', '{"confidence":0.88,"location":"Server Room"}'),

-- Face Recognition
('EDGE-DEMO-MAIN-001', 1, 'CAM-001', 'face_recognition', 'info', 'Employee Entry', 'John Doe entered building', now() - interval '1 hour', '{"person_id":"EMP001","confidence":0.97}'),
('EDGE-DEMO-GATE-002', 1, 'CAM-004', 'face_recognition', 'warning', 'Blacklisted Person', 'Unknown person on blacklist detected', now() - interval '3 hours', '{"person_id":"UNKNOWN","confidence":0.92}'),

-- Intrusion
('EDGE-DEMO-MAIN-001', 1, 'CAM-006', 'intrusion', 'high', 'Intrusion Alert', 'Unauthorized access to restricted area', now() - interval '4 hours', '{"zone":"restricted","confidence":0.93}'),
('EDGE-DEMO-GATE-002', 1, 'CAM-008', 'intrusion', 'high', 'Perimeter Breach', 'Person detected in restricted perimeter', now() - interval '6 hours', '{"zone":"perimeter","confidence":0.89}'),

-- Vehicle ANPR
('EDGE-DEMO-GATE-002', 1, 'CAM-004', 'vehicle_anpr', 'info', 'Vehicle Entry', 'Vehicle ABC-1234 entered parking', now() - interval '30 minutes', '{"plate":"ABC-1234","confidence":0.96}'),
('EDGE-DEMO-GATE-002', 1, 'CAM-004', 'vehicle_anpr', 'info', 'Vehicle Exit', 'Vehicle XYZ-5678 exited parking', now() - interval '45 minutes', '{"plate":"XYZ-5678","confidence":0.94}'),

-- PPE Detection
('EDGE-DEMO-MAIN-001', 1, 'CAM-006', 'ppe_detection', 'medium', 'PPE Violation', 'Worker without helmet detected', now() - interval '2 hours', '{"violation":"no_helmet","confidence":0.91}'),
('EDGE-DEMO-MAIN-001', 1, 'CAM-006', 'ppe_detection', 'medium', 'PPE Violation', 'Worker without safety vest', now() - interval '3 hours', '{"violation":"no_vest","confidence":0.88}'),

-- Weapon Detection
('EDGE-DEMO-MAIN-001', 1, 'CAM-001', 'weapon_detection', 'critical', 'Weapon Detected', 'Firearm detected at entrance', now() - interval '1 hour', '{"weapon_type":"firearm","confidence":0.94}'),

-- People Counting
('EDGE-DEMO-MAIN-001', 1, 'CAM-001', 'people_counting', 'info', 'Occupancy Update', 'Current occupancy: 45 people', now() - interval '15 minutes', '{"count":45,"direction":"in"}'),
('EDGE-DEMO-MAIN-001', 1, 'CAM-001', 'people_counting', 'info', 'Occupancy Update', 'Current occupancy: 43 people', now() - interval '10 minutes', '{"count":43,"direction":"out"}');

-- 12. Notifications
INSERT INTO notifications (user_id, organization_id, channel, title, message, type, created_at) VALUES
(2, 1, 'push', 'Critical Alert', 'Fire detected in storage area - immediate action required', 'critical', now() - interval '2 hours'),
(2, 1, 'email', 'Security Alert', 'Unauthorized access attempt detected', 'warning', now() - interval '4 hours'),
(3, 1, 'push', 'System Notification', 'Edge server back online', 'info', now() - interval '1 hour'),
(2, 1, 'sms', 'Weapon Alert', 'Weapon detected at main entrance', 'critical', now() - interval '1 hour'),
(3, 1, 'push', 'PPE Violation', 'Safety equipment violation in storage area', 'warning', now() - interval '3 hours');

-- Reset sequences
SELECT setval('distributors_id_seq', (SELECT MAX(id) FROM distributors));
SELECT setval('organizations_id_seq', (SELECT MAX(id) FROM organizations));
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('licenses_id_seq', (SELECT MAX(id) FROM licenses));
SELECT setval('edge_servers_id_seq', (SELECT MAX(id) FROM edge_servers));
SELECT setval('ai_modules_id_seq', (SELECT MAX(id) FROM ai_modules));
SELECT setval('cameras_id_seq', (SELECT MAX(id) FROM cameras));
SELECT setval('integrations_id_seq', (SELECT MAX(id) FROM integrations));
SELECT setval('subscription_plans_id_seq', (SELECT MAX(id) FROM subscription_plans));

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify the data:
-- SELECT * FROM users WHERE role = 'super_admin';
-- SELECT * FROM organizations;
-- SELECT * FROM ai_modules;
-- SELECT * FROM events ORDER BY occurred_at DESC LIMIT 10;
-- ============================================
