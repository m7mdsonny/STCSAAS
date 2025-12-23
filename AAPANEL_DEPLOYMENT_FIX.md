# aaPanel Deployment Fix - Laravel API Routing Issue

## 🔴 Problem
- `api.stcsolutions.online` returns frontend HTML instead of Laravel API
- `/api/health` returns 404
- Both domains are serving from the same root

## ✅ Solution

### Step 1: Verify Separate Websites in aaPanel

1. Open **aaPanel**
2. Go to **Website** section
3. Verify you have **TWO separate websites**:
   - `stcsolutions.online` (Frontend)
   - `api.stcsolutions.online` (Backend)

**If you only have ONE website:**
- Create a new website for `api.stcsolutions.online`
- Set Document Root to: `/www/wwwroot/api.stcsolutions.online/public`
- Set PHP version to: **PHP 8.2** (or your Laravel version)

---

### Step 2: Configure Backend Website (api.stcsolutions.online)

1. In aaPanel, go to: **Website > api.stcsolutions.online > Settings**
2. Click **Configuration File** tab
3. **Delete all existing content**
4. Copy the entire content from: **`AAPANEL_NGINX_BACKEND.conf`**
5. **Important:** Update the PHP socket path:
   ```nginx
   fastcgi_pass unix:/tmp/php-cgi-82.sock;
   ```
   - Replace `82` with your PHP version (e.g., `81`, `83`, `74`)
   - To find your PHP socket: `ls /tmp/php-cgi-*.sock`
6. Click **Save**
7. Click **Reload** (or restart Nginx)

---

### Step 3: Configure Frontend Website (stcsolutions.online)

1. In aaPanel, go to: **Website > stcsolutions.online > Settings**
2. Click **Configuration File** tab
3. **Delete all existing content**
4. Copy the entire content from: **`AAPANEL_NGINX_FRONTEND.conf`**
5. Click **Save**
6. Click **Reload** (or restart Nginx)

---

### Step 4: Verify Document Roots

**In aaPanel, check both websites:**

#### Frontend (stcsolutions.online):
- **Document Root:** `/www/wwwroot/stcsolutions.online`
- Should contain: `index.html` and `assets/` folder

#### Backend (api.stcsolutions.online):
- **Document Root:** `/www/wwwroot/api.stcsolutions.online/public`
- Should contain: `index.php` (Laravel entry point)

**To verify:**
```bash
# Check Frontend
ls -la /www/wwwroot/stcsolutions.online/index.html

# Check Backend
ls -la /www/wwwroot/api.stcsolutions.online/public/index.php
```

---

### Step 5: Test the Configuration

```bash
# Test Backend API
curl https://api.stcsolutions.online/api/v1/public/landing

# Should return JSON, NOT HTML

# Test Frontend
curl https://stcsolutions.online

# Should return HTML (React app)
```

---

## 🔧 Manual Nginx Configuration (Alternative)

If aaPanel interface doesn't work, edit Nginx configs directly:

### Backend Config Location:
```bash
/etc/nginx/sites-available/api.stcsolutions.online.conf
# or
/www/server/panel/vhost/nginx/api.stcsolutions.online.conf
```

### Frontend Config Location:
```bash
/etc/nginx/sites-available/stcsolutions.online.conf
# or
/www/server/panel/vhost/nginx/stcsolutions.online.conf
```

**After editing:**
```bash
# Test Nginx config
nginx -t

# Reload Nginx
systemctl reload nginx
# or
/etc/init.d/nginx reload
```

---

## 🐛 Troubleshooting

### Issue: Still getting frontend HTML on API domain

**Check:**
1. Are both websites separate in aaPanel?
2. Is Document Root correct for backend? (`/public` directory)
3. Did you reload Nginx after changes?

**Fix:**
```bash
# Check which config is being used
nginx -T | grep -A 20 "api.stcsolutions.online"

# Check document root in config
grep "root" /www/server/panel/vhost/nginx/api.stcsolutions.online.conf

# Should show: root /www/wwwroot/api.stcsolutions.online/public;
```

### Issue: 404 on /api/* routes

**Check:**
1. Laravel rewrite rules are present:
   ```nginx
   location / {
       try_files $uri $uri/ /index.php?$query_string;
   }
   ```
2. PHP handler is configured correctly
3. Laravel routes exist: `php artisan route:list`

**Fix:**
```bash
# Check Laravel routes
cd /www/wwwroot/api.stcsolutions.online
php artisan route:list | grep api

# Test Laravel directly
php artisan serve --host=127.0.0.1 --port=8000
curl http://127.0.0.1:8000/api/v1/public/landing
```

### Issue: PHP errors or 500 errors

**Check:**
1. PHP version matches Laravel requirements
2. File permissions:
   ```bash
   chmod -R 755 /www/wwwroot/api.stcsolutions.online/storage
   chmod -R 755 /www/wwwroot/api.stcsolutions.online/bootstrap/cache
   chown -R www:www /www/wwwroot/api.stcsolutions.online/storage
   chown -R www:www /www/wwwroot/api.stcsolutions.online/bootstrap/cache
   ```
3. Check error logs:
   ```bash
   tail -50 /www/wwwlogs/api.stcsolutions.online.error.log
   ```

---

## ✅ Verification Checklist

- [ ] Two separate websites in aaPanel
- [ ] Backend Document Root: `/www/wwwroot/api.stcsolutions.online/public`
- [ ] Frontend Document Root: `/www/wwwroot/stcsolutions.online`
- [ ] Backend Nginx config has Laravel rewrite rules
- [ ] Frontend Nginx config has SPA routing
- [ ] PHP socket path is correct in backend config
- [ ] Nginx reloaded after changes
- [ ] `curl https://api.stcsolutions.online/api/v1/public/landing` returns JSON
- [ ] `curl https://stcsolutions.online` returns HTML

---

## 📝 Key Points

1. **Document Root Difference:**
   - Frontend: `/www/wwwroot/stcsolutions.online` (no `/public`)
   - Backend: `/www/wwwroot/api.stcsolutions.online/public` (with `/public`)

2. **Rewrite Rules:**
   - Frontend: `try_files $uri $uri/ /index.html;` (SPA routing)
   - Backend: `try_files $uri $uri/ /index.php?$query_string;` (Laravel routing)

3. **PHP Handler:**
   - Only needed for backend
   - Frontend doesn't need PHP

---

**Last Updated:** January 2, 2025


