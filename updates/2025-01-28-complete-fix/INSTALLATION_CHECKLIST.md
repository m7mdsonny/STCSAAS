# قائمة التحقق من التثبيت - التحديث الشامل v1.0.1

## ✅ قبل التثبيت

- [ ] أخذ نسخة احتياطية من قاعدة البيانات
- [ ] أخذ نسخة احتياطية من الملفات المهمة
- [ ] التأكد من وجود مساحة كافية على السيرفر
- [ ] التأكد من إمكانية الوصول إلى قاعدة البيانات

## ✅ الملفات المطلوبة في ZIP

### Backend
- [x] `app/Http/Controllers/BrandingController.php` - **ملف كامل**
- [x] `app/Http/Controllers/PublicContentController.php` - **ملف كامل**
- [x] `app/Models/BrandingSetting.php` - **ملف كامل**
- [x] `app/Models/ContactInquiry.php` - **ملف كامل**
- [x] `bootstrap/app.php` - **ملف كامل**
- [x] `routes/api.php` - **ملف كامل**

### Database
- [x] `database/migrations/2025_01_28_000000_create_contact_inquiries_table.php`
- [x] `database/migrations/2025_01_28_000001_fix_platform_contents_key_column.php`

### Frontend
- [x] `web-portal/src/lib/api/settings.ts` - **ملف كامل**
- [x] `web-portal/src/pages/Landing.tsx` - **ملف كامل**

## ✅ خطوات التثبيت

### 1. استخراج الملفات
```bash
unzip update_v1.zip -d /tmp/update_extract
cd /tmp/update_extract/2025-01-28-complete-fix
```

### 2. رفع الملفات (استبدال)
```bash
# Backend
cp app/Http/Controllers/* /www/wwwroot/api.stcsolutions.online/app/Http/Controllers/
cp app/Models/* /www/wwwroot/api.stcsolutions.online/app/Models/
cp bootstrap/app.php /www/wwwroot/api.stcsolutions.online/bootstrap/
cp routes/api.php /www/wwwroot/api.stcsolutions.online/routes/  # ⚠️ استبدال كامل

# Database
cp database/migrations/* /www/wwwroot/api.stcsolutions.online/database/migrations/

# Frontend
cp web-portal/src/lib/api/settings.ts /www/wwwroot/stcsolutions.online/src/lib/api/  # ⚠️ استبدال كامل
cp web-portal/src/pages/Landing.tsx /www/wwwroot/stcsolutions.online/src/pages/  # ⚠️ استبدال كامل
```

### 3. تشغيل Migrations
```bash
cd /www/wwwroot/api.stcsolutions.online
php artisan migrate
```
- [ ] Migration 1: create_contact_inquiries_table - ✅
- [ ] Migration 2: fix_platform_contents_key_column - ✅

### 4. تحديث Autoload
```bash
composer dump-autoload
```
- [ ] تم بنجاح

### 5. مسح الكاش
```bash
php artisan route:clear
php artisan config:clear
php artisan cache:clear
php artisan view:clear
```
- [ ] تم بنجاح

## ✅ التحقق من التثبيت

### 1. التحقق من الملفات
```bash
ls -la app/Http/Controllers/BrandingController.php
ls -la app/Models/BrandingSetting.php
ls -la bootstrap/app.php
ls -la routes/api.php
```
- [ ] جميع الملفات موجودة

### 2. التحقق من Routes
```bash
php artisan route:list | grep -E "(branding|auth/login|public/contact)"
```
- [ ] `/api/v1/branding` - GET
- [ ] `/api/v1/auth/login` - POST
- [ ] `/api/v1/public/contact` - POST

### 3. التحقق من Database
```sql
SHOW TABLES LIKE 'contact_inquiries';
DESCRIBE platform_contents;
SHOW COLUMNS FROM platform_contents LIKE 'key';
```
- [ ] جدول `contact_inquiries` موجود
- [ ] column `key` موجود في `platform_contents`

### 4. اختبار API
```bash
# Branding
curl -X GET https://api.stcsolutions.online/api/v1/branding
# يجب أن يعيد JSON وليس HTML error

# Login
curl -X POST https://api.stcsolutions.online/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
# يجب أن يعيد JSON (حتى لو كان خطأ في credentials)

# Contact
curl -X POST https://api.stcsolutions.online/api/v1/public/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Test"}'
# يجب أن يعيد JSON success message
```
- [ ] جميع الـ APIs تعمل

## ✅ بعد التثبيت

- [ ] اختبار تسجيل الدخول من المتصفح
- [ ] اختبار صفحة Landing Page
- [ ] اختبار نموذج التواصل
- [ ] مراجعة ملفات الـ Log للتأكد من عدم وجود أخطاء

## ❌ إذا فشل التثبيت

1. استرجاع النسخ الاحتياطية
2. Rollback migrations: `php artisan migrate:rollback --step=2`
3. مسح الكاش: `php artisan route:clear && php artisan config:clear`
4. مراجعة ملفات الـ Log: `tail -f storage/logs/laravel.log`

