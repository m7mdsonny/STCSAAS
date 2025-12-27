# دليل التثبيت - تحديث نموذج التواصل

## قبل البدء
- ✅ تأكد من أخذ نسخة احتياطية من قاعدة البيانات
- ✅ تأكد من أخذ نسخة احتياطية من الملفات المعدلة
- ✅ تأكد من أنك في بيئة التطوير أو الاختبار أولاً

## خطوات التثبيت التفصيلية

### الخطوة 1: رفع الملفات

#### Backend Files
```bash
# 1. Migration
cp database/migrations/2025_01_28_000000_create_contact_inquiries_table.php \
   /path/to/apps/cloud-laravel/database/migrations/

# 2. Model
cp app/Models/ContactInquiry.php \
   /path/to/apps/cloud-laravel/app/Models/

# 3. Controller (استبدال الملف الموجود)
cp app/Http/Controllers/PublicContentController.php \
   /path/to/apps/cloud-laravel/app/Http/Controllers/

# 4. Routes (تعديل يدوي)
# افتح: apps/cloud-laravel/routes/api.php
# ابحث عن: Route::get('/public/landing', [PublicContentController::class, 'landing']);
# أضف بعدها مباشرة:
# Route::post('/public/contact', [PublicContentController::class, 'submitContact']);
```

#### Frontend Files
```bash
# 1. API Client (استبدال الملف الموجود)
cp web-portal/src/lib/api/settings.ts \
   /path/to/apps/web-portal/src/lib/api/

# 2. Landing Page (استبدال الملف الموجود)
cp web-portal/src/pages/Landing.tsx \
   /path/to/apps/web-portal/src/pages/
```

### الخطوة 2: تشغيل Migration
```bash
cd /path/to/apps/cloud-laravel
php artisan migrate
```

**النتيجة المتوقعة:**
```
Migrating: 2025_01_28_000000_create_contact_inquiries_table
Migrated:  2025_01_28_000000_create_contact_inquiries_table (XX.XXms)
```

### الخطوة 3: مسح الكاش
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

### الخطوة 4: إعادة بناء Frontend (اختياري)
```bash
cd /path/to/apps/web-portal
npm install  # إذا كانت هناك dependencies جديدة
npm run build
```

### الخطوة 5: التحقق من التثبيت

#### 1. التحقق من Migration
```bash
php artisan migrate:status
```
يجب أن ترى:
```
| 2025_01_28_000000_create_contact_inquiries_table | Ran |
```

#### 2. التحقق من Route
```bash
php artisan route:list | grep contact
```
يجب أن ترى:
```
POST   api/v1/public/contact ................ PublicContentController@submitContact
```

#### 3. اختبار API
```bash
curl -X POST http://your-domain.com/api/v1/public/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "Test message"
  }'
```

**النتيجة المتوقعة:**
```json
{
  "message": "تم إرسال رسالتك بنجاح. سنتواصل معك في أقرب وقت.",
  "success": true
}
```

#### 4. التحقق من قاعدة البيانات
```sql
SELECT * FROM contact_inquiries ORDER BY created_at DESC LIMIT 1;
```

## استكشاف الأخطاء

### خطأ: Migration فشل
```
SQLSTATE[42S01]: Base table or view already exists: 1050 Table 'contact_inquiries' already exists
```
**الحل:** الجدول موجود بالفعل. يمكنك:
- حذف الجدول يدوياً: `DROP TABLE contact_inquiries;`
- أو تخطي Migration إذا كان الجدول موجوداً بالفعل

### خطأ: Route غير موجود
```
404 Not Found - POST /api/v1/public/contact
```
**الحل:**
1. تحقق من إضافة Route في `routes/api.php`
2. شغل: `php artisan route:clear`
3. تحقق: `php artisan route:list | grep contact`

### خطأ: Model غير موجود
```
Class 'App\Models\ContactInquiry' not found
```
**الحل:**
1. تحقق من وجود الملف: `apps/cloud-laravel/app/Models/ContactInquiry.php`
2. تحقق من namespace: `namespace App\Models;`
3. شغل: `composer dump-autoload`

## التراجع (Rollback)

### 1. حذف Migration
```bash
php artisan migrate:rollback --step=1
```

### 2. حذف الملفات
```bash
rm apps/cloud-laravel/app/Models/ContactInquiry.php
rm apps/cloud-laravel/database/migrations/2025_01_28_000000_create_contact_inquiries_table.php
```

### 3. استرجاع النسخ الاحتياطية
```bash
# استرجع الملفات من النسخة الاحتياطية
cp backup/PublicContentController.php apps/cloud-laravel/app/Http/Controllers/
cp backup/settings.ts apps/web-portal/src/lib/api/
cp backup/Landing.tsx apps/web-portal/src/pages/
```

### 4. إزالة Route يدوياً
افتح `routes/api.php` واحذف السطر:
```php
Route::post('/public/contact', [PublicContentController::class, 'submitContact']);
```

### 5. مسح الكاش
```bash
php artisan cache:clear
php artisan route:clear
```

## التحقق النهائي

بعد التثبيت، تأكد من:
- ✅ Migration تم بنجاح
- ✅ Route موجود ويعمل
- ✅ نموذج التواصل في Landing Page يعمل
- ✅ الرسائل تُحفظ في قاعدة البيانات
- ✅ رسائل النجاح/الخطأ تظهر بشكل صحيح

## الدعم

إذا واجهت أي مشاكل، يرجى:
1. التحقق من ملفات الـ Log: `storage/logs/laravel.log`
2. التحقق من console في المتصفح (F12)
3. التواصل مع فريق الدعم

