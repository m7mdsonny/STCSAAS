# تحديث شامل - v1.0.1

## ⚠️ تحذير مهم
هذا التحديث يحتوي على **ملفات كاملة** وليس ملفات جزئية. يجب **استبدال** الملفات الموجودة وليس إضافة محتوى إليها.

## المشاكل التي تم إصلاحها

### 1. نموذج التواصل في Landing Page
- ✅ إضافة جدول `contact_inquiries`
- ✅ إضافة `ContactInquiry` Model
- ✅ إضافة endpoint `/api/v1/public/contact`
- ✅ إصلاح نموذج التواصل في `Landing.tsx`

### 2. BrandingController غير موجود
- ✅ إضافة `BrandingController.php` الكامل
- ✅ إضافة `BrandingSetting.php` Model
- ✅ إضافة معالجة أخطاء محسنة

### 3. Routes غير صحيحة
- ✅ إصلاح `routes/api.php` (ملف كامل)
- ✅ إضافة `apiPrefix: 'api'` في `bootstrap/app.php`

### 4. platform_contents.key column
- ✅ إضافة migration لإصلاح column `key`
- ✅ إصلاح `PublicContentController` للتعامل مع عدم وجود column

## الملفات المضمنة

### Backend (Laravel)
1. ✅ `app/Http/Controllers/BrandingController.php` - **ملف كامل**
2. ✅ `app/Http/Controllers/PublicContentController.php` - **ملف كامل**
3. ✅ `app/Models/BrandingSetting.php` - **ملف كامل**
4. ✅ `app/Models/ContactInquiry.php` - **ملف كامل**
5. ✅ `bootstrap/app.php` - **ملف كامل**
6. ✅ `routes/api.php` - **ملف كامل** (جميع الـ routes)

### Database
1. ✅ `database/migrations/2025_01_28_000000_create_contact_inquiries_table.php`
2. ✅ `database/migrations/2025_01_28_000001_fix_platform_contents_key_column.php`

### Frontend (React)
1. ✅ `web-portal/src/lib/api/settings.ts` - **ملف كامل**
2. ✅ `web-portal/src/pages/Landing.tsx` - **ملف كامل**

## خطوات التثبيت

### ⚠️ مهم جداً: استبدال الملفات وليس الإضافة

```bash
cd /www/wwwroot/api.stcsolutions.online

# 1. رفع جميع الملفات (استبدال الملفات الموجودة)
# Backend
cp app/Http/Controllers/BrandingController.php apps/cloud-laravel/app/Http/Controllers/
cp app/Http/Controllers/PublicContentController.php apps/cloud-laravel/app/Http/Controllers/
cp app/Models/BrandingSetting.php apps/cloud-laravel/app/Models/
cp app/Models/ContactInquiry.php apps/cloud-laravel/app/Models/
cp bootstrap/app.php apps/cloud-laravel/bootstrap/
cp routes/api.php apps/cloud-laravel/routes/  # ⚠️ استبدال كامل

# Database
cp database/migrations/* apps/cloud-laravel/database/migrations/

# Frontend
cp web-portal/src/lib/api/settings.ts apps/web-portal/src/lib/api/  # ⚠️ استبدال كامل
cp web-portal/src/pages/Landing.tsx apps/web-portal/src/pages/  # ⚠️ استبدال كامل

# 2. تشغيل Migrations
cd apps/cloud-laravel
php artisan migrate

# 3. تحديث Autoload (مهم جداً!)
composer dump-autoload

# 4. مسح جميع أنواع الكاش
php artisan route:clear
php artisan config:clear
php artisan cache:clear
php artisan view:clear

# 5. التحقق من الملفات
ls -la app/Http/Controllers/BrandingController.php
ls -la app/Models/BrandingSetting.php
cat routes/api.php | grep BrandingController
```

## التحقق من الإصلاح

```bash
# 1. تحقق من BrandingController
php artisan route:list | grep branding

# 2. تحقق من auth/login
php artisan route:list | grep "auth/login"

# 3. اختبار API
curl -X GET https://api.stcsolutions.online/api/v1/branding
curl -X POST https://api.stcsolutions.online/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

## إذا استمرت المشاكل

### 1. تحقق من وجود جميع الملفات:
```bash
ls -la app/Http/Controllers/BrandingController.php
ls -la app/Models/BrandingSetting.php
ls -la bootstrap/app.php
ls -la routes/api.php
```

### 2. تحقق من autoload:
```bash
composer dump-autoload -v
```

### 3. تحقق من routes:
```bash
php artisan route:list | head -20
```

### 4. تحقق من platform_contents table:
```sql
DESCRIBE platform_contents;
SHOW COLUMNS FROM platform_contents LIKE 'key';
```

## ملاحظات مهمة

- ⚠️ **routes/api.php** هو ملف كامل - استبدله بالكامل
- ⚠️ **settings.ts** هو ملف كامل - استبدله بالكامل
- ⚠️ **Landing.tsx** هو ملف كامل - استبدله بالكامل
- ✅ جميع الملفات الأخرى يمكن استبدالها بأمان

