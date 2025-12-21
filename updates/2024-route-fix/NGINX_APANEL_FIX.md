# Nginx/aaPanel Configuration Fix for Laravel API

## Problem
Nginx returns 404 for all requests, including `/index.php`, indicating incorrect document root or PHP-FPM binding.

## Solution

### 1. aaPanel Site Settings for `api.stcsolutions.online`

#### Basic Settings
- **Domain**: `api.stcsolutions.online`
- **Root Directory**: `/www/wwwroot/stcsolutions.online/backend/apps/cloud-laravel/public`
  - ⚠️ **CRITICAL**: Must point to `public` folder, NOT the Laravel root
- **Run Directory**: Leave **EMPTY** (do not set)
  - Setting Run Directory would cause path issues like `public/public`
- **PHP Version**: `PHP 8.2`
- **PHP Handler**: `php-fpm-82` (or `php-fpm` if that's the only option)

#### Advanced Settings
- **Default Document**: `index.php` (should be first in the list)
  - Order: `index.php`, `index.html`, `index.htm`
- **Rewrite**: Enable (required for Laravel routing)
- **Logs**: Enable access and error logs for debugging

### 2. Nginx Virtual Host Configuration

The Nginx configuration should look like this:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name api.stcsolutions.online;
    
    # Redirect HTTP to HTTPS (if SSL is configured)
    # return 301 https://$server_name$request_uri;
    
    # If not using SSL, use this block:
    root /www/wwwroot/stcsolutions.online/backend/apps/cloud-laravel/public;
    index index.php index.html;
    
    # Logging
    access_log /www/wwwlogs/api.stcsolutions.online.log;
    error_log /www/wwwlogs/api.stcsolutions.online.error.log;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Laravel public directory
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    # PHP-FPM configuration
    location ~ \.php$ {
        fastcgi_pass unix:/tmp/php-cgi-82.sock;
        # OR if using TCP: fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_read_timeout 300;
        fastcgi_buffer_size 128k;
        fastcgi_buffers 4 256k;
        fastcgi_busy_buffers_size 256k;
    }
    
    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }
    
    # Deny access to storage and bootstrap cache
    location ~ ^/(storage|bootstrap/cache) {
        deny all;
    }
    
    # Static assets caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
}
```

**If using HTTPS (recommended):**

```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.stcsolutions.online;
    
    # SSL certificates (aaPanel usually manages these)
    ssl_certificate /www/server/panel/vhost/cert/api.stcsolutions.online/fullchain.pem;
    ssl_certificate_key /www/server/panel/vhost/cert/api.stcsolutions.online/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    root /www/wwwroot/stcsolutions.online/backend/apps/cloud-laravel/public;
    index index.php index.html;
    
    # Logging
    access_log /www/wwwlogs/api.stcsolutions.online.log;
    error_log /www/wwwlogs/api.stcsolutions.online.error.log;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Laravel public directory
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    # PHP-FPM configuration
    location ~ \.php$ {
        fastcgi_pass unix:/tmp/php-cgi-82.sock;
        # OR if using TCP: fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_read_timeout 300;
        fastcgi_buffer_size 128k;
        fastcgi_buffers 4 256k;
        fastcgi_busy_buffers_size 256k;
    }
    
    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }
    
    # Deny access to storage and bootstrap cache
    location ~ ^/(storage|bootstrap/cache) {
        deny all;
    }
    
    # Static assets caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
}

# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name api.stcsolutions.online;
    return 301 https://$server_name$request_uri;
}
```

### 3. Finding the Correct PHP-FPM Socket

To find the correct PHP-FPM socket path, run:

```bash
# Check PHP-FPM socket
ls -la /tmp/php-cgi-*.sock
# OR
ls -la /dev/shm/php-fpm-*.sock
# OR check the pool config
cat /www/server/php/82/etc/php-fpm.d/www.conf | grep listen
```

Common socket paths in aaPanel:
- `/tmp/php-cgi-82.sock`
- `/tmp/php-fpm-82.sock`
- `/dev/shm/php-fpm-82.sock`
- TCP: `127.0.0.1:9000` (if using TCP instead of socket)

### 4. Steps to Apply Configuration

#### Option A: Using aaPanel Web Interface

1. **Login to aaPanel**
2. **Go to**: Website → Manage → Select `api.stcsolutions.online`
3. **Click**: "Configuration" or "Settings"
4. **Set Root Directory**: `/www/wwwroot/stcsolutions.online/backend/apps/cloud-laravel/public`
5. **Set PHP Version**: `PHP 8.2`
6. **Enable Rewrite**: Toggle ON
7. **Default Document**: Ensure `index.php` is first
8. **Run Directory**: Leave EMPTY
9. **Click**: "Save" or "Submit"
10. **Click**: "Reload" or "Restart" Nginx

#### Option B: Manual Nginx Configuration

1. **Edit Nginx config**:
   ```bash
   nano /www/server/panel/vhost/nginx/api.stcsolutions.online.conf
   # OR
   nano /www/server/panel/vhost/nginx/api.stcsolutions.online_80.conf
   ```

2. **Replace content** with the configuration above (adjusting PHP-FPM socket path)

3. **Test Nginx configuration**:
   ```bash
   nginx -t
   ```

4. **Reload Nginx**:
   ```bash
   systemctl reload nginx
   # OR
   /etc/init.d/nginx reload
   ```

### 5. Verification Steps

After applying the configuration:

1. **Test PHP execution**:
   ```bash
   curl -i https://api.stcsolutions.online/index.php
   ```
   Should return Laravel response, not 404.

2. **Test API endpoint**:
   ```bash
   curl -i https://api.stcsolutions.online/api/v1/public/landing \
     -H "Accept: application/json"
   ```
   Should return JSON (200, 401, or 403), not 404.

3. **Check Nginx error log**:
   ```bash
   tail -f /www/wwwlogs/api.stcsolutions.online.error.log
   ```

4. **Check PHP-FPM error log**:
   ```bash
   tail -f /www/server/php/82/var/log/php-fpm.log
   ```

### 6. Common Issues and Fixes

#### Issue: Still getting 404
- **Check**: Document root is exactly `/www/wwwroot/stcsolutions.online/backend/apps/cloud-laravel/public`
- **Check**: PHP-FPM socket path is correct
- **Check**: PHP-FPM is running: `systemctl status php-fpm-82`
- **Check**: File permissions: `chown -R www:www /www/wwwroot/stcsolutions.online/backend/apps/cloud-laravel`

#### Issue: 502 Bad Gateway
- **Check**: PHP-FPM is running
- **Check**: Socket path matches in both Nginx and PHP-FPM config
- **Check**: Socket permissions: `chmod 666 /tmp/php-cgi-82.sock`

#### Issue: 500 Internal Server Error
- **Check**: Laravel `.env` file exists and is configured
- **Check**: Storage permissions: `chmod -R 775 storage bootstrap/cache`
- **Check**: PHP error log: `/www/server/php/82/var/log/php-fpm.log`

### 7. File Permissions

Ensure correct permissions:

```bash
# Set ownership
chown -R www:www /www/wwwroot/stcsolutions.online/backend/apps/cloud-laravel

# Set directory permissions
find /www/wwwroot/stcsolutions.online/backend/apps/cloud-laravel -type d -exec chmod 755 {} \;

# Set file permissions
find /www/wwwroot/stcsolutions.online/backend/apps/cloud-laravel -type f -exec chmod 644 {} \;

# Special permissions for Laravel
chmod -R 775 /www/wwwroot/stcsolutions.online/backend/apps/cloud-laravel/storage
chmod -R 775 /www/wwwroot/stcsolutions.online/backend/apps/cloud-laravel/bootstrap/cache
```

### 8. About index.html.bak

**Recommendation**: Keep it removed or delete it entirely.

- Laravel uses `index.php` as the front controller
- `index.html` would take priority if present, breaking Laravel routing
- If you need it later, store it outside the `public` directory

```bash
# If you want to keep it as backup
mv /www/wwwroot/stcsolutions.online/backend/apps/cloud-laravel/public/index.html.bak \
   /www/wwwroot/stcsolutions.online/backend/apps/cloud-laravel/index.html.backup

# Or delete it
rm /www/wwwroot/stcsolutions.online/backend/apps/cloud-laravel/public/index.html.bak
```

### 9. Final Checklist

- [ ] Root Directory set to `public` folder
- [ ] Run Directory is EMPTY
- [ ] PHP Version is 8.2
- [ ] PHP-FPM socket path is correct in Nginx config
- [ ] Rewrite is enabled
- [ ] Default Document has `index.php` first
- [ ] Nginx configuration tested (`nginx -t`)
- [ ] Nginx reloaded
- [ ] File permissions set correctly
- [ ] `index.html` removed from public directory
- [ ] Test `/index.php` returns Laravel response
- [ ] Test `/api/v1/public/landing` returns JSON

### 10. Quick Test Script

Create a test file to verify PHP execution:

```bash
echo "<?php phpinfo(); ?>" > /www/wwwroot/stcsolutions.online/backend/apps/cloud-laravel/public/test.php
```

Then visit: `https://api.stcsolutions.online/test.php`

If this works, PHP-FPM is correctly configured. **Remember to delete this file after testing!**

