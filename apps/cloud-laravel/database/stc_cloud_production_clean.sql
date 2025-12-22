-- ============================================
-- STC AI-VAP Cloud Platform - Production Database
-- PostgreSQL Complete Schema + Seed Data
-- ============================================
-- Description: Clean production-ready database schema
-- Version: 2.0.0
-- Date: 2025-01-02
-- Laravel Version: 11.x
-- ============================================
-- 
-- USAGE:
-- 1. Drop existing database (if any)
-- 2. Create new empty database
-- 3. Run this SQL file: psql -U postgres -d your_database < stc_cloud_production_clean.sql
-- 4. Or via Laravel: php artisan migrate:fresh --seed
--
-- ============================================

-- Enable UUID extension (if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DROP EXISTING TABLES (in reverse dependency order)
-- ============================================
DROP TABLE IF EXISTS ai_command_logs CASCADE;
DROP TABLE IF EXISTS ai_command_targets CASCADE;
DROP TABLE IF EXISTS ai_commands CASCADE;
DROP TABLE IF EXISTS ai_policy_events CASCADE;
DROP TABLE IF EXISTS ai_policies CASCADE;
DROP TABLE IF EXISTS analytics_widgets CASCADE;
DROP TABLE IF EXISTS analytics_dashboards CASCADE;
DROP TABLE IF EXISTS analytics_reports CASCADE;
DROP TABLE IF EXISTS integrations CASCADE;
DROP TABLE IF EXISTS cameras CASCADE;
DROP TABLE IF EXISTS device_tokens CASCADE;
DROP TABLE IF EXISTS updates CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS notification_priorities CASCADE;
DROP TABLE IF EXISTS edge_server_logs CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS edge_servers CASCADE;
DROP TABLE IF EXISTS licenses CASCADE;
DROP TABLE IF EXISTS subscription_plan_limits CASCADE;
DROP TABLE IF EXISTS sms_quotas CASCADE;
DROP TABLE IF EXISTS organizations_branding CASCADE;
DROP TABLE IF EXISTS personal_access_tokens CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS resellers CASCADE;
DROP TABLE IF EXISTS distributors CASCADE;
DROP TABLE IF EXISTS platform_contents CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS system_backups CASCADE;

-- ============================================
-- 1. DISTRIBUTORS
-- ============================================
CREATE TABLE distributors (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- ============================================
-- 2. RESELLERS
-- ============================================
CREATE TABLE resellers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    company_name VARCHAR(255),
    tax_number VARCHAR(255),
    address TEXT,
    city VARCHAR(255),
    country VARCHAR(2) DEFAULT 'SA',
    commission_rate NUMERIC(5,2) DEFAULT 0,
    discount_rate NUMERIC(5,2) DEFAULT 0,
    credit_limit NUMERIC(12,2) DEFAULT 0,
    contact_person VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- ============================================
-- 3. SUBSCRIPTION PLANS
-- ============================================
CREATE TABLE subscription_plans (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    max_cameras INTEGER DEFAULT 4,
    max_edge_servers INTEGER DEFAULT 1,
    sms_quota INTEGER DEFAULT 0,
    available_modules JSONB,
    notification_channels JSONB,
    price_monthly NUMERIC(10,2) DEFAULT 0,
    price_yearly NUMERIC(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- ============================================
-- 4. ORGANIZATIONS
-- ============================================
CREATE TABLE organizations (
    id BIGSERIAL PRIMARY KEY,
    distributor_id BIGINT REFERENCES distributors(id) ON DELETE SET NULL,
    reseller_id BIGINT REFERENCES resellers(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    logo_url VARCHAR(500),
    address TEXT,
    city VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    tax_number VARCHAR(255),
    subscription_plan VARCHAR(255) DEFAULT 'basic',
    max_cameras INTEGER DEFAULT 4,
    max_edge_servers INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_organizations_distributor ON organizations(distributor_id);
CREATE INDEX idx_organizations_reseller ON organizations(reseller_id);
CREATE INDEX idx_organizations_active ON organizations(is_active);

-- ============================================
-- 5. ORGANIZATIONS BRANDING
-- ============================================
CREATE TABLE organizations_branding (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
    logo_url VARCHAR(500),
    logo_dark_url VARCHAR(500),
    favicon_url VARCHAR(500),
    primary_color VARCHAR(7) DEFAULT '#DCA000',
    secondary_color VARCHAR(7) DEFAULT '#1E1E6E',
    accent_color VARCHAR(7) DEFAULT '#10B981',
    danger_color VARCHAR(7) DEFAULT '#EF4444',
    warning_color VARCHAR(7) DEFAULT '#F59E0B',
    success_color VARCHAR(7) DEFAULT '#22C55E',
    font_family VARCHAR(255) DEFAULT 'Inter',
    heading_font VARCHAR(255) DEFAULT 'Cairo',
    border_radius VARCHAR(10) DEFAULT '8px',
    custom_css TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- ============================================
-- 6. USERS
-- ============================================
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT REFERENCES organizations(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) DEFAULT 'org_admin',
    is_super_admin BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    remember_token VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- 7. SUBSCRIPTION PLAN LIMITS
-- ============================================
CREATE TABLE subscription_plan_limits (
    id BIGSERIAL PRIMARY KEY,
    subscription_plan_id BIGINT REFERENCES subscription_plans(id) ON DELETE CASCADE,
    key VARCHAR(255) NOT NULL,
    value INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- ============================================
-- 8. LICENSES
-- ============================================
CREATE TABLE licenses (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
    subscription_plan_id BIGINT REFERENCES subscription_plans(id) ON DELETE SET NULL,
    plan VARCHAR(255) DEFAULT 'basic',
    license_key VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    edge_server_id VARCHAR(255),
    max_cameras INTEGER DEFAULT 4,
    modules JSONB,
    trial_ends_at TIMESTAMP,
    activated_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_licenses_organization ON licenses(organization_id);
CREATE INDEX idx_licenses_key ON licenses(license_key);

-- ============================================
-- 9. EDGE SERVERS
-- ============================================
CREATE TABLE edge_servers (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
    license_id BIGINT REFERENCES licenses(id) ON DELETE SET NULL,
    edge_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    hardware_id VARCHAR(255),
    ip_address VARCHAR(45),
    version VARCHAR(50),
    location VARCHAR(255),
    notes TEXT,
    online BOOLEAN DEFAULT false,
    last_seen_at TIMESTAMP,
    system_info JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_edge_servers_organization ON edge_servers(organization_id);
CREATE INDEX idx_edge_servers_edge_id ON edge_servers(edge_id);
CREATE INDEX idx_edge_servers_online ON edge_servers(online);

-- ============================================
-- 10. CAMERAS
-- ============================================
CREATE TABLE cameras (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
    edge_server_id BIGINT REFERENCES edge_servers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    camera_id VARCHAR(255) UNIQUE NOT NULL,
    rtsp_url TEXT,
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'offline',
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_cameras_organization ON cameras(organization_id);
CREATE INDEX idx_cameras_edge_server ON cameras(edge_server_id);
CREATE INDEX idx_cameras_status ON cameras(status);

-- ============================================
-- 11. EVENTS
-- ============================================
CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT REFERENCES organizations(id) ON DELETE SET NULL,
    edge_server_id BIGINT REFERENCES edge_servers(id) ON DELETE SET NULL,
    edge_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(255) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    occurred_at TIMESTAMP NOT NULL,
    meta JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_events_organization ON events(organization_id);
CREATE INDEX idx_events_edge_server ON events(edge_server_id);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_severity ON events(severity);
CREATE INDEX idx_events_occurred_at ON events(occurred_at);

-- ============================================
-- 12. EDGE SERVER LOGS
-- ============================================
CREATE TABLE edge_server_logs (
    id BIGSERIAL PRIMARY KEY,
    edge_server_id BIGINT REFERENCES edge_servers(id) ON DELETE CASCADE,
    level VARCHAR(50) DEFAULT 'info',
    message TEXT NOT NULL,
    meta JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_edge_server_logs_edge_server ON edge_server_logs(edge_server_id);
CREATE INDEX idx_edge_server_logs_level ON edge_server_logs(level);

-- ============================================
-- 13. NOTIFICATIONS
-- ============================================
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT REFERENCES organizations(id) ON DELETE SET NULL,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    edge_server_id BIGINT REFERENCES edge_servers(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT,
    priority VARCHAR(50) DEFAULT 'medium',
    channel VARCHAR(50) DEFAULT 'push',
    status VARCHAR(50) DEFAULT 'new',
    meta JSONB,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_notifications_organization ON notifications(organization_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_read_at ON notifications(read_at);

-- ============================================
-- 14. NOTIFICATION PRIORITIES
-- ============================================
CREATE TABLE notification_priorities (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT REFERENCES organizations(id) ON DELETE SET NULL,
    notification_type VARCHAR(255) NOT NULL,
    priority VARCHAR(50) DEFAULT 'medium',
    is_critical BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- ============================================
-- 15. SMS QUOTAS
-- ============================================
CREATE TABLE sms_quotas (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
    monthly_limit INTEGER NOT NULL,
    used_this_month INTEGER DEFAULT 0,
    resets_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_sms_quotas_organization ON sms_quotas(organization_id);

-- ============================================
-- 16. SYSTEM SETTINGS
-- ============================================
CREATE TABLE system_settings (
    id BIGSERIAL PRIMARY KEY,
    platform_name VARCHAR(255) DEFAULT 'STC AI-VAP',
    platform_tagline VARCHAR(500),
    support_email VARCHAR(255),
    support_phone VARCHAR(50),
    default_timezone VARCHAR(100) DEFAULT 'UTC',
    default_language VARCHAR(10) DEFAULT 'ar',
    maintenance_mode BOOLEAN DEFAULT false,
    maintenance_message TEXT,
    session_timeout_minutes INTEGER DEFAULT 60,
    max_login_attempts INTEGER DEFAULT 5,
    password_min_length INTEGER DEFAULT 8,
    require_2fa BOOLEAN DEFAULT false,
    allow_registration BOOLEAN DEFAULT true,
    require_email_verification BOOLEAN DEFAULT false,
    email_settings JSONB,
    sms_settings JSONB,
    fcm_settings JSONB,
    storage_settings JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- ============================================
-- 17. PLATFORM CONTENTS
-- ============================================
CREATE TABLE platform_contents (
    id BIGSERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    section VARCHAR(255),
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_platform_contents_key ON platform_contents(key);
CREATE INDEX idx_platform_contents_published ON platform_contents(published);

-- ============================================
-- 18. SYSTEM BACKUPS
-- ============================================
CREATE TABLE system_backups (
    id BIGSERIAL PRIMARY KEY,
    file_path VARCHAR(500) NOT NULL,
    status VARCHAR(50) DEFAULT 'completed',
    meta JSONB,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 19. ANALYTICS REPORTS
-- ============================================
CREATE TABLE analytics_reports (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT REFERENCES organizations(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    report_type VARCHAR(255) DEFAULT 'event_summary',
    parameters JSONB,
    filters JSONB,
    format VARCHAR(50) DEFAULT 'json',
    file_url VARCHAR(500),
    file_size BIGINT,
    is_scheduled BOOLEAN DEFAULT false,
    schedule_cron VARCHAR(255),
    last_generated_at TIMESTAMP,
    next_scheduled_at TIMESTAMP,
    recipients JSONB,
    status VARCHAR(50) DEFAULT 'draft',
    error_message TEXT,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- ============================================
-- 20. ANALYTICS DASHBOARDS
-- ============================================
CREATE TABLE analytics_dashboards (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT REFERENCES organizations(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT false,
    layout JSONB,
    is_public BOOLEAN DEFAULT false,
    shared_with JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- ============================================
-- 21. ANALYTICS WIDGETS
-- ============================================
CREATE TABLE analytics_widgets (
    id BIGSERIAL PRIMARY KEY,
    dashboard_id BIGINT REFERENCES analytics_dashboards(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    widget_type VARCHAR(255) NOT NULL,
    config JSONB,
    data_source VARCHAR(255),
    filters JSONB,
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    width INTEGER DEFAULT 4,
    height INTEGER DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- ============================================
-- 22. AI POLICIES
-- ============================================
CREATE TABLE ai_policies (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT REFERENCES organizations(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    modules JSONB,
    thresholds JSONB,
    actions JSONB,
    feature_flags JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- ============================================
-- 23. AI POLICY EVENTS
-- ============================================
CREATE TABLE ai_policy_events (
    id BIGSERIAL PRIMARY KEY,
    ai_policy_id BIGINT REFERENCES ai_policies(id) ON DELETE CASCADE,
    event_type VARCHAR(255) NOT NULL,
    label VARCHAR(255),
    payload JSONB,
    weight NUMERIC(8,2) DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- ============================================
-- 24. PERSONAL ACCESS TOKENS (Sanctum)
-- ============================================
CREATE TABLE personal_access_tokens (
    id BIGSERIAL PRIMARY KEY,
    tokenable_type VARCHAR(255) NOT NULL,
    tokenable_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    token VARCHAR(64) UNIQUE NOT NULL,
    abilities TEXT,
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_personal_access_tokens_tokenable ON personal_access_tokens(tokenable_type, tokenable_id);
CREATE INDEX idx_personal_access_tokens_token ON personal_access_tokens(token);

-- ============================================
-- 25. DEVICE TOKENS (FCM)
-- ============================================
CREATE TABLE device_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    device_type VARCHAR(50) NOT NULL,
    device_id VARCHAR(255),
    device_name VARCHAR(255),
    app_version VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_device_tokens_user ON device_tokens(user_id, is_active);
CREATE INDEX idx_device_tokens_organization ON device_tokens(organization_id, is_active);

-- ============================================
-- 26. UPDATES (Announcements)
-- ============================================
CREATE TABLE updates (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    body TEXT,
    is_published BOOLEAN DEFAULT false,
    organization_id BIGINT REFERENCES organizations(id) ON DELETE SET NULL,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_updates_organization ON updates(organization_id);
CREATE INDEX idx_updates_published ON updates(is_published, published_at);

-- ============================================
-- 27. AI COMMANDS
-- ============================================
CREATE TABLE ai_commands (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT REFERENCES organizations(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'queued',
    payload JSONB,
    acknowledged_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- ============================================
-- 28. AI COMMAND TARGETS
-- ============================================
CREATE TABLE ai_command_targets (
    id BIGSERIAL PRIMARY KEY,
    ai_command_id BIGINT REFERENCES ai_commands(id) ON DELETE CASCADE,
    target_type VARCHAR(50) DEFAULT 'org',
    target_id VARCHAR(255),
    meta JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- ============================================
-- 29. AI COMMAND LOGS
-- ============================================
CREATE TABLE ai_command_logs (
    id BIGSERIAL PRIMARY KEY,
    ai_command_id BIGINT REFERENCES ai_commands(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'queued',
    message TEXT,
    meta JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- ============================================
-- 30. INTEGRATIONS
-- ============================================
CREATE TABLE integrations (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
    edge_server_id BIGINT REFERENCES edge_servers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    connection_config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_integrations_organization ON integrations(organization_id, is_active);
CREATE INDEX idx_integrations_edge_server ON integrations(edge_server_id, is_active);

-- ============================================
-- SEED DATA
-- ============================================

-- Reset sequences
ALTER SEQUENCE distributors_id_seq RESTART WITH 1;
ALTER SEQUENCE resellers_id_seq RESTART WITH 1;
ALTER SEQUENCE subscription_plans_id_seq RESTART WITH 1;
ALTER SEQUENCE organizations_id_seq RESTART WITH 1;
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE licenses_id_seq RESTART WITH 1;
ALTER SEQUENCE edge_servers_id_seq RESTART WITH 1;
ALTER SEQUENCE cameras_id_seq RESTART WITH 1;

-- ============================================
-- 1. SUBSCRIPTION PLANS
-- ============================================
INSERT INTO subscription_plans (id, name, name_ar, max_cameras, max_edge_servers, sms_quota, available_modules, notification_channels, price_monthly, price_yearly, is_active) VALUES
(1, 'basic', 'اساسي', 4, 1, 100, '[1, 2]', '["push", "email"]', 500.00, 5000.00, true),
(2, 'professional', 'احترافي', 16, 2, 500, '[1, 2, 3, 4, 5]', '["push", "email", "sms"]', 1500.00, 15000.00, true),
(3, 'enterprise', 'مؤسسي', 64, 5, 2000, '[1, 2, 3, 4, 5, 6, 7, 8, 9]', '["push", "email", "sms", "whatsapp"]', 5000.00, 50000.00, true);

-- ============================================
-- 2. DISTRIBUTOR
-- ============================================
INSERT INTO distributors (id, name, contact_email) VALUES
(1, 'STC Solutions Master Distributor', 'partner@stc-solutions.com');

-- ============================================
-- 3. RESELLER
-- ============================================
INSERT INTO resellers (id, name, name_en, email, phone, company_name, city, country, commission_rate, is_active) VALUES
(1, 'موزع رئيسي', 'Main Reseller', 'reseller@stc-solutions.com', '+966 11 000 0001', 'STC Solutions Reseller', 'الرياض', 'SA', 15.00, true);

-- ============================================
-- 4. ORGANIZATION (Demo)
-- ============================================
INSERT INTO organizations (id, distributor_id, reseller_id, name, name_en, email, phone, city, subscription_plan, max_cameras, max_edge_servers, is_active) VALUES
(1, 1, 1, 'شركة تجريبية', 'Demo Corporation', 'contact@demo.local', '+966 11 111 1111', 'الرياض', 'professional', 16, 2, true);

-- ============================================
-- 5. ORGANIZATION BRANDING
-- ============================================
INSERT INTO organizations_branding (organization_id, primary_color, secondary_color) VALUES
(1, '#DCA000', '#1E1E6E');

-- ============================================
-- 6. USERS
-- ============================================
-- Password: Super@12345 (bcrypt)
INSERT INTO users (id, organization_id, name, email, password, phone, role, is_super_admin, is_active) VALUES
(1, NULL, 'Super Administrator', 'superadmin@stc-solutions.com', '$2y$12$v.6QuWtKrrg7YZ8wTWoWxOIYAGnq1xCrA6V8TS8QbDeWUHsHFCpY.', '+966 50 000 0001', 'super_admin', true, true),
(2, 1, 'Organization Admin', 'admin@demo.local', '$2y$12$jX9.JiiNxIzibIXlwwM3Quq7/wQzDTr8tbllpOOY9V.wzwtg9424y', '+966 50 000 0002', 'org_admin', false, true),
(3, 1, 'Security Operator', 'operator@demo.local', '$2y$12$jX9.JiiNxIzibIXlwwM3Quq7/wQzDTr8tbllpOOY9V.wzwtg9424y', '+966 50 000 0003', 'operator', false, true),
(4, 1, 'Viewer User', 'viewer@demo.local', '$2y$12$jX9.JiiNxIzibIXlwwM3Quq7/wQzDTr8tbllpOOY9V.wzwtg9424y', '+966 50 000 0004', 'viewer', false, true);

-- ============================================
-- 7. LICENSE
-- ============================================
INSERT INTO licenses (id, organization_id, subscription_plan_id, plan, license_key, status, max_cameras, modules, expires_at, activated_at) VALUES
(1, 1, 2, 'professional', 'DEMO-CORP-2025-PROFESSIONAL', 'active', 16, '[1, 2, 3, 4, 5]', CURRENT_TIMESTAMP + INTERVAL '1 year', CURRENT_TIMESTAMP);

-- ============================================
-- 8. EDGE SERVERS
-- ============================================
INSERT INTO edge_servers (id, organization_id, license_id, edge_id, name, ip_address, version, location, online, last_seen_at, system_info) VALUES
(1, 1, 1, 'EDGE-DEMO-MAIN-001', 'Main Building Edge Server', '192.168.1.100', '1.0.0', 'Building A - Server Room', true, CURRENT_TIMESTAMP, '{"cpu": "Intel Core i7-10700", "ram": "32GB", "gpu": "NVIDIA RTX 3060", "storage": "1TB SSD", "os": "Ubuntu 22.04 LTS"}'),
(2, 1, 1, 'EDGE-DEMO-GATE-002', 'Gate Entrance Edge Server', '192.168.1.101', '1.0.0', 'Main Gate', true, CURRENT_TIMESTAMP, '{"cpu": "Intel Core i5-10400", "ram": "16GB", "storage": "500GB SSD", "os": "Ubuntu 22.04 LTS"}');

-- ============================================
-- 9. CAMERAS
-- ============================================
INSERT INTO cameras (id, organization_id, edge_server_id, name, camera_id, rtsp_url, location, status, config) VALUES
(1, 1, 1, 'كاميرا المدخل الرئيسي', 'CAM-001', 'rtsp://192.168.1.201:554/stream', 'المدخل الرئيسي', 'online', '{"resolution": "1920x1080", "fps": 15, "enabled_modules": [1, 2]}'),
(2, 1, 1, 'كاميرا موقف السيارات 1', 'CAM-002', 'rtsp://192.168.1.202:554/stream', 'منطقة موقف السيارات أ', 'online', '{"resolution": "1920x1080", "fps": 15, "enabled_modules": [1]}'),
(3, 1, 1, 'كاميرا الممر', 'CAM-003', 'rtsp://192.168.1.203:554/stream', 'الممر - الطابق الأول', 'online', '{"resolution": "1280x720", "fps": 15, "enabled_modules": [1, 2]}'),
(4, 1, 2, 'كاميرا البوابة', 'CAM-004', 'rtsp://192.168.1.204:554/stream', 'البوابة الرئيسية', 'online', '{"resolution": "1920x1080", "fps": 30, "enabled_modules": [1, 3]}');

-- ============================================
-- 10. SMS QUOTA
-- ============================================
INSERT INTO sms_quotas (organization_id, monthly_limit, used_this_month, resets_at) VALUES
(1, 500, 0, CURRENT_TIMESTAMP + INTERVAL '1 month');

-- ============================================
-- 11. SYSTEM SETTINGS
-- ============================================
INSERT INTO system_settings (platform_name, platform_tagline, support_email, support_phone, default_timezone, default_language) VALUES
('STC AI-VAP', 'منصة تحليل الفيديو بالذكاء الاصطناعي', 'support@stc-solutions.com', '+966 11 000 0000', 'Asia/Riyadh', 'ar');

-- ============================================
-- 12. PLATFORM CONTENTS (Landing Page)
-- ============================================
INSERT INTO platform_contents (key, value, section, published) VALUES
('landing_settings', '{"hero_title": "منصة تحليل الفيديو بالذكاء الاصطناعي", "hero_subtitle": "حول كاميرات المراقبة الى عيون ذكية تحمي منشاتك وتحلل بياناتك في الوقت الفعلي", "hero_button_text": "ابدا تجربتك المجانية - 14 يوم", "about_title": "عن المنصة", "about_description": "حل متكامل لادارة المراقبة بالفيديو والذكاء الاصطناعي مع تكاملات جاهزة.", "contact_email": "info@stc-solutions.com", "contact_phone": "+966 11 000 0000", "contact_address": "الرياض، المملكة العربية السعودية", "whatsapp_number": "+966500000000", "show_whatsapp_button": true, "footer_text": "STC Solutions. جميع الحقوق محفوظة", "social_twitter": null, "social_linkedin": null, "social_instagram": null}', 'landing', true);

-- ============================================
-- 13. SAMPLE EVENTS
-- ============================================
INSERT INTO events (organization_id, edge_server_id, edge_id, event_type, severity, occurred_at, meta) VALUES
(1, 1, 'EDGE-DEMO-MAIN-001', 'face_recognition', 'info', CURRENT_TIMESTAMP - INTERVAL '2 hours', '{"confidence": 0.95, "person_name": "John Doe", "camera_id": "CAM-001"}'),
(1, 1, 'EDGE-DEMO-MAIN-001', 'people_counting', 'info', CURRENT_TIMESTAMP - INTERVAL '1 hour', '{"count": 45, "camera_id": "CAM-001"}'),
(1, 2, 'EDGE-DEMO-GATE-002', 'vehicle_anpr', 'info', CURRENT_TIMESTAMP - INTERVAL '30 minutes', '{"plate_number": "ABC-1234", "camera_id": "CAM-004"}');

-- ============================================
-- 14. SAMPLE NOTIFICATIONS
-- ============================================
INSERT INTO notifications (organization_id, user_id, title, body, priority, channel, status) VALUES
(1, 2, 'تنبيه جديد', 'تم اكتشاف حدث جديد يتطلب انتباهك', 'medium', 'push', 'new'),
(1, 2, 'تحديث النظام', 'تم تحديث النظام بنجاح', 'low', 'push', 'read');

-- ============================================
-- 15. UPDATE ANNOUNCEMENTS
-- ============================================
INSERT INTO updates (title, body, is_published, organization_id, published_at) VALUES
('مرحباً بك في منصة STC AI-VAP', 'نحن سعداء بانضمامك إلى منصة تحليل الفيديو بالذكاء الاصطناعي. استمتع بجميع الميزات المتاحة!', true, NULL, CURRENT_TIMESTAMP),
('تحديث جديد للمنصة', 'تم إضافة ميزات جديدة وتحسينات على الأداء', true, 1, CURRENT_TIMESTAMP);

-- ============================================
-- END OF SCHEMA AND SEED DATA
-- ============================================

-- Verify counts
SELECT 'distributors' as table_name, COUNT(*) as count FROM distributors
UNION ALL
SELECT 'resellers', COUNT(*) FROM resellers
UNION ALL
SELECT 'subscription_plans', COUNT(*) FROM subscription_plans
UNION ALL
SELECT 'organizations', COUNT(*) FROM organizations
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'licenses', COUNT(*) FROM licenses
UNION ALL
SELECT 'edge_servers', COUNT(*) FROM edge_servers
UNION ALL
SELECT 'cameras', COUNT(*) FROM cameras
UNION ALL
SELECT 'platform_contents', COUNT(*) FROM platform_contents;

