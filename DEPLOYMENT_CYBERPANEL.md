# دليل التنصيب الكامل على CyberPanel
## STC AI-VAP Platform - Deployment Guide

**تاريخ الإنشاء:** 2 يناير 2025  
**المنصة:** CyberPanel  
**المسار:** `/home/stcsolutions.online/public_html/`

---

## 📋 المتطلبات الأساسية

- CyberPanel مثبت ومشغل
- PHP 8.2+ مع جميع الإضافات المطلوبة
- PostgreSQL مثبت ومشغل
- Node.js 18+ و npm
- Composer
- Git

---

## 🗂️ هيكل المجلدات المطلوب

```
/home/stcsolutions.online/public_html/
├── backend/                    # Laravel API (من cloud-laravel)
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── public/                 # نقطة الدخول الرئيسية
│   ├── resources/
│   ├── routes/
│   ├── storage/
│   ├── vendor/
│   ├── .env                    # ⚠️ سيتم الحفاظ عليه
│   └── ...
│
└── frontend/                   # React Web Portal (من web-portal)
    ├── public/
    ├── src/
    ├── dist/                   # بعد البناء
    ├── node_modules/
    ├── package.json
    └── ...
```

---

## 📝 خطوات التنصيب الكاملة

### المرحلة 1: التحضير والنسخ الاحتياطي

```bash
# 1. الانتقال إلى المجلد الرئيسي
cd /home/stcsolutions.online/public_html/

# 2. عمل نسخة احتياطية من ملف .env (إذا كان موجود)
if [ -f backend/.env ]; then
    cp backend/.env backend/.env.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ تم عمل نسخة احتياطية من .env"
fi

# 3. عمل نسخة احتياطية من قاعدة البيانات (اختياري)
# يمكنك استخدام pg_dump إذا أردت
```

---

### المرحلة 2: رفع الملفات

#### الطريقة الأولى: استخدام Git (مُوصى بها)

```bash
# 1. الانتقال إلى المجلد الرئيسي
cd /home/stcsolutions.online/public_html/

# 2. إذا كان هناك مجلدات قديمة، احذفها (احذر: سيتم حذف الكود فقط)
# ⚠️ لا تحذف .env أو قاعدة البيانات
rm -rf backend/app backend/bootstrap backend/config backend/database/migrations backend/routes backend/vendor
rm -rf frontend/src frontend/public frontend/node_modules frontend/dist

# 3. استنساخ المشروع (أو تحديثه إذا كان موجود)
cd /home/stcsolutions.online/
git clone https://github.com/m7mdsonny/STCSAAS.git temp_stc || cd STCSAAS && git pull

# 4. نسخ ملفات Laravel
cp -r STCSAAS/apps/cloud-laravel/* public_html/backend/

# 5. نسخ ملفات React
cp -r STCSAAS/apps/web-portal/* public_html/frontend/

# 6. تنظيف المجلد المؤقت
rm -rf temp_stc
# أو إذا كنت تستخدم المجلد الموجود:
# cd STCSAAS && git pull
```

#### الطريقة الثانية: رفع مباشر عبر FTP/SFTP

1. ارفع محتويات `cloud-laravel/` إلى `/home/stcsolutions.online/public_html/backend/`
2. ارفع محتويات `web-portal/` إلى `/home/stcsolutions.online/public_html/frontend/`

---

### المرحلة 3: إعداد Laravel Backend

```bash
# الانتقال إلى مجلد Laravel
cd /home/stcsolutions.online/public_html/backend/

# 1. التأكد من وجود ملف .env (إذا لم يكن موجود، انسخه من .env.example)
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ تم نسخ .env.example إلى .env"
    else
        echo "⚠️ تحذير: ملف .env غير موجود و .env.example غير موجود أيضاً"
    fi
fi

# 2. تثبيت Composer Dependencies
composer install --no-dev --optimize-autoloader

# 3. تنظيف الكاش القديم
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# 4. إنشاء رابط التخزين (Storage Link)
php artisan storage:link

# 5. تشغيل Migrations (إذا كانت هناك migrations جديدة)
php artisan migrate --force

# 6. تحسين الأداء
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 7. تعيين الصلاحيات
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

---

### المرحلة 4: إعداد React Frontend

```bash
# الانتقال إلى مجلد React
cd /home/stcsolutions.online/public_html/frontend/

# 1. تثبيت Node Modules
npm install

# 2. تنظيف البناء القديم
rm -rf dist node_modules/.vite

# 3. بناء المشروع للإنتاج
npm run build

# 4. التحقق من وجود مجلد dist
if [ -d dist ]; then
    echo "✅ تم بناء المشروع بنجاح"
    ls -la dist/
else
    echo "❌ فشل بناء المشروع"
    exit 1
fi
```

---

### المرحلة 5: إعداد Nginx (CyberPanel)

#### إنشاء/تحديث ملف Nginx Configuration

```bash
# ملف الإعدادات: /etc/nginx/conf.d/stcsolutions.online.conf
# أو عبر CyberPanel: Websites > stcsolutions.online > Manage > Nginx Config
```

**إعدادات Nginx المطلوبة:**

```nginx
# Backend API (Laravel)
server {
    listen 80;
    server_name api.stcsolutions.online;
    root /home/stcsolutions.online/public_html/backend/public;
    index index.php index.html;

    # Logs
    access_log /home/stcsolutions.online/logs/api_access.log;
    error_log /home/stcsolutions.online/logs/api_error.log;

    # Laravel Public Directory
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # PHP Handler
    location ~ \.php$ {
        fastcgi_pass unix:/usr/local/lsws/lsphp82/bin/lsphp;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_read_timeout 300;
    }

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }
}

# Frontend Web Portal (React)
server {
    listen 80;
    server_name stcsolutions.online www.stcsolutions.online;
    root /home/stcsolutions.online/public_html/frontend/dist;
    index index.html;

    # Logs
    access_log /home/stcsolutions.online/logs/frontend_access.log;
    error_log /home/stcsolutions.online/logs/frontend_error.log;

    # SPA Routing - جميع الطلبات ترجع إلى index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static Assets Caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

**بعد تعديل Nginx:**

```bash
# اختبار إعدادات Nginx
nginx -t

# إعادة تحميل Nginx
systemctl reload nginx
# أو
service nginx reload
```

---

### المرحلة 6: إعداد SSL (Let's Encrypt)

```bash
# عبر CyberPanel:
# Websites > stcsolutions.online > SSL > Issue SSL
# Websites > api.stcsolutions.online > SSL > Issue SSL

# أو عبر الأوامر:
certbot --nginx -d stcsolutions.online -d www.stcsolutions.online
certbot --nginx -d api.stcsolutions.online
```

---

### المرحلة 7: التحقق من الإعدادات

```bash
# 1. التحقق من ملف .env
cd /home/stcsolutions.online/public_html/backend/
cat .env | grep -E "APP_ENV|APP_DEBUG|DB_|APP_URL|API_URL"

# 2. التحقق من قاعدة البيانات
php artisan tinker
# في Tinker:
# DB::connection()->getPdo();
# exit

# 3. التحقق من Routes
php artisan route:list | head -20

# 4. التحقق من الصلاحيات
ls -la storage bootstrap/cache

# 5. اختبار API
curl http://api.stcsolutions.online/api/v1/public/landing

# 6. اختبار Frontend
curl http://stcsolutions.online
```

---

### المرحلة 8: إعداد Cron Jobs (Laravel Scheduler)

```bash
# فتح Crontab
crontab -e

# إضافة السطر التالي (يستبدل المسار بالمسار الصحيح)
* * * * * cd /home/stcsolutions.online/public_html/backend && php artisan schedule:run >> /dev/null 2>&1
```

---

### المرحلة 9: إعداد Queue Worker (إذا كنت تستخدم Queues)

```bash
# إنشاء Systemd Service
sudo nano /etc/systemd/system/stc-queue.service
```

**محتوى الملف:**

```ini
[Unit]
Description=STC AI-VAP Queue Worker
After=network.target

[Service]
User=www-data
Group=www-data
Restart=always
ExecStart=/usr/bin/php /home/stcsolutions.online/public_html/backend/artisan queue:work --sleep=3 --tries=3 --max-time=3600

[Install]
WantedBy=multi-user.target
```

**تفعيل الخدمة:**

```bash
sudo systemctl daemon-reload
sudo systemctl enable stc-queue
sudo systemctl start stc-queue
sudo systemctl status stc-queue
```

---

## 🔧 أوامر الصيانة والتحديث

### تحديث الكود

```bash
# 1. الانتقال إلى المجلد المؤقت
cd /home/stcsolutions.online/
git clone https://github.com/m7mdsonny/STCSAAS.git temp_update || cd STCSAAS && git pull

# 2. نسخ الملفات الجديدة
cp -r STCSAAS/apps/cloud-laravel/* public_html/backend/
cp -r STCSAAS/apps/web-portal/* public_html/frontend/

# 3. تحديث Laravel
cd public_html/backend/
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan cache:clear
php artisan config:cache
php artisan route:cache

# 4. تحديث React
cd ../frontend/
npm install
npm run build

# 5. تنظيف
cd /home/stcsolutions.online/
rm -rf temp_update
```

### تنظيف الكاش

```bash
# Laravel Cache
cd /home/stcsolutions.online/public_html/backend/
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan optimize:clear

# React Build Cache
cd /home/stcsolutions.online/public_html/frontend/
rm -rf dist node_modules/.vite
npm run build

# Nginx Cache (إذا كان مفعلاً)
sudo rm -rf /var/cache/nginx/*
sudo systemctl reload nginx
```

---

## 📋 Checklist التنصيب

- [ ] رفع ملفات Laravel إلى `/home/stcsolutions.online/public_html/backend/`
- [ ] رفع ملفات React إلى `/home/stcsolutions.online/public_html/frontend/`
- [ ] الحفاظ على ملف `.env` الموجود
- [ ] تثبيت Composer Dependencies
- [ ] تثبيت npm Dependencies
- [ ] بناء React Project (`npm run build`)
- [ ] تشغيل Migrations
- [ ] إنشاء Storage Link
- [ ] تعيين الصلاحيات (storage, bootstrap/cache)
- [ ] تنظيف جميع أنواع الكاش
- [ ] إعداد Nginx Configuration
- [ ] اختبار Nginx Configuration
- [ ] إعادة تحميل Nginx
- [ ] إعداد SSL Certificates
- [ ] إعداد Cron Jobs
- [ ] إعداد Queue Worker (إذا لزم الأمر)
- [ ] اختبار API Endpoints
- [ ] اختبار Frontend
- [ ] التحقق من قاعدة البيانات

---

## 🐛 حل المشاكل الشائعة

### مشكلة: Permission Denied

```bash
# تعيين الصلاحيات الصحيحة
cd /home/stcsolutions.online/public_html/backend/
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

### مشكلة: Composer Memory Limit

```bash
# زيادة Memory Limit
php -d memory_limit=512M /usr/local/bin/composer install
```

### مشكلة: npm Build Fails

```bash
# تنظيف وإعادة البناء
cd /home/stcsolutions.online/public_html/frontend/
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npm run build
```

### مشكلة: 500 Error في Laravel

```bash
# تفعيل Debug Mode مؤقتاً
cd /home/stcsolutions.online/public_html/backend/
# في ملف .env:
# APP_DEBUG=true
# ثم:
php artisan config:clear
```

### مشكلة: Routes لا تعمل

```bash
# إعادة بناء Route Cache
cd /home/stcsolutions.online/public_html/backend/
php artisan route:clear
php artisan route:cache
```

---

## 📞 معلومات الاتصال والدعم

- **Repository:** https://github.com/m7mdsonny/STCSAAS
- **Documentation:** راجع ملفات README في المشروع

---

## ⚠️ ملاحظات مهمة

1. **ملف .env:** ⚠️ لا تحذف أو تعدل ملف `.env` الموجود إلا إذا كنت متأكداً من الإعدادات
2. **قاعدة البيانات:** تأكد من أن إعدادات قاعدة البيانات في `.env` صحيحة
3. **الصلاحيات:** تأكد من تعيين الصلاحيات الصحيحة لمجلدات `storage` و `bootstrap/cache`
4. **الكاش:** بعد أي تحديث، قم بتنظيف الكاش وإعادة بنائه
5. **النسخ الاحتياطي:** دائماً اعمل نسخة احتياطية قبل أي تحديث كبير

---

**آخر تحديث:** 2 يناير 2025  
**الإصدار:** 1.0.0


