# دليل التثبيت التفصيلي - التحديث الشامل v1.0.1

## قبل البدء

⚠️ **تحذير مهم**: هذا التحديث يحتوي على ملفات كاملة. يجب استبدال الملفات الموجودة وليس إضافة محتوى إليها.

### 1. أخذ نسخة احتياطية

```bash
cd /www/wwwroot/api.stcsolutions.online

# نسخة احتياطية من الملفات المهمة
mkdir -p backup/$(date +%Y%m%d_%H%M%S)
cp app/Http/Controllers/BrandingController.php backup/$(date +%Y%m%d_%H%M%S)/ 2>/dev/null || true
cp app/Http/Controllers/PublicContentController.php backup/$(date +%Y%m%d_%H%M%S)/ 2>/dev/null || true
cp routes/api.php backup/$(date +%Y%m%d_%H%M%S)/ 2>/dev/null || true
cp bootstrap/app.php backup/$(date +%Y%m%d_%H%M%S)/ 2>/dev/null || true
```

## خطوات التثبيت

### الخطوة 1: استخراج الملفات

```bash
cd /tmp
unzip update_v1.zip -d update_extract
cd update_extract/2025-01-28-complete-fix
```

### الخطوة 2: رفع الملفات (استبدال)

```bash
# Backend Controllers
cp app/Http/Controllers/BrandingController.php /www/wwwroot/api.stcsolutions.online/app/Http/Controllers/
cp app/Http/Controllers/PublicContentController.php /www/wwwroot/api.stcsolutions.online/app/Http/Controllers/

# Models
cp app/Models/BrandingSetting.php /www/wwwroot/api.stcsolutions.online/app/Models/
cp app/Models/ContactInquiry.php /www/wwwroot/api.stcsolutions.online/app/Models/

# Bootstrap & Routes (⚠️ استبدال كامل)
cp bootstrap/app.php /www/wwwroot/api.stcsolutions.online/bootstrap/
cp routes/api.php /www/wwwroot/api.stcsolutions.online/routes/

# Migrations
cp database/migrations/* /www/wwwroot/api.stcsolutions.online/database/migrations/

# Frontend (⚠️ استبدال كامل)
cp web-portal/src/lib/api/settings.ts /www/wwwroot/stcsolutions.online/src/lib/api/
cp web-portal/src/pages/Landing.tsx /www/wwwroot/stcsolutions.online/src/pages/
```

### الخطوة 3: تشغيل Migrations

```bash
cd /www/wwwroot/api.stcsolutions.online
php artisan migrate
```

**النتيجة المتوقعة:**
```
Migrating: 2025_01_28_000000_create_contact_inquiries_table
Migrated:  2025_01_28_000000_create_contact_inquiries_table (XX.XXms)

Migrating: 2025_01_28_000001_fix_platform_contents_key_column
Migrated:  2025_01_28_000001_fix_platform_contents_key_column (XX.XXms)
```

### الخطوة 4: تحديث Autoload

```bash
composer dump-autoload
```

**النتيجة المتوقعة:**
```
Generating optimized autoload files
```

### الخطوة 5: مسح الكاش

```bash
php artisan route:clear
php artisan config:clear
php artisan cache:clear
php artisan view:clear
```

### الخطوة 6: التحقق

```bash
# 1. تحقق من وجود BrandingController
ls -la app/Http/Controllers/BrandingController.php

# 2. تحقق من routes
php artisan route:list | grep -E "(branding|auth/login|public/contact)"

# 3. تحقق من autoload
composer dump-autoload -v | grep BrandingController
```

## الاختبار

### 1. اختبار Branding API
```bash
curl -X GET https://api.stcsolutions.online/api/v1/branding
```

**النتيجة المتوقعة:**
```json
{
  "id": 1,
  "organization_id": null,
  "logo_url": null,
  "primary_color": "#DCA000",
  ...
}
```

### 2. اختبار Login API
```bash
curl -X POST https://api.stcsolutions.online/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

### 3. اختبار Contact Form API
```bash
curl -X POST https://api.stcsolutions.online/api/v1/public/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Test message"}'
```

## استكشاف الأخطاء

### خطأ: BrandingController غير موجود

**الحل:**
```bash
# 1. تحقق من وجود الملف
ls -la app/Http/Controllers/BrandingController.php

# 2. إذا لم يكن موجوداً، رفعه يدوياً
# 3. تحديث autoload
composer dump-autoload

# 4. مسح الكاش
php artisan route:clear
```

### خطأ: Route غير موجود

**الحل:**
```bash
# 1. تحقق من routes/api.php
cat routes/api.php | grep BrandingController

# 2. إذا لم يكن موجوداً، استبدل routes/api.php بالكامل
# 3. مسح route cache
php artisan route:clear
php artisan route:list | grep branding
```

### خطأ: platform_contents.key غير موجود

**الحل:**
```bash
# 1. تشغيل migration
php artisan migrate

# 2. أو إضافة يدوياً
mysql -u root -p
USE your_database;
ALTER TABLE platform_contents ADD COLUMN `key` VARCHAR(255) UNIQUE NULL AFTER `id`;
```

## التراجع (Rollback)

إذا واجهت مشاكل:

```bash
# 1. استرجاع النسخ الاحتياطية
cp backup/YYYYMMDD_HHMMSS/* /www/wwwroot/api.stcsolutions.online/

# 2. Rollback migrations
php artisan migrate:rollback --step=2

# 3. مسح الكاش
php artisan route:clear
php artisan config:clear
composer dump-autoload
```

