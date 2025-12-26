-- Fix Super Admin Account Status
-- Run this SQL script to activate the super admin account if it's disabled

-- Option 1: Update by email
UPDATE `users` 
SET `is_active` = TRUE 
WHERE `email` = 'superadmin@stc-solutions.com' 
   OR `email` = 'admin@stcsolutions.net';

-- Option 2: Update all super admin users
UPDATE `users` 
SET `is_active` = TRUE 
WHERE `role` = 'super_admin' 
   OR `is_super_admin` = TRUE;

-- Verify the update
SELECT `id`, `name`, `email`, `role`, `is_super_admin`, `is_active` 
FROM `users` 
WHERE `role` = 'super_admin' 
   OR `is_super_admin` = TRUE;

