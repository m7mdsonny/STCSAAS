# دليل رفع النظام على لوحة aaPanel - STC AI-VAP

## 📋 نظرة عامة

هذا الدليل يشرح خطوات رفع وتشغيل نظام STC AI-VAP على لوحة تحكم aaPanel بشكل كامل.

---

## 🎯 المتطلبات الأساسية

- لوحة تحكم aaPanel مثبتة ومُعدة
- PHP 8.2 أو أحدث
- MySQL 5.7 أو أحدث (أو MariaDB 10.3+)
- Composer مثبت على السيرفر
- Node.js 18+ (لبناء الفرونت اند)
- Git (لرفع الملفات)

---

## 📁 المسارات المطلوبة

- **الفرونت اند**: `/www/wwwroot/stcsolutions.online`
- **الباك اند**: `/www/wwwroot/api.stcsolutions.online`
- **قاعدة البيانات**: `stcai`
- **مستخدم قاعدة البيانات**: `stcai`

---

## 🗄️ الخطوة 1: إعداد قاعدة البيانات

### 1.1 إنشاء قاعدة البيانات

1. افتح لوحة aaPanel
2. اذهب إلى **قاعدة البيانات** → **MySQL**
3. اضغط على **إضافة قاعدة بيانات**
4. أدخل البيانات التالية:
   - **اسم قاعدة البيانات**: `stcai`
   - **اسم المستخدم**: `stcai`
   - **كلمة المرور**: (اختر كلمة مرور قوية واحفظها)
   - **الصلاحيات**: امنح جميع الصلاحيات
5. اضغط **إضافة**

### 1.2 رفع ملف قاعدة البيانات

1. اذهب إلى **قاعدة البيانات** → **phpMyAdmin**
2. اختر قاعدة البيانات `stcai` من القائمة الجانبية
3. اضغط على تبويب **استيراد (Import)**
4. اضغط **اختر ملف** واختر ملف `stc_cloud_mysql.sql`
5. تأكد من:
   - **تنسيق الملف**: SQL
   - **الترميز**: utf8
6. اضغط **تنفيذ (Go)**
7. انتظر حتى يكتمل الاستيراد (قد يستغرق دقيقة أو دقيقتين)

### 1.3 التحقق من قاعدة البيانات

1. في phpMyAdmin، تأكد من وجود الجداول التالية:
   - `users`
   - `organizations`
   - `cameras`
   - `edge_servers`
   - `alerts`
   - وغيرها من الجداول

### 1.4 إصلاح حالة السوبر أدمن (إذا لزم الأمر)

إذا واجهت مشكلة "الحساب معطل" عند تسجيل الدخول بالسوبر أدمن:

**الطريقة الأولى: عبر phpMyAdmin**
1. افتح phpMyAdmin
2. اختر قاعدة البيانات `stcai`
3. اضغط على تبويب **SQL**
4. نفذ الاستعلام التالي:
   ```sql
   UPDATE `users` 
   SET `is_active` = 1 
   WHERE `email` = 'superadmin@stc-solutions.com' 
      OR `role` = 'super_admin';
   ```

**الطريقة الثانية: عبر Artisan Command**
```bash
cd /www/wwwroot/api.stcsolutions.online
php artisan user:fix-super-admin
```

**الطريقة الثالثة: استخدام ملف SQL**
1. ارفع ملف `database/fix_super_admin_status.sql` إلى السيرفر
2. في phpMyAdmin، اضغط **استيراد** واختر الملف
3. اضغط **تنفيذ**

---

## 🔧 الخطوة 2: رفع وإعداد الباك اند (Laravel)

### 2.1 رفع ملفات الباك اند

#### الطريقة الأولى: عبر Git (موصى بها)

```bash
# الاتصال بالسيرفر عبر SSH
ssh root@your-server-ip

# الانتقال إلى مجلد الباك اند
cd /www/wwwroot/api.stcsolutions.online

# إذا كان المجلد موجود بالفعل، احذف محتوياته
rm -rf * .[^.]*

# استنساخ المشروع من GitHub
git clone https://github.com/m7mdsonny/STCSAAS.git .

# أو إذا كان المشروع موجود بالفعل، قم بسحب التحديثات
git pull origin main

# الانتقال إلى مجلد Laravel
cd apps/cloud-laravel
```

#### الطريقة الثانية: رفع يدوي عبر FTP/SFTP

1. استخدم FileZilla أو أي عميل FTP
2. ارفع جميع ملفات مجلد `apps/cloud-laravel` إلى `/www/wwwroot/api.stcsolutions.online`
3. تأكد من رفع جميع الملفات والمجلدات بما فيها:
   - `app/`
   - `config/`
   - `database/`
   - `routes/`
   - `public/`
   - `vendor/` (بعد تثبيت Composer)
   - `.env` (سيتم إنشاؤه لاحقاً)

### 2.2 تثبيت Dependencies

```bash
# الانتقال إلى مجلد الباك اند
cd /www/wwwroot/api.stcsolutions.online

# تثبيت Composer Dependencies
composer install --no-dev --optimize-autoloader

# إذا لم يكن Composer مثبتاً، قم بتثبيته أولاً:
# curl -sS https://getcomposer.org/installer | php
# mv composer.phar /usr/local/bin/composer
```

### 2.3 إعداد ملف البيئة (.env)

```bash
# نسخ ملف .env.example إلى .env
cp .env.example .env

# تعديل ملف .env
nano .env
```

أدخل الإعدادات التالية في ملف `.env`:

```env
APP_NAME="STC AI-VAP"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://api.stcsolutions.online

LOG_CHANNEL=stack
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=stcai
DB_USERNAME=stcai
DB_PASSWORD=your_database_password_here

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

MEMCACHED_HOST=127.0.0.1

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

VITE_APP_NAME="${APP_NAME}"
```

**مهم**: استبدل `your_database_password_here` بكلمة مرور قاعدة البيانات التي أنشأتها.

### 2.4 توليد مفتاح التطبيق

```bash
php artisan key:generate
```

### 2.5 تشغيل Migrations (اختياري)

إذا كنت تريد التأكد من أن جميع الجداول محدثة:

```bash
php artisan migrate --force
```

**ملاحظة**: إذا قمت برفع قاعدة البيانات من ملف SQL، قد لا تحتاج لتشغيل migrations.

### 2.6 إعداد الصلاحيات

```bash
# إعطاء صلاحيات الكتابة لمجلدات التخزين
chmod -R 775 storage bootstrap/cache
chown -R www:www storage bootstrap/cache

# إذا لم يعمل الأمر السابق، جرب:
chmod -R 777 storage bootstrap/cache
```

### 2.7 تحسين الأداء (Production)

```bash
# تحسين التخزين المؤقت
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

---

## 🎨 الخطوة 3: رفع وإعداد الفرونت اند (React)

### 3.1 بناء الفرونت اند محلياً (على جهازك)

**قبل رفع الفرونت اند، يجب بناءه أولاً على جهازك:**

```bash
# على جهازك المحلي
cd apps/web-portal

# تثبيت Dependencies
npm install

# بناء المشروع للإنتاج
npm run build
```

بعد البناء، ستجد الملفات في مجلد `dist/` أو `build/`.

### 3.2 رفع ملفات الفرونت اند

#### الطريقة الأولى: رفع يدوي

1. استخدم FileZilla أو أي عميل FTP
2. ارفع جميع محتويات مجلد `dist/` (أو `build/`) إلى `/www/wwwroot/stcsolutions.online`
3. تأكد من رفع:
   - `index.html`
   - مجلد `assets/` (يحتوي على JS و CSS)

#### الطريقة الثانية: عبر Git وبناء على السيرفر

```bash
# الاتصال بالسيرفر
ssh root@your-server-ip

# الانتقال إلى مجلد الفرونت اند
cd /www/wwwroot/stcsolutions.online

# استنساخ المشروع
git clone https://github.com/m7mdsonny/STCSAAS.git temp

# الانتقال إلى مجلد React
cd temp/apps/web-portal

# تثبيت Dependencies
npm install

# بناء المشروع
npm run build

# نسخ الملفات المبنية
cp -r dist/* /www/wwwroot/stcsolutions.online/

# حذف المجلد المؤقت
cd /www/wwwroot
rm -rf stcsolutions.online/temp
```

### 3.3 إعداد ملف .env للفرونت اند

أنشئ ملف `.env` في مجلد الفرونت اند:

```bash
cd /www/wwwroot/stcsolutions.online
nano .env
```

أدخل:

```env
VITE_API_URL=https://api.stcsolutions.online
```

**ملاحظة**: إذا كنت تستخدم Vite، قد تحتاج لإعادة البناء بعد تغيير `.env`.

---

## 🌐 الخطوة 4: إعداد Nginx

### 4.1 إعداد Nginx للباك اند (API)

1. في aaPanel، اذهب إلى **الموقع** → **إدارة الموقع**
2. اختر `api.stcsolutions.online`
3. اضغط **إعدادات** → **تعديل**
4. في قسم **Nginx Configuration**، أضف:

```nginx
location / {
    try_files $uri $uri/ /index.php?$query_string;
}

location ~ \.php$ {
    fastcgi_pass unix:/tmp/php-cgi-82.sock;
    fastcgi_index index.php;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    include fastcgi_params;
}

location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires max;
    log_not_found off;
}

# CORS Headers for API
location /api {
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
    add_header Access-Control-Allow-Headers "Authorization, Content-Type, Accept";
    
    if ($request_method = OPTIONS) {
        return 204;
    }
    
    try_files $uri $uri/ /index.php?$query_string;
}
```

5. تأكد من أن **Document Root** هو: `/www/wwwroot/api.stcsolutions.online/public`
6. اضغط **حفظ**

### 4.2 إعداد Nginx للفرونت اند

1. في aaPanel، اذهب إلى **الموقع** → **إدارة الموقع**
2. اختر `stcsolutions.online`
3. اضغط **إعدادات** → **تعديل**
4. في قسم **Nginx Configuration**، أضف:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}

location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires max;
    log_not_found off;
    access_log off;
}

# API Proxy (اختياري - إذا أردت توجيه API requests)
location /api {
    proxy_pass https://api.stcsolutions.online;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

5. تأكد من أن **Document Root** هو: `/www/wwwroot/stcsolutions.online`
6. اضغط **حفظ**

---

## 🔒 الخطوة 5: إعداد SSL (HTTPS)

### 5.1 تفعيل SSL للباك اند

1. في aaPanel، اذهب إلى **الموقع** → **إدارة الموقع**
2. اختر `api.stcsolutions.online`
3. اضغط **SSL** → **Let's Encrypt**
4. اختر **Free** و **Apply**
5. انتظر حتى يكتمل التثبيت
6. فعّل **Force HTTPS**

### 5.2 تفعيل SSL للفرونت اند

1. في aaPanel، اذهب إلى **الموقع** → **إدارة الموقع**
2. اختر `stcsolutions.online`
3. اضغط **SSL** → **Let's Encrypt**
4. اختر **Free** و **Apply**
5. انتظر حتى يكتمل التثبيت
6. فعّل **Force HTTPS**

---

## ✅ الخطوة 6: التحقق من التثبيت

### 6.1 اختبار الباك اند

افتح المتصفح واذهب إلى:
```
https://api.stcsolutions.online/api/v1/status
```

يجب أن ترى رد JSON يحتوي على معلومات النظام.

### 6.2 اختبار الفرونت اند

افتح المتصفح واذهب إلى:
```
https://stcsolutions.online
```

يجب أن ترى صفحة تسجيل الدخول.

### 6.3 اختبار تسجيل الدخول

1. اذهب إلى `https://stcsolutions.online`
2. سجل دخول باستخدام:
   - **Super Admin**: 
     - Email: `admin@stcsolutions.net`
     - Password: (راجع ملف قاعدة البيانات للكلمة الافتراضية)

---

## 🔧 الخطوة 7: إعدادات إضافية

### 7.1 إعداد Cron Jobs

في aaPanel، اذهب إلى **Cron** وأضف:

```bash
* * * * * cd /www/wwwroot/api.stcsolutions.online && php artisan schedule:run >> /dev/null 2>&1
```

### 7.2 إعداد Queue Worker (إذا كنت تستخدم Queue)

```bash
# إنشاء systemd service
nano /etc/systemd/system/stc-queue.service
```

أضف:

```ini
[Unit]
Description=STC AI-VAP Queue Worker
After=network.target

[Service]
User=www
Group=www
Restart=always
ExecStart=/usr/bin/php /www/wwwroot/api.stcsolutions.online/artisan queue:work --sleep=3 --tries=3

[Install]
WantedBy=multi-user.target
```

ثم:

```bash
systemctl daemon-reload
systemctl enable stc-queue
systemctl start stc-queue
```

### 7.3 إعداد Log Rotation

```bash
nano /etc/logrotate.d/stc-laravel
```

أضف:

```
/www/wwwroot/api.stcsolutions.online/storage/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www www
    sharedscripts
}
```

---

## 🐛 استكشاف الأخطاء

### مشكلة: 500 Internal Server Error

```bash
# تحقق من السجلات
tail -f /www/wwwroot/api.stcsolutions.online/storage/logs/laravel.log

# تحقق من الصلاحيات
ls -la /www/wwwroot/api.stcsolutions.online/storage
chmod -R 775 storage bootstrap/cache
```

### مشكلة: قاعدة البيانات لا تتصل

```bash
# تحقق من إعدادات .env
cat /www/wwwroot/api.stcsolutions.online/.env | grep DB_

# اختبر الاتصال بقاعدة البيانات
mysql -u stcai -p stcai
```

### مشكلة: الفرونت اند لا يعرض الصفحة

```bash
# تحقق من وجود index.html
ls -la /www/wwwroot/stcsolutions.online/index.html

# تحقق من Nginx logs
tail -f /www/wwwlogs/stcsolutions.online.log
```

### مشكلة: CORS Error

تأكد من إضافة CORS headers في إعدادات Nginx للباك اند (كما هو موضح أعلاه).

---

## 📝 ملاحظات مهمة

1. **أمان**: تأكد من تغيير كلمات المرور الافتراضية
2. **Backup**: قم بعمل نسخة احتياطية من قاعدة البيانات بانتظام
3. **Updates**: عند تحديث الكود، قم بـ:
   ```bash
   cd /www/wwwroot/api.stcsolutions.online
   git pull origin main
   composer install --no-dev --optimize-autoloader
   php artisan config:cache
   php artisan route:cache
   ```
4. **Monitoring**: راقب سجلات Laravel بانتظام:
   ```bash
   tail -f /www/wwwroot/api.stcsolutions.online/storage/logs/laravel.log
   ```

---

## 📞 الدعم

إذا واجهت أي مشاكل:
1. تحقق من سجلات Laravel
2. تحقق من سجلات Nginx
3. تحقق من إعدادات قاعدة البيانات
4. تأكد من أن جميع الصلاحيات صحيحة

---

**آخر تحديث**: 2025-01-15

