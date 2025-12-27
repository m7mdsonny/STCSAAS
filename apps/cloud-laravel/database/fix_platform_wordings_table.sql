-- ============================================
-- Fix platform_wordings table structure
-- ============================================
-- This script fixes the platform_wordings table
-- to match the migration structure
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Drop the old table if it exists
DROP TABLE IF EXISTS `organization_wordings`;
DROP TABLE IF EXISTS `platform_wordings`;

-- Create the correct table structure
CREATE TABLE `platform_wordings` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(255) UNIQUE NOT NULL,
    `label` VARCHAR(255) NULL,
    `value_ar` TEXT NULL,
    `value_en` TEXT NULL,
    `category` VARCHAR(100) NULL DEFAULT 'general',
    `context` VARCHAR(255) NULL,
    `description` TEXT NULL,
    `is_customizable` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL,
    INDEX `idx_platform_wordings_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Recreate organization_wordings table
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

SET FOREIGN_KEY_CHECKS = 1;

-- Insert platform wordings data
INSERT INTO `platform_wordings` (`id`, `key`, `label`, `value_ar`, `value_en`, `category`, `is_customizable`) VALUES
(1, 'welcome_message', 'رسالة الترحيب', 'مرحباً بك في منصة STC AI-VAP', 'Welcome to STC AI-VAP Platform', 'general', TRUE),
(2, 'dashboard_title', 'عنوان لوحة التحكم', 'لوحة التحكم', 'Dashboard', 'navigation', TRUE),
(3, 'cameras_title', 'عنوان الكاميرات', 'إدارة الكاميرات', 'Camera Management', 'navigation', TRUE),
(4, 'alerts_title', 'عنوان التنبيهات', 'التنبيهات', 'Alerts', 'navigation', TRUE),
(5, 'people_title', 'عنوان الأشخاص', 'الأشخاص المسجلون', 'Registered People', 'navigation', TRUE),
(6, 'vehicles_title', 'عنوان المركبات', 'المركبات المسجلة', 'Registered Vehicles', 'navigation', TRUE),
(7, 'settings_title', 'عنوان الإعدادات', 'الإعدادات', 'Settings', 'navigation', TRUE),
(8, 'users_title', 'عنوان المستخدمين', 'المستخدمون', 'Users', 'navigation', TRUE),
(9, 'organizations_title', 'عنوان المؤسسات', 'المؤسسات', 'Organizations', 'navigation', TRUE),
(10, 'notifications_title', 'عنوان الإشعارات', 'الإشعارات', 'Notifications', 'navigation', TRUE),
(11, 'add_button', 'زر الإضافة', 'إضافة', 'Add', 'buttons', TRUE),
(12, 'edit_button', 'زر التعديل', 'تعديل', 'Edit', 'buttons', TRUE),
(13, 'delete_button', 'زر الحذف', 'حذف', 'Delete', 'buttons', TRUE),
(14, 'save_button', 'زر الحفظ', 'حفظ', 'Save', 'buttons', TRUE),
(15, 'cancel_button', 'زر الإلغاء', 'إلغاء', 'Cancel', 'buttons', TRUE),
(16, 'search_placeholder', 'نص البحث', 'ابحث...', 'Search...', 'forms', TRUE),
(17, 'loading_message', 'رسالة التحميل', 'جاري التحميل...', 'Loading...', 'messages', TRUE),
(18, 'success_message', 'رسالة النجاح', 'تم بنجاح', 'Success', 'messages', TRUE),
(19, 'error_message', 'رسالة الخطأ', 'حدث خطأ', 'Error', 'messages', TRUE),
(20, 'confirm_delete', 'تأكيد الحذف', 'هل أنت متأكد من الحذف؟', 'Are you sure you want to delete?', 'messages', TRUE);

