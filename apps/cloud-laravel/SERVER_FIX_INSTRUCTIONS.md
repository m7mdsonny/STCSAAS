# تعليمات إصلاح المشاكل على السيرفر

## المشكلة 1: BrandingController غير موجود

**الخطأ**: `Target class [BrandingController] does not exist`

**الحل**:
1. تأكد من وجود الملف: `app/Http/Controllers/BrandingController.php`
2. إذا لم يكن موجوداً، قم برفعه من GitHub
3. شغل: `composer dump-autoload`

```bash
cd /www/wwwroot/api.stcsolutions.online
composer dump-autoload
php artisan route:clear
php artisan config:clear
```

## المشكلة 2: platform_contents table لا يحتوي على column `key`

**الخطأ**: `Column not found: 1054 Unknown column 'key' in 'WHERE'`

**الحل**:
1. تحقق من وجود column `key`:
```sql
DESCRIBE platform_contents;
```

2. إذا لم يكن موجوداً، قم بإضافته:
```sql
ALTER TABLE `platform_contents` 
ADD COLUMN `key` VARCHAR(255) UNIQUE NULL AFTER `id`;

-- إذا كان الجدول فارغاً، يمكنك إضافة index
ALTER TABLE `platform_contents` 
ADD UNIQUE INDEX `platform_contents_key_unique` (`key`);
```

3. أو شغل migration:
```bash
php artisan migrate
```

## الخطوات السريعة للإصلاح

```bash
cd /www/wwwroot/api.stcsolutions.online

# 1. تحديث autoload
composer dump-autoload

# 2. مسح الكاش
php artisan route:clear
php artisan config:clear
php artisan cache:clear

# 3. تشغيل migrations
php artisan migrate

# 4. التحقق من routes
php artisan route:list | grep branding
php artisan route:list | grep login
```

## التحقق من الإصلاح

1. تحقق من وجود BrandingController:
```bash
ls -la app/Http/Controllers/BrandingController.php
```

2. تحقق من column `key`:
```sql
SHOW COLUMNS FROM platform_contents LIKE 'key';
```

3. اختبر الـ routes:
```bash
curl -X GET https://api.stcsolutions.online/api/v1/branding
curl -X POST https://api.stcsolutions.online/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

