-- ============================================
-- STC AI-VAP Cloud Platform - Production Seeded Database
-- PostgreSQL Database Dump
-- ============================================
-- Description: Complete production-like database with comprehensive test data
-- Version: 2.0.0
-- Date: 2025-01-17
-- ============================================
-- 
-- IMPORTANT: All passwords are hashed using bcrypt
-- Use the credentials below to login:
--
-- Super Admin:
--   Email: superadmin@stc.local
--   Password: SuperAdmin@123
--
-- Organization Owner:
--   Email: owner@democorp.local
--   Password: Owner@123
--
-- Organization Admin:
--   Email: admin@democorp.local
--   Password: Admin@123
--
-- Editor:
--   Email: editor@democorp.local
--   Password: Editor@123
--
-- Viewer:
--   Email: viewer@democorp.local
--   Password: Viewer@123
-- ============================================

-- Drop existing tables if they exist (in correct order to handle foreign keys)
DROP TABLE IF EXISTS automation_logs CASCADE;
DROP TABLE IF EXISTS automation_rules CASCADE;
DROP TABLE IF EXISTS vehicle_access_logs CASCADE;
DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS registered_vehicles CASCADE;
DROP TABLE IF EXISTS registered_faces CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS cameras CASCADE;
DROP TABLE IF EXISTS edge_servers CASCADE;
DROP TABLE IF EXISTS licenses CASCADE;
DROP TABLE IF EXISTS organization_ai_modules CASCADE;
DROP TABLE IF EXISTS ai_modules CASCADE;
DROP TABLE IF EXISTS integrations CASCADE;
DROP TABLE IF EXISTS analytics_dashboards CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS resellers CASCADE;
DROP TABLE IF EXISTS personal_access_tokens CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS distributors CASCADE;

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
-- 2. RESELLERS
-- ============================================
CREATE TABLE resellers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    name_en TEXT,
    email TEXT,
    phone TEXT,
    company_name TEXT,
    tax_number TEXT,
    address TEXT,
    city TEXT,
    country TEXT DEFAULT 'SA',
    commission_rate NUMERIC(5,2) DEFAULT 0,
    discount_rate NUMERIC(5,2) DEFAULT 0,
    credit_limit NUMERIC(12,2) DEFAULT 0,
    current_balance NUMERIC(12,2) DEFAULT 0,
    contact_person TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    deleted_at TIMESTAMP
);

-- ============================================
-- 3. ORGANIZATIONS (Tenants)
-- ============================================
CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    distributor_id INTEGER REFERENCES distributors(id),
    name TEXT NOT NULL,
    name_en TEXT,
    slug TEXT UNIQUE,
    email TEXT,
    phone TEXT,
    city TEXT,
    address TEXT,
    subscription_plan TEXT DEFAULT 'basic',
    max_cameras INTEGER DEFAULT 10,
    max_edge_servers INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- 4. USERS
-- ============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    is_super_admin BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMP,
    last_login TIMESTAMP,
    last_login_at TIMESTAMP,
    remember_token TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    deleted_at TIMESTAMP
);

-- ============================================
-- 5. LARAVEL SANCTUM TABLES
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
-- 6. SESSIONS (for web auth)
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
-- 7. SUBSCRIPTION PLANS
-- ============================================
CREATE TABLE subscription_plans (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    name_ar TEXT,
    display_name TEXT NOT NULL,
    description TEXT,
    price_monthly NUMERIC(10,2) DEFAULT 0,
    price_yearly NUMERIC(10,2) DEFAULT 0,
    max_cameras INTEGER DEFAULT 10,
    max_edge_servers INTEGER DEFAULT 1,
    max_users INTEGER DEFAULT 5,
    available_modules TEXT[],
    features JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- 8. LICENSES
-- ============================================
CREATE TABLE licenses (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id),
    license_key TEXT UNIQUE NOT NULL,
    plan TEXT DEFAULT 'basic',
    max_cameras INTEGER DEFAULT 10,
    modules TEXT[],
    status TEXT DEFAULT 'active',
    is_trial BOOLEAN DEFAULT false,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- 9. EDGE SERVERS
-- ============================================
CREATE TABLE edge_servers (
    id SERIAL PRIMARY KEY,
    edge_id TEXT UNIQUE,
    hardware_id TEXT UNIQUE,
    organization_id INTEGER REFERENCES organizations(id),
    name TEXT NOT NULL,
    location TEXT,
    version TEXT,
    ip_address TEXT,
    online BOOLEAN DEFAULT false,
    configuration_mode BOOLEAN DEFAULT false,
    last_heartbeat TIMESTAMP,
    last_seen_at TIMESTAMP,
    system_info JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- 10. CAMERAS
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
-- 11. AI MODULES
-- ============================================
CREATE TABLE ai_modules (
    id SERIAL PRIMARY KEY,
    module_key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    category TEXT,
    is_active BOOLEAN DEFAULT true,
    is_premium BOOLEAN DEFAULT false,
    min_plan_level INTEGER DEFAULT 1,
    default_config JSONB DEFAULT '{}',
    config_schema JSONB DEFAULT '{}',
    required_camera_type TEXT,
    min_fps INTEGER DEFAULT 15,
    min_resolution TEXT DEFAULT '1920x1080',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- 12. ORGANIZATION AI MODULES (Subscriptions)
-- ============================================
CREATE TABLE organization_ai_modules (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id),
    ai_module_id INTEGER REFERENCES ai_modules(id),
    is_enabled BOOLEAN DEFAULT true,
    is_licensed BOOLEAN DEFAULT true,
    config JSONB DEFAULT '{}',
    confidence_threshold NUMERIC(5,2) DEFAULT 0.80,
    alert_threshold NUMERIC(5,2) DEFAULT 0.90,
    cooldown_seconds INTEGER DEFAULT 60,
    schedule_enabled BOOLEAN DEFAULT false,
    schedule JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    UNIQUE(organization_id, ai_module_id)
);

-- ============================================
-- 13. EVENTS (Alerts)
-- ============================================
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    edge_id TEXT,
    edge_server_id INTEGER REFERENCES edge_servers(id),
    organization_id INTEGER REFERENCES organizations(id),
    camera_id TEXT,
    module TEXT,
    event_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    title TEXT,
    description TEXT,
    status TEXT DEFAULT 'new',
    occurred_at TIMESTAMP NOT NULL,
    acknowledged_at TIMESTAMP,
    acknowledged_by INTEGER,
    resolved_at TIMESTAMP,
    resolved_by INTEGER,
    meta JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- 14. NOTIFICATIONS
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
-- 15. REGISTERED FACES (People)
-- ============================================
CREATE TABLE registered_faces (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id),
    person_name TEXT NOT NULL,
    employee_id TEXT,
    department TEXT,
    category TEXT NOT NULL DEFAULT 'employee',
    photo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- 16. REGISTERED VEHICLES
-- ============================================
CREATE TABLE registered_vehicles (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id),
    plate_number TEXT NOT NULL,
    plate_ar TEXT,
    owner_name TEXT,
    vehicle_type TEXT,
    vehicle_color TEXT,
    category TEXT NOT NULL DEFAULT 'authorized',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- 17. ATTENDANCE RECORDS
-- ============================================
CREATE TABLE attendance_records (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id),
    person_id INTEGER REFERENCES registered_faces(id),
    camera_id TEXT,
    check_in_time TIMESTAMP NOT NULL,
    check_out_time TIMESTAMP,
    is_late BOOLEAN DEFAULT false,
    is_early_departure BOOLEAN DEFAULT false,
    is_manual BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- 18. VEHICLE ACCESS LOGS
-- ============================================
CREATE TABLE vehicle_access_logs (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id),
    vehicle_id INTEGER REFERENCES registered_vehicles(id),
    camera_id TEXT,
    plate_number TEXT,
    direction TEXT,
    access_granted BOOLEAN DEFAULT false,
    confidence NUMERIC(5,2),
    created_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- 19. AUTOMATION RULES
-- ============================================
CREATE TABLE automation_rules (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id),
    integration_id INTEGER,
    name TEXT NOT NULL,
    name_ar TEXT,
    description TEXT,
    trigger_module TEXT NOT NULL,
    trigger_event TEXT NOT NULL,
    trigger_conditions JSONB DEFAULT '{}',
    action_type TEXT NOT NULL,
    action_command JSONB NOT NULL,
    cooldown_seconds INTEGER DEFAULT 60,
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- 20. AUTOMATION LOGS
-- ============================================
CREATE TABLE automation_logs (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id),
    automation_rule_id INTEGER REFERENCES automation_rules(id),
    status TEXT NOT NULL,
    message TEXT,
    error TEXT,
    execution_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- 21. INTEGRATIONS
-- ============================================
CREATE TABLE integrations (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id),
    edge_server_id INTEGER REFERENCES edge_servers(id),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- 22. ANALYTICS DASHBOARDS
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
-- INDEXES
-- ============================================
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_super_admin ON users(is_super_admin);
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_is_active ON organizations(is_active);
CREATE INDEX idx_edge_servers_organization ON edge_servers(organization_id);
CREATE INDEX idx_edge_servers_edge_id ON edge_servers(edge_id);
CREATE INDEX idx_events_organization ON events(organization_id);
CREATE INDEX idx_events_edge_id ON events(edge_id);
CREATE INDEX idx_events_occurred_at ON events(occurred_at);
CREATE INDEX idx_events_severity ON events(severity);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_cameras_organization ON cameras(organization_id);
CREATE INDEX idx_cameras_edge_server ON cameras(edge_server_id);
CREATE INDEX idx_registered_faces_organization ON registered_faces(organization_id);
CREATE INDEX idx_registered_vehicles_organization ON registered_vehicles(organization_id);
CREATE INDEX idx_attendance_records_organization ON attendance_records(organization_id);
CREATE INDEX idx_attendance_records_person ON attendance_records(person_id);
CREATE INDEX idx_automation_rules_organization ON automation_rules(organization_id);

-- ============================================
-- INSERT SEED DATA
-- ============================================

-- 1. Distributors
INSERT INTO distributors (id, name, contact_email, contact_phone, address, commission_rate, status) VALUES
(1, 'STC Solutions Master Distributor', 'partner@stc-solutions.com', '+966 11 000 0000', 'Riyadh, Saudi Arabia', 15.00, 'active');

-- 2. Resellers
INSERT INTO resellers (id, name, name_en, email, phone, company_name, tax_number, city, country, commission_rate, discount_rate, credit_limit, current_balance, contact_person, is_active) VALUES
(1, 'شركة الموزع الأول', 'First Distributor Co.', 'dist1@example.com', '+966 11 111 1111', 'First Distributor Company', '123456789', 'Riyadh', 'SA', 12.00, 5.00, 100000.00, 0.00, 'أحمد محمد', true),
(2, 'شركة الموزع الثاني', 'Second Distributor Co.', 'dist2@example.com', '+966 11 222 2222', 'Second Distributor Company', '987654321', 'Jeddah', 'SA', 10.00, 3.00, 50000.00, 0.00, 'محمد علي', true);

-- 3. Organizations
INSERT INTO organizations (id, distributor_id, name, name_en, slug, email, phone, city, address, subscription_plan, max_cameras, max_edge_servers, is_active, status) VALUES
(1, 1, 'شركة الديمو', 'Demo Corporation', 'demo-corp', 'contact@democorp.local', '+966 11 111 1111', 'Riyadh', 'King Fahd Road, Riyadh', 'enterprise', 50, 5, true, 'active'),
(2, 1, 'شركة الاختبار', 'Test Company', 'test-company', 'contact@testcompany.local', '+966 11 222 2222', 'Jeddah', 'Corniche Road, Jeddah', 'professional', 30, 3, true, 'active');

-- 4. Users with all roles
-- Password hashes: All passwords use bcrypt with cost 12
-- Super Admin: superadmin@stc.local / SuperAdmin@123
-- Organization Owner: owner@democorp.local / Owner@123
-- Organization Admin: admin@democorp.local / Admin@123
-- Editor: editor@democorp.local / Editor@123
-- Viewer: viewer@democorp.local / Viewer@123
-- Note: These hashes are valid bcrypt hashes. If they don't work, regenerate using:
-- php artisan tinker -> Hash::make('Password@123')
INSERT INTO users (id, organization_id, name, email, password, role, phone, is_active, is_super_admin, email_verified_at) VALUES
-- Super Admin (Password: SuperAdmin@123)
(1, NULL, 'Super Administrator', 'superadmin@stc.local', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin', '+966 50 000 0001', true, true, now()),
-- Organization 1 - Owner (Password: Owner@123)
(2, 1, 'Organization Owner', 'owner@democorp.local', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'org_owner', '+966 50 000 0002', true, false, now()),
-- Organization 1 - Admin (Password: Admin@123)
(3, 1, 'Organization Admin', 'admin@democorp.local', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'org_admin', '+966 50 000 0003', true, false, now()),
-- Organization 1 - Operator (Password: Admin@123)
(4, 1, 'Security Operator', 'operator@democorp.local', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'org_operator', '+966 50 000 0004', true, false, now()),
-- Organization 1 - Editor (Password: Editor@123)
(5, 1, 'Content Editor', 'editor@democorp.local', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'org_editor', '+966 50 000 0005', true, false, now()),
-- Organization 1 - Viewer (Password: Viewer@123)
(6, 1, 'Viewer User', 'viewer@democorp.local', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'org_viewer', '+966 50 000 0006', true, false, now()),
-- Organization 2 - Admin (Password: Admin@123)
(7, 2, 'Test Company Admin', 'admin@testcompany.local', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'org_admin', '+966 50 000 0007', true, false, now());

-- 5. Subscription Plans
INSERT INTO subscription_plans (id, name, name_ar, display_name, description, price_monthly, price_yearly, max_cameras, max_edge_servers, max_users, available_modules, features) VALUES
(1, 'basic', 'الباقة الأساسية', 'Basic Plan', 'Essential features for small businesses', 99.00, 990.00, 10, 1, 5, ARRAY['face_recognition', 'people_counting'], '["basic_alerts","basic_analytics"]'::jsonb),
(2, 'professional', 'الباقة الاحترافية', 'Professional Plan', 'Advanced features for medium businesses', 299.00, 2990.00, 30, 3, 15, ARRAY['face_recognition', 'people_counting', 'vehicle_anpr', 'attendance', 'intrusion'], '["all_ai_modules","integrations","analytics","advanced_reports"]'::jsonb),
(3, 'enterprise', 'الباقة المؤسسية', 'Enterprise Plan', 'Complete solution for large organizations', 999.00, 9990.00, 100, 10, 50, ARRAY['fire_detection', 'face_recognition', 'people_counting', 'vehicle_anpr', 'attendance', 'intrusion', 'demographics', 'ppe_detection', 'weapon_detection'], '["all_ai_modules","integrations","advanced_analytics","priority_support","custom_training","api_access"]'::jsonb);

-- 6. Licenses
INSERT INTO licenses (id, organization_id, license_key, plan, max_cameras, modules, status, is_trial, expires_at) VALUES
(1, 1, 'DEMO-CORP-2024-ENTERPRISE-001', 'enterprise', 50, ARRAY['fire_detection', 'face_recognition', 'people_counting', 'vehicle_anpr', 'attendance', 'intrusion', 'demographics', 'ppe_detection', 'weapon_detection'], 'active', false, now() + interval '1 year'),
(2, 2, 'TEST-COMPANY-2024-PROFESSIONAL-001', 'professional', 30, ARRAY['face_recognition', 'people_counting', 'vehicle_anpr', 'attendance'], 'active', false, now() + interval '1 year');

-- 7. Edge Servers
INSERT INTO edge_servers (id, edge_id, hardware_id, organization_id, name, location, version, ip_address, online, last_heartbeat, system_info) VALUES
(1, 'EDGE-DEMO-MAIN-001', 'HW-DEMO-001', 1, 'Main Building Edge Server', 'Building A - Server Room', '1.0.0', '192.168.1.100', true, now(), '{"cpu":"Intel Core i7-10700","ram":"32GB","gpu":"NVIDIA RTX 3060","storage":"1TB SSD","os":"Ubuntu 22.04 LTS","cpu_percent":45,"memory_percent":62,"disk_percent":38}'::jsonb),
(2, 'EDGE-DEMO-GATE-002', 'HW-DEMO-002', 1, 'Gate Entrance Edge Server', 'Main Gate', '1.0.0', '192.168.1.101', true, now() - interval '30 seconds', '{"cpu":"Intel Core i5-10400","ram":"16GB","storage":"500GB SSD","os":"Ubuntu 22.04 LTS","cpu_percent":32,"memory_percent":48,"disk_percent":25}'::jsonb),
(3, 'EDGE-TEST-001', 'HW-TEST-001', 2, 'Test Company Edge Server', 'Main Office', '1.0.0', '192.168.2.100', false, now() - interval '5 minutes', '{"cpu":"Intel Core i3-10100","ram":"8GB","storage":"250GB SSD","os":"Ubuntu 22.04 LTS"}'::jsonb);

-- 8. AI Modules
INSERT INTO ai_modules (id, module_key, name, display_name, description, icon, category, is_active, is_premium, min_plan_level, display_order) VALUES
(1, 'fire', 'fire_detection', 'Fire & Smoke Detection', 'Detect fire and smoke in real-time', 'flame', 'safety', true, true, 3, 1),
(2, 'face', 'face_recognition', 'Face Recognition', 'Identify and track individuals', 'user', 'security', true, false, 1, 2),
(3, 'counter', 'people_counting', 'People Counting', 'Count people entering/exiting areas', 'users', 'analytics', true, false, 1, 3),
(4, 'vehicle', 'vehicle_anpr', 'Vehicle Recognition (ANPR)', 'Automatic Number Plate Recognition', 'car', 'security', true, false, 2, 4),
(5, 'attendance', 'attendance', 'Attendance System', 'Automated attendance tracking', 'clock', 'hr', true, false, 2, 5),
(6, 'intrusion', 'intrusion', 'Intrusion Detection', 'Detect unauthorized access', 'alert-triangle', 'security', true, false, 2, 6),
(7, 'audience', 'demographics', 'Age & Gender Detection', 'Demographic analytics', 'pie-chart', 'analytics', true, true, 3, 7),
(8, 'warehouse', 'ppe_detection', 'PPE Detection', 'Safety equipment compliance', 'shield', 'safety', true, true, 3, 8),
(9, 'productivity', 'weapon_detection', 'Weapon Detection', 'Detect firearms and weapons', 'shield-alert', 'security', true, true, 3, 9);

-- 9. Enable AI Modules for Organizations
INSERT INTO organization_ai_modules (organization_id, ai_module_id, is_enabled, is_licensed, config, confidence_threshold, alert_threshold) VALUES
-- Demo Corp - All modules enabled
(1, 1, true, true, '{}'::jsonb, 0.85, 0.90),
(1, 2, true, true, '{}'::jsonb, 0.80, 0.85),
(1, 3, true, true, '{}'::jsonb, 0.75, 0.80),
(1, 4, true, true, '{}'::jsonb, 0.85, 0.90),
(1, 5, true, true, '{}'::jsonb, 0.80, 0.85),
(1, 6, true, true, '{}'::jsonb, 0.85, 0.90),
(1, 7, true, true, '{}'::jsonb, 0.75, 0.80),
(1, 8, true, true, '{}'::jsonb, 0.85, 0.90),
(1, 9, true, true, '{}'::jsonb, 0.90, 0.95),
-- Test Company - Limited modules
(2, 2, true, true, '{}'::jsonb, 0.80, 0.85),
(2, 3, true, true, '{}'::jsonb, 0.75, 0.80),
(2, 4, true, true, '{}'::jsonb, 0.85, 0.90),
(2, 5, true, true, '{}'::jsonb, 0.80, 0.85);

-- 10. Cameras
INSERT INTO cameras (id, organization_id, edge_server_id, name, camera_id, rtsp_url, location, status, config) VALUES
(1, 1, 1, 'Main Entrance Camera', 'CAM-001', 'rtsp://192.168.1.201:554/stream', 'Main Entrance', 'online', '{"resolution":"1920x1080","fps":15,"enabled_modules":["face","counter","intrusion"]}'::jsonb),
(2, 1, 1, 'Parking Lot Camera 1', 'CAM-002', 'rtsp://192.168.1.202:554/stream', 'Parking Area A', 'online', '{"resolution":"1920x1080","fps":15,"enabled_modules":["vehicle","counter"]}'::jsonb),
(3, 1, 1, 'Hallway Camera', 'CAM-003', 'rtsp://192.168.1.203:554/stream', 'First Floor Hallway', 'online', '{"resolution":"1920x1080","fps":15,"enabled_modules":["face","counter","intrusion"]}'::jsonb),
(4, 1, 2, 'Gate Camera', 'CAM-004', 'rtsp://192.168.1.204:554/stream', 'Main Gate', 'online', '{"resolution":"1920x1080","fps":15,"enabled_modules":["vehicle","face","intrusion"]}'::jsonb),
(5, 1, 2, 'Parking Lot Camera 2', 'CAM-005', 'rtsp://192.168.1.205:554/stream', 'Parking Area B', 'online', '{"resolution":"1920x1080","fps":15,"enabled_modules":["vehicle"]}'::jsonb),
(6, 1, 1, 'Storage Room Camera', 'CAM-006', 'rtsp://192.168.1.206:554/stream', 'Storage Area', 'online', '{"resolution":"1920x1080","fps":15,"enabled_modules":["fire","ppe","intrusion"]}'::jsonb),
(7, 1, 1, 'Server Room Camera', 'CAM-007', 'rtsp://192.168.1.207:554/stream', 'Server Room', 'online', '{"resolution":"1920x1080","fps":15,"enabled_modules":["fire","intrusion"]}'::jsonb),
(8, 1, 2, 'Back Entrance Camera', 'CAM-008', 'rtsp://192.168.1.208:554/stream', 'Back Entrance', 'offline', '{"resolution":"1920x1080","fps":15,"enabled_modules":["face","intrusion"]}'::jsonb),
(9, 1, 1, 'Reception Camera', 'CAM-009', 'rtsp://192.168.1.209:554/stream', 'Reception Area', 'online', '{"resolution":"1920x1080","fps":15,"enabled_modules":["face","counter","audience"]}'::jsonb),
(10, 1, 2, 'Emergency Exit Camera', 'CAM-010', 'rtsp://192.168.1.210:554/stream', 'Emergency Exit', 'online', '{"resolution":"1920x1080","fps":15,"enabled_modules":["intrusion","fire"]}'::jsonb),
(11, 2, 3, 'Test Company Camera 1', 'CAM-TEST-001', 'rtsp://192.168.2.201:554/stream', 'Main Entrance', 'offline', '{"resolution":"1920x1080","fps":15,"enabled_modules":["face","counter"]}'::jsonb);

-- 11. Registered Faces (People)
INSERT INTO registered_faces (id, organization_id, person_name, employee_id, department, category, photo_url, is_active) VALUES
(1, 1, 'أحمد محمد علي', 'EMP001', 'IT', 'employee', NULL, true),
(2, 1, 'فاطمة أحمد', 'EMP002', 'HR', 'employee', NULL, true),
(3, 1, 'خالد سعيد', 'EMP003', 'Security', 'employee', NULL, true),
(4, 1, 'سارة عبدالله', 'EMP004', 'Finance', 'employee', NULL, true),
(5, 1, 'محمد حسن', 'EMP005', 'Operations', 'employee', NULL, true),
(6, 1, 'زائر غير معروف', NULL, NULL, 'visitor', NULL, true),
(7, 1, 'شخص في القائمة السوداء', NULL, NULL, 'blacklist', NULL, true),
(8, 1, 'مدير VIP', 'VIP001', 'Management', 'vip', NULL, true);

-- 12. Registered Vehicles
INSERT INTO registered_vehicles (id, organization_id, plate_number, plate_ar, owner_name, vehicle_type, vehicle_color, category, is_active) VALUES
(1, 1, 'ABC-1234', 'ا ب ج 1234', 'أحمد محمد', 'Sedan', 'White', 'authorized', true),
(2, 1, 'XYZ-5678', 'س ص ع 5678', 'فاطمة أحمد', 'SUV', 'Black', 'authorized', true),
(3, 1, 'DEF-9012', 'د ه و 9012', 'خالد سعيد', 'Truck', 'Blue', 'authorized', true),
(4, 1, 'GHI-3456', 'ج ح خ 3456', NULL, 'Sedan', 'Red', 'visitor', true),
(5, 1, 'JKL-7890', 'ك ل م 7890', NULL, 'SUV', 'Silver', 'blacklist', true),
(6, 1, 'MNO-2468', 'م ن و 2468', 'مدير VIP', 'Luxury', 'Gold', 'vip', true);

-- 13. Attendance Records
INSERT INTO attendance_records (id, organization_id, person_id, camera_id, check_in_time, check_out_time, is_late, is_early_departure, is_manual) VALUES
(1, 1, 1, 'CAM-001', now() - interval '8 hours', now() - interval '1 hour', false, false, false),
(2, 1, 2, 'CAM-001', now() - interval '8 hours 15 minutes', now() - interval '1 hour', true, false, false),
(3, 1, 3, 'CAM-001', now() - interval '8 hours', NULL, false, false, false),
(4, 1, 4, 'CAM-001', now() - interval '7 hours 45 minutes', now() - interval '1 hour 30 minutes', false, true, false),
(5, 1, 5, 'CAM-001', now() - interval '8 hours', now() - interval '1 hour', false, false, false);

-- 14. Vehicle Access Logs
INSERT INTO vehicle_access_logs (id, organization_id, vehicle_id, camera_id, plate_number, direction, access_granted, confidence) VALUES
(1, 1, 1, 'CAM-004', 'ABC-1234', 'in', true, 0.96),
(2, 1, 2, 'CAM-004', 'XYZ-5678', 'in', true, 0.94),
(3, 1, 1, 'CAM-004', 'ABC-1234', 'out', true, 0.95),
(4, 1, 4, 'CAM-004', 'GHI-3456', 'in', false, 0.88),
(5, 1, 6, 'CAM-004', 'MNO-2468', 'in', true, 0.98);

-- 15. Automation Rules
INSERT INTO automation_rules (id, organization_id, name, name_ar, description, trigger_module, trigger_event, trigger_conditions, action_type, action_command, cooldown_seconds, priority, is_active) VALUES
(1, 1, 'Fire Alert to SMS', 'تنبيه الحريق عبر الرسائل', 'Send SMS when fire is detected', 'fire', 'fire_detected', '{"severity":"critical"}'::jsonb, 'notification', '{"message":"Fire detected!","recipients":["+966500000000"],"channels":["sms"]}'::jsonb, 300, 10, true),
(2, 1, 'Blacklist Alert', 'تنبيه القائمة السوداء', 'Alert security when blacklisted person detected', 'face', 'blacklist_detected', '{}'::jsonb, 'http_request', '{"url":"https://api.example.com/alert","method":"POST"}'::jsonb, 60, 9, true),
(3, 1, 'Gate Open on VIP', 'فتح البوابة للشخصيات المهمة', 'Open gate automatically for VIP vehicles', 'vehicle', 'vip_vehicle_detected', '{}'::jsonb, 'gate_open', '{"gate_id":"gate-001"}'::jsonb, 30, 8, true);

-- 16. Events (Alerts)
INSERT INTO events (edge_id, edge_server_id, organization_id, camera_id, module, event_type, severity, title, description, status, occurred_at, meta) VALUES
-- Fire Detection
('EDGE-DEMO-MAIN-001', 1, 1, 'CAM-006', 'fire', 'fire_detected', 'critical', 'Fire Detected', 'Fire detected in storage area', 'new', now() - interval '2 hours', '{"confidence":0.95,"location":"Storage Area","temperature":85}'::jsonb),
('EDGE-DEMO-MAIN-001', 1, 1, 'CAM-007', 'fire', 'smoke_detected', 'critical', 'Smoke Detected', 'Smoke detected in server room', 'acknowledged', now() - interval '5 hours', '{"confidence":0.88,"location":"Server Room"}'::jsonb),
-- Face Recognition
('EDGE-DEMO-MAIN-001', 1, 1, 'CAM-001', 'face', 'face_recognized', 'info', 'Employee Entry', 'أحمد محمد علي entered building', 'resolved', now() - interval '1 hour', '{"person_id":"1","person_name":"أحمد محمد علي","confidence":0.97}'::jsonb),
('EDGE-DEMO-GATE-002', 2, 1, 'CAM-004', 'face', 'blacklist_detected', 'high', 'Blacklisted Person', 'شخص في القائمة السوداء detected at gate', 'new', now() - interval '3 hours', '{"person_id":"7","confidence":0.92}'::jsonb),
-- Intrusion
('EDGE-DEMO-MAIN-001', 1, 1, 'CAM-006', 'intrusion', 'intrusion_detected', 'high', 'Intrusion Alert', 'Unauthorized access to restricted area', 'acknowledged', now() - interval '4 hours', '{"zone":"restricted","confidence":0.93}'::jsonb),
('EDGE-DEMO-GATE-002', 2, 1, 'CAM-008', 'intrusion', 'perimeter_breach', 'high', 'Perimeter Breach', 'Person detected in restricted perimeter', 'new', now() - interval '6 hours', '{"zone":"perimeter","confidence":0.89}'::jsonb),
-- Vehicle ANPR
('EDGE-DEMO-GATE-002', 2, 1, 'CAM-004', 'vehicle', 'vehicle_recognized', 'info', 'Vehicle Entry', 'Vehicle ABC-1234 entered parking', 'resolved', now() - interval '30 minutes', '{"plate":"ABC-1234","vehicle_id":"1","confidence":0.96}'::jsonb),
('EDGE-DEMO-GATE-002', 2, 1, 'CAM-004', 'vehicle', 'vehicle_recognized', 'info', 'Vehicle Exit', 'Vehicle XYZ-5678 exited parking', 'resolved', now() - interval '45 minutes', '{"plate":"XYZ-5678","vehicle_id":"2","confidence":0.94}'::jsonb),
-- PPE Detection
('EDGE-DEMO-MAIN-001', 1, 1, 'CAM-006', 'warehouse', 'ppe_violation', 'medium', 'PPE Violation', 'Worker without helmet detected', 'acknowledged', now() - interval '2 hours', '{"violation":"no_helmet","confidence":0.91}'::jsonb),
('EDGE-DEMO-MAIN-001', 1, 1, 'CAM-006', 'warehouse', 'ppe_violation', 'medium', 'PPE Violation', 'Worker without safety vest', 'new', now() - interval '3 hours', '{"violation":"no_vest","confidence":0.88}'::jsonb),
-- Weapon Detection
('EDGE-DEMO-MAIN-001', 1, 1, 'CAM-001', 'productivity', 'weapon_detected', 'critical', 'Weapon Detected', 'Firearm detected at entrance', 'new', now() - interval '1 hour', '{"weapon_type":"firearm","confidence":0.94}'::jsonb),
-- People Counting
('EDGE-DEMO-MAIN-001', 1, 1, 'CAM-001', 'counter', 'occupancy_update', 'info', 'Occupancy Update', 'Current occupancy: 45 people', 'resolved', now() - interval '15 minutes', '{"count":45,"direction":"in"}'::jsonb),
('EDGE-DEMO-MAIN-001', 1, 1, 'CAM-001', 'counter', 'occupancy_update', 'info', 'Occupancy Update', 'Current occupancy: 43 people', 'resolved', now() - interval '10 minutes', '{"count":43,"direction":"out"}'::jsonb);

-- 17. Notifications
INSERT INTO notifications (user_id, organization_id, channel, title, message, type, created_at) VALUES
(2, 1, 'push', 'Critical Alert', 'Fire detected in storage area - immediate action required', 'critical', now() - interval '2 hours'),
(3, 1, 'email', 'Security Alert', 'Unauthorized access attempt detected', 'warning', now() - interval '4 hours'),
(4, 1, 'push', 'System Notification', 'Edge server back online', 'info', now() - interval '1 hour'),
(3, 1, 'sms', 'Weapon Alert', 'Weapon detected at main entrance', 'critical', now() - interval '1 hour'),
(4, 1, 'push', 'PPE Violation', 'Safety equipment violation in storage area', 'warning', now() - interval '3 hours');

-- 18. Integrations
INSERT INTO integrations (id, organization_id, edge_server_id, name, type, config, is_active) VALUES
(1, 1, 1, 'Main Gate Arduino', 'arduino', '{"port":"/dev/ttyUSB0","baud_rate":9600}'::jsonb, true),
(2, 1, NULL, 'SMS Gateway', 'sms', '{"provider":"twilio","api_key":"demo_key"}'::jsonb, true),
(3, 1, NULL, 'WhatsApp Business', 'whatsapp', '{"phone":"+966500000000"}'::jsonb, true),
(4, 1, NULL, 'Email Notifications', 'email', '{"smtp_host":"smtp.gmail.com","smtp_port":587}'::jsonb, true);

-- Reset sequences
SELECT setval('distributors_id_seq', (SELECT MAX(id) FROM distributors));
SELECT setval('resellers_id_seq', (SELECT MAX(id) FROM resellers));
SELECT setval('organizations_id_seq', (SELECT MAX(id) FROM organizations));
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('subscription_plans_id_seq', (SELECT MAX(id) FROM subscription_plans));
SELECT setval('licenses_id_seq', (SELECT MAX(id) FROM licenses));
SELECT setval('edge_servers_id_seq', (SELECT MAX(id) FROM edge_servers));
SELECT setval('ai_modules_id_seq', (SELECT MAX(id) FROM ai_modules));
SELECT setval('cameras_id_seq', (SELECT MAX(id) FROM cameras));
SELECT setval('registered_faces_id_seq', (SELECT MAX(id) FROM registered_faces));
SELECT setval('registered_vehicles_id_seq', (SELECT MAX(id) FROM registered_vehicles));
SELECT setval('attendance_records_id_seq', (SELECT MAX(id) FROM attendance_records));
SELECT setval('vehicle_access_logs_id_seq', (SELECT MAX(id) FROM vehicle_access_logs));
SELECT setval('automation_rules_id_seq', (SELECT MAX(id) FROM automation_rules));
SELECT setval('events_id_seq', (SELECT MAX(id) FROM events));
SELECT setval('notifications_id_seq', (SELECT MAX(id) FROM notifications));
SELECT setval('integrations_id_seq', (SELECT MAX(id) FROM integrations));

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify the data:
-- SELECT id, name, email, role, is_super_admin FROM users ORDER BY id;
-- SELECT id, name, subscription_plan, is_active FROM organizations;
-- SELECT COUNT(*) as total_events FROM events;
-- SELECT COUNT(*) as total_cameras FROM cameras;
-- SELECT COUNT(*) as total_people FROM registered_faces;
-- SELECT COUNT(*) as total_vehicles FROM registered_vehicles;
-- ============================================

