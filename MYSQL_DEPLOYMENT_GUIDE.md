# دليل نشر قاعدة البيانات MySQL - STC AI-VAP

## نظرة عامة
هذا الدليل يشرح كيفية رفع وتثبيت قاعدة البيانات MySQL على السيرفر مع جميع الملفات.

## المتطلبات
- MySQL 8.0+ أو MariaDB 10.3+
- PHP 8.1+
- Composer
- Node.js 18+
- Laravel 11
- aaPanel أو cPanel

---

## الخطوة 1: إنشاء قاعدة البيانات في aaPanel

### 1.1 الدخول إلى aaPanel
1. افتح المتصفح واذهب إلى: `https://your-server-ip:7800`
2. سجل الدخول بحساب aaPanel

### 1.2 إنشاء قاعدة البيانات
1. من القائمة الجانبية، اضغط على **"MySQL"**
2. اضغط على **"إضافة قاعدة بيانات"** أو **"Add Database"**
3. أدخل المعلومات التالية:
   - **اسم قاعدة البيانات**: `stc_cloud` (أو أي اسم تفضله)
   - **اسم المستخدم**: `stc_user` (أو أي اسم تفضله)
   - **كلمة المرور**: قم بإنشاء كلمة مرور قوية
   - **الصلاحيات**: اتركها كما هي (جميع الصلاحيات)
4. اضغط **"إضافة"** أو **"Submit"**
5. **احفظ المعلومات التالية** (ستحتاجها لاحقاً):
   ```
   Database Name: stc_cloud
   Database User: stc_user
   Database Password: [كلمة المرور التي أنشأتها]
   Database Host: localhost (أو 127.0.0.1)
   Database Port: 3306
   ```

---

## الخطوة 2: رفع ملف قاعدة البيانات

### 2.1 رفع ملف SQL
1. في aaPanel، اضغط على **"File Manager"** أو **"مدير الملفات"**
2. اذهب إلى المجلد: `/www/wwwroot/your-domain.com` (أو المجلد الخاص بموقعك)
3. أنشئ مجلد جديد باسم `database` (إذا لم يكن موجوداً)
4. ارفع ملف `stc_cloud_mysql.sql` إلى هذا المجلد

### 2.2 استيراد قاعدة البيانات
1. في aaPanel، اضغط على **"phpMyAdmin"** (أو اذهب إلى `http://your-server-ip/phpmyadmin`)
2. سجل الدخول باستخدام:
   - **اسم المستخدم**: `stc_user` (أو المستخدم الذي أنشأته)
   - **كلمة المرور**: كلمة المرور التي أنشأتها
3. من القائمة الجانبية، اختر قاعدة البيانات `stc_cloud`
4. اضغط على تبويب **"Import"** أو **"استيراد"**
5. اضغط على **"Choose File"** أو **"اختر ملف"**
6. اختر ملف `stc_cloud_mysql.sql`
7. تأكد من:
   - **Format**: SQL
   - **Character set**: utf8mb4
8. اضغط **"Go"** أو **"تنفيذ"**
9. انتظر حتى يكتمل الاستيراد (قد يستغرق بضع دقائق)

---

## الخطوة 3: رفع ملفات Laravel

### 3.1 إعداد المجلدات
1. في **File Manager**، اذهب إلى `/www/wwwroot/your-domain.com`
2. أنشئ المجلدات التالية (إذا لم تكن موجودة):
   ```
   apps/cloud-laravel/
   apps/web-portal/
   ```

### 3.2 رفع ملفات Backend (Laravel)
1. ارفع جميع ملفات `apps/cloud-laravel/` إلى `/www/wwwroot/your-domain.com/apps/cloud-laravel/`
2. تأكد من رفع:
   - جميع ملفات `app/`
   - جميع ملفات `config/`
   - جميع ملفات `database/`
   - جميع ملفات `routes/`
   - جميع ملفات `public/`
   - ملفات `composer.json`, `.env.example`, إلخ

### 3.3 رفع ملفات Frontend (React)
1. ارفع جميع ملفات `apps/web-portal/` إلى `/www/wwwroot/your-domain.com/apps/web-portal/`
2. أو يمكنك بناء المشروع محلياً ورفع مجلد `dist/` فقط

---

## الخطوة 4: إعداد Laravel

### 4.1 إنشاء ملف .env
1. في **File Manager**، اذهب إلى `/www/wwwroot/your-domain.com/apps/cloud-laravel/`
2. انسخ ملف `.env.example` إلى `.env`
3. افتح ملف `.env` للتعديل

### 4.2 تعديل إعدادات قاعدة البيانات
في ملف `.env`، عدّل الأسطر التالية:

```env
APP_NAME="STC AI-VAP"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=mysql
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=stc_cloud
DB_USERNAME=stc_user
DB_PASSWORD=your_database_password_here

# Cache & Session
CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync

# Mail (أضف إعدادات البريد الإلكتروني الخاصة بك)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME="${APP_NAME}"
```

### 4.3 توليد APP_KEY
1. افتح **Terminal** في aaPanel (أو SSH)
2. اذهب إلى مجلد Laravel:
   ```bash
   cd /www/wwwroot/your-domain.com/apps/cloud-laravel
   ```
3. قم بتوليد APP_KEY:
   ```bash
   php artisan key:generate
   ```

### 4.4 تثبيت Dependencies
```bash
composer install --no-dev --optimize-autoloader
```

### 4.5 تشغيل Migrations (اختياري - إذا لم تستورد SQL)
```bash
php artisan migrate --force
```

### 4.6 إنشاء Storage Link
```bash
php artisan storage:link
```

### 4.7 مسح Cache
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

---

## الخطوة 5: إعداد Frontend

### 5.1 تثبيت Dependencies
```bash
cd /www/wwwroot/your-domain.com/apps/web-portal
npm install
```

### 5.2 إنشاء ملف .env
أنشئ ملف `.env` في مجلد `apps/web-portal/`:

```env
VITE_API_URL=https://your-domain.com/api/v1
```

### 5.3 بناء المشروع
```bash
npm run build
```

---

## الخطوة 6: إعداد Nginx/Apache

### 6.1 إعداد Nginx (في aaPanel)
1. في aaPanel، اضغط على **"Website"** → **"Add Site"**
2. أدخل:
   - **Domain**: your-domain.com
   - **Document Root**: `/www/wwwroot/your-domain.com/apps/cloud-laravel/public`
3. اضغط **"Submit"**

### 6.2 تعديل إعدادات Nginx
1. اضغط على **"Settings"** بجانب الموقع
2. اضغط على **"Configuration"**
3. أضف الكود التالي في قسم `location /`:

```nginx
location / {
    try_files $uri $uri/ /index.php?$query_string;
}

location /api {
    try_files $uri $uri/ /index.php?$query_string;
}

location ~ \.php$ {
    fastcgi_pass unix:/tmp/php-cgi-74.sock; # قد يختلف حسب إصدار PHP
    fastcgi_index index.php;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    include fastcgi_params;
}
```

---

## الخطوة 7: إعداد الصلاحيات

### 7.1 تعيين الصلاحيات
```bash
cd /www/wwwroot/your-domain.com/apps/cloud-laravel
chmod -R 755 storage bootstrap/cache
chown -R www:www storage bootstrap/cache
```

---

## الخطوة 8: التحقق من التثبيت

### 8.1 اختبار API
افتح المتصفح واذهب إلى:
```
https://your-domain.com/api/v1/status
```

يجب أن ترى استجابة JSON.

### 8.2 اختبار Frontend
افتح المتصفح واذهب إلى:
```
https://your-domain.com
```

يجب أن ترى صفحة الويب.

### 8.3 تسجيل الدخول
1. اذهب إلى: `https://your-domain.com/login`
2. استخدم بيانات Super Admin:
   - **Email**: `superadmin@stc-solutions.com`
   - **Password**: `password` (افتراضي - يجب تغييره!)

---

## الخطوة 9: تغيير كلمة مرور Super Admin

### 9.1 من Terminal
```bash
cd /www/wwwroot/your-domain.com/apps/cloud-laravel
php artisan tinker
```

ثم في Tinker:
```php
$user = \App\Models\User::where('email', 'superadmin@stc-solutions.com')->first();
$user->password = \Hash::make('YourNewPassword123!');
$user->save();
exit
```

---

## استكشاف الأخطاء

### خطأ: "SQLSTATE[HY000] [2002] Connection refused"
- تأكد من أن `DB_HOST` في `.env` هو `127.0.0.1` أو `localhost`
- تأكد من أن MySQL يعمل

### خطأ: "Access denied for user"
- تحقق من `DB_USERNAME` و `DB_PASSWORD` في `.env`
- تأكد من أن المستخدم له صلاحيات على قاعدة البيانات

### خطأ: "Table doesn't exist"
- تأكد من استيراد ملف SQL بنجاح
- تحقق من أن قاعدة البيانات صحيحة في `.env`

### خطأ: "500 Internal Server Error"
- تحقق من ملف `storage/logs/laravel.log`
- تأكد من الصلاحيات على `storage/` و `bootstrap/cache/`
- تأكد من أن `APP_KEY` تم توليده

---

## ملاحظات مهمة

1. **الأمان**: 
   - غيّر كلمة مرور Super Admin فوراً
   - تأكد من أن `APP_DEBUG=false` في الإنتاج
   - استخدم HTTPS

2. **النسخ الاحتياطي**:
   - قم بعمل نسخة احتياطية من قاعدة البيانات بانتظام
   - احفظ نسخة من ملف `.env`

3. **الأداء**:
   - فعّل OPcache في PHP
   - استخدم Redis للـ Cache (اختياري)

---

## الدعم

في حالة وجود مشاكل:
1. تحقق من `storage/logs/laravel.log`
2. تحقق من إعدادات قاعدة البيانات في `.env`
3. تأكد من أن جميع الخطوات تمت بشكل صحيح

---

## ملخص الخطوات السريعة

```bash
# 1. إنشاء قاعدة البيانات في aaPanel
# 2. استيراد stc_cloud_mysql.sql
# 3. رفع ملفات Laravel
# 4. تعديل .env
# 5. تشغيل:
cd /www/wwwroot/your-domain.com/apps/cloud-laravel
php artisan key:generate
composer install --no-dev
php artisan storage:link
php artisan config:clear
chmod -R 755 storage bootstrap/cache
# 6. بناء Frontend
cd ../web-portal
npm install
npm run build
```

---

**تم! النظام جاهز للاستخدام.**

