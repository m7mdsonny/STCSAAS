-- ============================================
-- STC AI-VAP Cloud Platform - MySQL Database
-- ============================================
-- Description: Production-ready MySQL database with demo data
-- Version: 2.3.0
-- Date: 2025-01-15
-- Database: MySQL 8.0+ / MariaDB 10.3+
-- ============================================
-- IMPORTANT: This database does NOT require any extensions
-- All UUIDs are generated at Laravel level using Str::uuid()
-- ============================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- ============================================
-- DROP EXISTING TABLES (if any)
-- ============================================
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `system_updates`;
DROP TABLE IF EXISTS `system_settings`;
DROP TABLE IF EXISTS `platform_wordings`;
DROP TABLE IF EXISTS `organization_wordings`;
DROP TABLE IF EXISTS `updates`;
DROP TABLE IF EXISTS `ai_module_configs`;
DROP TABLE IF EXISTS `ai_modules`;
DROP TABLE IF EXISTS `ai_command_logs`;
DROP TABLE IF EXISTS `ai_command_targets`;
DROP TABLE IF EXISTS `ai_commands`;
DROP TABLE IF EXISTS `integrations`;
DROP TABLE IF EXISTS `analytics_widgets`;
DROP TABLE IF EXISTS `analytics_dashboards`;
DROP TABLE IF EXISTS `analytics_reports`;
DROP TABLE IF EXISTS `system_backups`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `events`;
DROP TABLE IF EXISTS `cameras`;
DROP TABLE IF EXISTS `edge_servers`;
DROP TABLE IF EXISTS `licenses`;
DROP TABLE IF EXISTS `sessions`;
DROP TABLE IF EXISTS `personal_access_tokens`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `organizations`;
DROP TABLE IF EXISTS `distributors`;
DROP TABLE IF EXISTS `subscription_plans`;
DROP TABLE IF EXISTS `migrations`;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 1. DISTRIBUTORS (Resellers)
-- ============================================
CREATE TABLE `distributors` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `contact_email` VARCHAR(255) NULL,
    `contact_phone` VARCHAR(50) NULL,
    `address` TEXT NULL,
    `commission_rate` DECIMAL(5,2) DEFAULT 0.00,
    `status` VARCHAR(50) DEFAULT 'active',
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. ORGANIZATIONS (Tenants)
-- ============================================
CREATE TABLE `organizations` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `distributor_id` BIGINT UNSIGNED NULL,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) UNIQUE NULL,
    `contact_email` VARCHAR(255) NULL,
    `contact_phone` VARCHAR(50) NULL,
    `address` TEXT NULL,
    `logo_url` VARCHAR(500) NULL,
    `status` VARCHAR(50) DEFAULT 'active',
    `settings` JSON NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL,
    FOREIGN KEY (`distributor_id`) REFERENCES `distributors`(`id`) ON DELETE SET NULL,
    INDEX `idx_organizations_distributor` (`distributor_id`),
    INDEX `idx_organizations_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. USERS
-- ============================================
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `organization_id` BIGINT UNSIGNED NULL,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) UNIQUE NOT NULL,
    `email_verified_at` TIMESTAMP NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` VARCHAR(50) DEFAULT 'viewer',
    `is_super_admin` BOOLEAN DEFAULT FALSE,
    `is_active` BOOLEAN DEFAULT TRUE,
    `phone` VARCHAR(50) NULL,
    `avatar_url` VARCHAR(500) NULL,
    `remember_token` VARCHAR(100) NULL,
    `last_login_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL,
    FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE SET NULL,
    INDEX `idx_users_organization` (`organization_id`),
    INDEX `idx_users_email` (`email`),
    INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. LICENSES
-- ============================================
CREATE TABLE `licenses` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `organization_id` BIGINT UNSIGNED NULL,
    `license_key` VARCHAR(255) UNIQUE NOT NULL,
    `expires_at` TIMESTAMP NOT NULL,
    `max_cameras` INT DEFAULT 10,
    `max_users` INT DEFAULT 5,
    `status` VARCHAR(50) DEFAULT 'active',
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE SET NULL,
    INDEX `idx_licenses_organization` (`organization_id`),
    INDEX `idx_licenses_key` (`license_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. EDGE SERVERS
-- ============================================
CREATE TABLE `edge_servers` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `edge_id` VARCHAR(255) UNIQUE NOT NULL,
    `organization_id` BIGINT UNSIGNED NULL,
    `license_id` BIGINT UNSIGNED NULL,
    `name` VARCHAR(255) NULL,
    `ip_address` VARCHAR(45) NULL,
    `port` INT DEFAULT 8000,
    `version` VARCHAR(50) NULL,
    `status` VARCHAR(50) DEFAULT 'offline',
    `online` BOOLEAN DEFAULT FALSE,
    `system_info` JSON NULL,
    `last_seen_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL,
    FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`license_id`) REFERENCES `licenses`(`id`) ON DELETE SET NULL,
    INDEX `idx_edge_servers_organization` (`organization_id`),
    INDEX `idx_edge_servers_edge_id` (`edge_id`),
    INDEX `idx_edge_servers_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. CAMERAS
-- ============================================
CREATE TABLE `cameras` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `organization_id` BIGINT UNSIGNED NULL,
    `edge_server_id` BIGINT UNSIGNED NULL,
    `camera_id` VARCHAR(255) UNIQUE NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `location` VARCHAR(255) NULL,
    `rtsp_url` VARCHAR(500) NULL,
    `status` VARCHAR(50) DEFAULT 'offline',
    `enabled_modules` JSON NULL,
    `settings` JSON NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL,
    FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`edge_server_id`) REFERENCES `edge_servers`(`id`) ON DELETE SET NULL,
    INDEX `idx_cameras_organization` (`organization_id`),
    INDEX `idx_cameras_edge_server` (`edge_server_id`),
    INDEX `idx_cameras_camera_id` (`camera_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. EVENTS (Alerts)
-- ============================================
CREATE TABLE `events` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `organization_id` BIGINT UNSIGNED NULL,
    `edge_id` VARCHAR(255) NULL,
    `camera_id` VARCHAR(255) NULL,
    `event_type` VARCHAR(100) NOT NULL,
    `severity` VARCHAR(50) DEFAULT 'medium',
    `status` VARCHAR(50) DEFAULT 'new',
    `title` VARCHAR(255) NULL,
    `description` TEXT NULL,
    `occurred_at` TIMESTAMP NOT NULL,
    `acknowledged_at` TIMESTAMP NULL,
    `resolved_at` TIMESTAMP NULL,
    `meta` JSON NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE SET NULL,
    INDEX `idx_events_organization` (`organization_id`),
    INDEX `idx_events_edge_id` (`edge_id`),
    INDEX `idx_events_camera_id` (`camera_id`),
    INDEX `idx_events_occurred_at` (`occurred_at`),
    INDEX `idx_events_severity` (`severity`),
    INDEX `idx_events_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. NOTIFICATIONS
-- ============================================
CREATE TABLE `notifications` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED NULL,
    `organization_id` BIGINT UNSIGNED NULL,
    `channel` VARCHAR(50) NOT NULL,
    `title` VARCHAR(255) NULL,
    `message` TEXT NOT NULL,
    `read_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE SET NULL,
    INDEX `idx_notifications_user` (`user_id`),
    INDEX `idx_notifications_organization` (`organization_id`),
    INDEX `idx_notifications_read` (`read_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9. SUBSCRIPTION PLANS
-- ============================================
CREATE TABLE `subscription_plans` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `display_name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `price` DECIMAL(10,2) DEFAULT 0.00,
    `max_cameras` INT DEFAULT 10,
    `max_users` INT DEFAULT 5,
    `features` JSON NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 10. AI MODULES
-- ============================================
CREATE TABLE `ai_modules` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) UNIQUE NOT NULL,
    `display_name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `config_schema` JSON NULL,
    `default_config` JSON NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 11. AI MODULE CONFIGS
-- ============================================
CREATE TABLE `ai_module_configs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `organization_id` BIGINT UNSIGNED NULL,
    `ai_module_id` BIGINT UNSIGNED NOT NULL,
    `config` JSON NULL,
    `schedule` JSON NULL,
    `is_enabled` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`ai_module_id`) REFERENCES `ai_modules`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_org_module` (`organization_id`, `ai_module_id`),
    INDEX `idx_module_configs_organization` (`organization_id`),
    INDEX `idx_module_configs_module` (`ai_module_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 12. AI COMMANDS
-- ============================================
CREATE TABLE `ai_commands` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `organization_id` BIGINT UNSIGNED NULL,
    `title` VARCHAR(255) NOT NULL,
    `status` VARCHAR(50) DEFAULT 'queued',
    `payload` JSON NULL,
    `acknowledged_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL,
    FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE SET NULL,
    INDEX `idx_ai_commands_organization` (`organization_id`),
    INDEX `idx_ai_commands_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 13. INTEGRATIONS
-- ============================================
CREATE TABLE `integrations` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `organization_id` BIGINT UNSIGNED NULL,
    `type` VARCHAR(100) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `connection_config` JSON NULL,
    `is_active` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL,
    FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE SET NULL,
    INDEX `idx_integrations_organization` (`organization_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 14. UPDATES (Announcements)
-- ============================================
CREATE TABLE `updates` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `version` VARCHAR(50) NULL,
    `version_type` VARCHAR(20) NULL,
    `body` TEXT NULL,
    `release_notes` TEXT NULL,
    `changelog` TEXT NULL,
    `affected_modules` JSON NULL,
    `requires_manual_update` BOOLEAN DEFAULT FALSE,
    `download_url` VARCHAR(500) NULL,
    `checksum` VARCHAR(128) NULL,
    `file_size_mb` INT NULL,
    `organization_id` BIGINT UNSIGNED NULL,
    `is_published` BOOLEAN DEFAULT FALSE,
    `published_at` TIMESTAMP NULL,
    `release_date` TIMESTAMP NULL,
    `end_of_support_date` TIMESTAMP NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL,
    FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE SET NULL,
    INDEX `idx_updates_organization` (`organization_id`),
    INDEX `idx_updates_published` (`is_published`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 15. SYSTEM UPDATES (Real Update System)
-- ============================================
CREATE TABLE `system_updates` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `version` VARCHAR(50) UNIQUE NOT NULL,
    `update_id` VARCHAR(255) UNIQUE NOT NULL,
    `manifest` JSON NOT NULL,
    `status` ENUM('pending', 'installing', 'installed', 'failed', 'rollback') DEFAULT 'pending',
    `backup_id` VARCHAR(255) NULL,
    `installed_at` TIMESTAMP NULL,
    `error_message` TEXT NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL,
    INDEX `idx_system_updates_version` (`version`),
    INDEX `idx_system_updates_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 16. SYSTEM SETTINGS
-- ============================================
CREATE TABLE `system_settings` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(255) UNIQUE NOT NULL,
    `value` TEXT NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 17. PLATFORM WORDINGS
-- ============================================
CREATE TABLE `platform_wordings` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(255) UNIQUE NOT NULL,
    `default_value_ar` TEXT NULL,
    `default_value_en` TEXT NULL,
    `category` VARCHAR(100) NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 18. ORGANIZATION WORDINGS
-- ============================================
CREATE TABLE `organization_wordings` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `organization_id` BIGINT UNSIGNED NOT NULL,
    `wording_id` BIGINT UNSIGNED NOT NULL,
    `custom_value_ar` TEXT NULL,
    `custom_value_en` TEXT NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`wording_id`) REFERENCES `platform_wordings`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_org_wording` (`organization_id`, `wording_id`),
    INDEX `idx_org_wordings_organization` (`organization_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 19. MIGRATIONS TABLE
-- ============================================
CREATE TABLE `migrations` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `migration` VARCHAR(255) NOT NULL,
    `batch` INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERT DEMO DATA
-- ============================================

-- 1. Distributors
INSERT INTO `distributors` (`id`, `name`, `contact_email`, `contact_phone`, `address`, `commission_rate`, `status`) VALUES
(1, 'موزع تجريبي', 'partner@stc-solutions.com', '+20 100 000 0000', 'القاهرة، مصر', 15.00, 'active');

-- 2. Organizations
INSERT INTO `organizations` (`id`, `distributor_id`, `name`, `slug`, `contact_email`, `contact_phone`, `address`, `status`) VALUES
(1, 1, 'مؤسسة تجريبية', 'demo-org', 'admin@demo-org.com', '+20 100 000 0001', 'القاهرة، مصر', 'active');

-- 3. Users (Super Admin)
INSERT INTO `users` (`id`, `organization_id`, `name`, `email`, `password`, `role`, `is_super_admin`, `is_active`, `email_verified_at`) VALUES
(1, NULL, 'Super Admin', 'superadmin@stc-solutions.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin', TRUE, TRUE, NOW());

-- 4. Users (Organization Owner)
INSERT INTO `users` (`id`, `organization_id`, `name`, `email`, `password`, `role`, `is_super_admin`, `is_active`, `email_verified_at`) VALUES
(2, 1, 'صاحب المؤسسة', 'owner@demo-org.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'owner', FALSE, TRUE, NOW());

-- 5. Licenses
INSERT INTO `licenses` (`id`, `organization_id`, `license_key`, `expires_at`, `max_cameras`, `max_users`, `status`) VALUES
(1, 1, 'DEMO-LICENSE-001', DATE_ADD(NOW(), INTERVAL 1 YEAR), 50, 20, 'active');

-- 6. Subscription Plans
INSERT INTO `subscription_plans` (`id`, `name`, `display_name`, `description`, `price`, `max_cameras`, `max_users`, `features`, `is_active`) VALUES
(1, 'basic', 'الباقة الأساسية', 'باقة أساسية للمؤسسات الصغيرة', 500.00, 10, 5, '["cameras", "basic_analytics"]', TRUE),
(2, 'professional', 'الباقة الاحترافية', 'باقة احترافية للمؤسسات المتوسطة', 1500.00, 50, 20, '["cameras", "advanced_analytics", "ai_modules"]', TRUE),
(3, 'enterprise', 'الباقة المؤسسية', 'باقة مؤسسية للمؤسسات الكبيرة', 5000.00, 128, 100, '["cameras", "advanced_analytics", "all_ai_modules", "priority_support"]', TRUE);

-- 7. AI Modules
INSERT INTO `ai_modules` (`id`, `name`, `display_name`, `description`, `is_active`) VALUES
(1, 'face_detection', 'كشف الوجوه', 'كشف وتحديد الوجوه في الفيديو', TRUE),
(2, 'face_recognition', 'التعرف على الوجوه', 'التعرف على الأشخاص من خلال الوجوه', TRUE),
(3, 'object_detection', 'كشف الأشياء', 'كشف وتحديد الأشياء في الفيديو', TRUE),
(4, 'vehicle_detection', 'كشف المركبات', 'كشف وتحديد المركبات', TRUE),
(5, 'license_plate_recognition', 'قراءة لوحات الأرقام', 'قراءة لوحات أرقام المركبات', TRUE),
(6, 'crowd_counting', 'عد الحشود', 'عد الأشخاص في الحشود', TRUE),
(7, 'intrusion_detection', 'كشف التسلل', 'كشف التسلل في المناطق المحظورة', TRUE),
(8, 'loitering_detection', 'كشف التكاسل', 'كشف الأشخاص المتكاسلين', TRUE),
(9, 'abandoned_object', 'الأشياء المتروكة', 'كشف الأشياء المتروكة', TRUE);

-- 8. System Settings
INSERT INTO `system_settings` (`key`, `value`) VALUES
('system_version', '1.0.0'),
('platform_name', 'STC AI-VAP'),
('platform_name_ar', 'منصة تحليل الفيديو بالذكاء الاصطناعي');

-- ============================================
-- 15. PERSONAL ACCESS TOKENS (Laravel Sanctum)
-- ============================================
CREATE TABLE `personal_access_tokens` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `tokenable_type` VARCHAR(255) NOT NULL,
    `tokenable_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `token` VARCHAR(64) UNIQUE NOT NULL,
    `abilities` TEXT NULL,
    `last_used_at` TIMESTAMP NULL,
    `expires_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_personal_access_tokens_tokenable` (`tokenable_type`, `tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- END OF DATABASE SETUP
-- ============================================

