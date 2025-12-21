# aaPanel Quick Reference - API Site Configuration

## Exact Settings for `api.stcsolutions.online`

### Basic Information Tab
```
Domain: api.stcsolutions.online
Root Directory: /www/wwwroot/stcsolutions.online/backend/apps/cloud-laravel/public
Run Directory: [LEAVE EMPTY - DO NOT SET]
PHP Version: PHP 8.2
```

### Default Document Tab
```
Order (top to bottom):
1. index.php
2. index.html
3. index.htm
```

### Rewrite Tab
```
Status: ON (Enable)
```

### Logs Tab
```
Access Log: ON
Error Log: ON
```

## Nginx Configuration Location

The Nginx config file is typically located at:
```
/www/server/panel/vhost/nginx/api.stcsolutions.online.conf
```

Or for HTTP (port 80):
```
/www/server/panel/vhost/nginx/api.stcsolutions.online_80.conf
```

And for HTTPS (port 443):
```
/www/server/panel/vhost/nginx/api.stcsolutions.online_443.conf
```

## PHP-FPM Socket Location

To find your PHP-FPM socket, check:
```bash
cat /www/server/php/82/etc/php-fpm.d/www.conf | grep "listen ="
```

Common values:
- `unix:/tmp/php-cgi-82.sock`
- `unix:/tmp/php-fpm-82.sock`
- `127.0.0.1:9000` (TCP)

## Commands to Apply Changes

```bash
# 1. Test Nginx configuration
nginx -t

# 2. Reload Nginx
systemctl reload nginx
# OR
/etc/init.d/nginx reload

# 3. Check PHP-FPM status
systemctl status php-fpm-82

# 4. Restart PHP-FPM if needed
systemctl restart php-fpm-82
```

## Verification Commands

```bash
# Test index.php
curl -i https://api.stcsolutions.online/index.php

# Test API endpoint
curl -i https://api.stcsolutions.online/api/v1/public/landing \
  -H "Accept: application/json"

# Check Nginx error log
tail -20 /www/wwwlogs/api.stcsolutions.online.error.log

# Check PHP-FPM log
tail -20 /www/server/php/82/var/log/php-fpm.log
```

