# إصلاح سريع - BrandingController و platform_contents

## الخطوات السريعة على السيرفر:

```bash
cd /www/wwwroot/api.stcsolutions.online

# 1. تحديث autoload (مهم جداً!)
composer dump-autoload

# 2. مسح جميع أنواع الكاش
php artisan route:clear
php artisan config:clear
php artisan cache:clear
php artisan view:clear

# 3. تشغيل migrations (إذا لم يتم تشغيلها)
php artisan migrate

# 4. التحقق من وجود الملفات
ls -la app/Http/Controllers/BrandingController.php
ls -la app/Models/BrandingSetting.php

# 5. اختبار
curl -X GET https://api.stcsolutions.online/api/v1/branding
```

## إذا استمرت المشكلة:

### 1. تحقق من وجود BrandingController:
```bash
cat app/Http/Controllers/BrandingController.php | head -20
```

### 2. تحقق من وجود BrandingSetting Model:
```bash
cat app/Models/BrandingSetting.php
```

### 3. تحقق من وجود جدول organizations_branding:
```sql
SHOW TABLES LIKE 'organizations_branding';
DESCRIBE organizations_branding;
```

### 4. إذا كان الجدول غير موجود:
```bash
php artisan migrate
```

### 5. إذا كان column `key` غير موجود في platform_contents:
```sql
ALTER TABLE `platform_contents` 
ADD COLUMN `key` VARCHAR(255) UNIQUE NULL AFTER `id`;
```

## ملاحظة مهمة:
بعد أي تغيير في الكود، يجب دائماً:
1. `composer dump-autoload`
2. `php artisan route:clear`
3. `php artisan config:clear`

