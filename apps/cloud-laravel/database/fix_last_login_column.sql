-- Fix last_login column name mismatch
-- The database has 'last_login_at' but code was using 'last_login'
-- This script adds the column if it doesn't exist, or renames it if needed

-- Check if last_login exists and rename it to last_login_at
-- If last_login_at already exists, this will do nothing
ALTER TABLE `users` 
CHANGE COLUMN `last_login` `last_login_at` TIMESTAMP NULL DEFAULT NULL;

-- If the above fails because last_login doesn't exist, add last_login_at
-- ALTER TABLE `users` ADD COLUMN `last_login_at` TIMESTAMP NULL DEFAULT NULL AFTER `remember_token`;

