# Deployment Checklist - Laravel API on aaPanel

## Pre-Deployment Verification

- [ ] Laravel backend exists at: `/www/wwwroot/stcsolutions.online/backend/apps/cloud-laravel`
- [ ] `public/index.php` exists and is readable
- [ ] `vendor/` directory exists (Composer dependencies installed)
- [ ] `.env` file exists and is configured
- [ ] PHP-FPM 8.2 is running: `systemctl status php-fpm-82`
- [ ] `index.html` removed from `public/` directory

## aaPanel Configuration

- [ ] Site created: `api.stcsolutions.online`
- [ ] Root Directory: `/www/wwwroot/stcsolutions.online/backend/apps/cloud-laravel/public`
- [ ] Run Directory: **EMPTY** (not set)
- [ ] PHP Version: `PHP 8.2`
- [ ] Rewrite: **ENABLED**
- [ ] Default Document: `index.php` (first in list)

## Nginx Configuration

- [ ] Nginx config file exists: `/www/server/panel/vhost/nginx/api.stcsolutions.online.conf`
- [ ] `root` directive points to `public` directory
- [ ] `fastcgi_pass` socket path is correct
- [ ] `try_files` includes `/index.php?$query_string`
- [ ] Configuration tested: `nginx -t` (no errors)
- [ ] Nginx reloaded: `systemctl reload nginx`

## File Permissions

- [ ] Ownership set: `chown -R www:www /www/wwwroot/stcsolutions.online/backend/apps/cloud-laravel`
- [ ] Directories: `755`
- [ ] Files: `644`
- [ ] Storage: `775` (writable)
- [ ] Bootstrap cache: `775` (writable)

## Testing

- [ ] `/index.php` returns Laravel response (not 404)
- [ ] `/api/v1/public/landing` returns JSON (200/401/403, not 404)
- [ ] Nginx error log shows no critical errors
- [ ] PHP-FPM error log shows no fatal errors

## Post-Deployment

- [ ] Remove test files (if any)
- [ ] Verify SSL certificate (if using HTTPS)
- [ ] Test all critical API endpoints
- [ ] Monitor error logs for 24 hours

## Troubleshooting

If still getting 404:
1. Double-check Root Directory in aaPanel
2. Verify PHP-FPM socket path
3. Check Nginx error log: `tail -f /www/wwwlogs/api.stcsolutions.online.error.log`
4. Check PHP-FPM log: `tail -f /www/server/php/82/var/log/php-fpm.log`
5. Verify file permissions
6. Test PHP execution with `test.php` file

If getting 502 Bad Gateway:
1. Check PHP-FPM is running: `systemctl status php-fpm-82`
2. Verify socket path matches in both Nginx and PHP-FPM config
3. Check socket permissions: `ls -la /tmp/php-cgi-82.sock`

If getting 500 Internal Server Error:
1. Check Laravel `.env` file exists
2. Check storage permissions: `ls -la storage/`
3. Check PHP error log for Laravel errors
4. Run: `php artisan config:clear` and `php artisan cache:clear`

