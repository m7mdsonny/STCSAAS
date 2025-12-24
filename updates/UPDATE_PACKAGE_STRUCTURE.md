# هيكل حزمة التحديث

## نظرة عامة
هذا الملف يوضح كيفية إنشاء حزمة تحديث صحيحة للنظام.

## هيكل المجلد

```
updates/
└── YYYY-MM-DD-HHMMSS/          # اسم المجلد (تاريخ ووقت)
    ├── manifest.json            # ملف المعلومات (مطلوب)
    ├── migrations/              # Database migrations (اختياري)
    │   ├── 2025_01_15_120000_add_feature.php
    │   └── ...
    ├── files/                   # ملفات التحديث (اختياري)
    │   ├── app/Http/Controllers/NewController.php
    │   ├── resources/views/new-view.blade.php
    │   └── ...
    └── scripts/                 # سكريبتات التحديث (اختياري)
        ├── pre-install.php      # قبل التثبيت
        ├── post-install.php     # بعد التثبيت
        └── rollback.php         # للتراجع
```

## ملف manifest.json

```json
{
  "version": "1.2.0",
  "version_type": "minor",
  "title": "تحديث الميزات الجديدة",
  "description": "إضافة ميزات جديدة وتحسينات على النظام",
  "release_notes": "تم إضافة ميزة X و Y وتحسين Z",
  "changelog": "- إضافة ميزة X\n- إصلاح مشكلة Y\n- تحسين الأداء",
  "requires_version": "1.1.0",
  "affected_modules": ["cameras", "analytics", "notifications"],
  "requires_manual_update": false,
  "files": {
    "app/Http/Controllers/NewController.php": "app/Http/Controllers/NewController.php",
    "resources/views/new-view.blade.php": "resources/views/new-view.blade.php"
  }
}
```

### حقول manifest.json

| الحقل | النوع | مطلوب | الوصف |
|------|------|-------|-------|
| `version` | string | ✅ | رقم الإصدار (مثال: 1.2.0) |
| `version_type` | string | ✅ | نوع الإصدار: major, minor, patch, hotfix |
| `title` | string | ✅ | عنوان التحديث |
| `description` | string | ❌ | وصف التحديث |
| `release_notes` | string | ❌ | ملاحظات الإصدار |
| `changelog` | string | ❌ | سجل التغييرات |
| `requires_version` | string | ❌ | الحد الأدنى من الإصدار المطلوب |
| `affected_modules` | array | ❌ | الوحدات المتأثرة |
| `requires_manual_update` | boolean | ❌ | هل يتطلب تحديث يدوي |
| `files` | object | ❌ | خريطة الملفات (source => destination) |

## Database Migrations

### مثال migration

```php
<?php

class AddNewFeatureTable
{
    public function up()
    {
        Schema::create('new_feature', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('new_feature');
    }
}
```

**ملاحظات:**
- يجب أن يكون اسم الـ class فريد
- يجب أن يحتوي على methods `up()` و `down()`
- يتم تنفيذ `up()` عند التثبيت و `down()` عند التراجع

## Files Mapping

في `manifest.json`، يمكن تحديد الملفات التي يجب نسخها:

```json
{
  "files": {
    "app/Http/Controllers/NewController.php": "app/Http/Controllers/NewController.php",
    "resources/views/new.blade.php": "resources/views/new.blade.php",
    "public/js/new.js": "public/js/new.js"
  }
}
```

**ملاحظات:**
- المسارات نسبية من مجلد `files/` في حزمة التحديث
- الوجهة نسبية من `base_path()` في Laravel

## Scripts

### pre-install.php
يتم تنفيذه قبل تثبيت التحديث:

```php
<?php
// Pre-install script
// يمكنك إضافة أي كود هنا

// مثال: التحقق من شروط معينة
if (!file_exists(base_path('.env'))) {
    throw new Exception('.env file not found');
}
```

### post-install.php
يتم تنفيذه بعد تثبيت التحديث:

```php
<?php
// Post-install script
// مثال: تشغيل commands

Artisan::call('cache:clear');
Artisan::call('config:clear');
```

### rollback.php
يتم تنفيذه عند التراجع:

```php
<?php
// Rollback script
// مثال: حذف ملفات تم إضافتها

if (file_exists(base_path('app/Http/Controllers/NewController.php'))) {
    unlink(base_path('app/Http/Controllers/NewController.php'));
}
```

## خطوات إنشاء حزمة تحديث

1. **إنشاء المجلد:**
   ```bash
   mkdir updates/2025-01-15-120000
   ```

2. **إنشاء manifest.json:**
   ```bash
   cd updates/2025-01-15-120000
   # إنشاء manifest.json بالبيانات المطلوبة
   ```

3. **إضافة الملفات:**
   ```bash
   mkdir -p migrations files/app/Http/Controllers scripts
   # نسخ الملفات المطلوبة
   ```

4. **ضغط الحزمة:**
   ```bash
   cd updates
   zip -r 2025-01-15-120000.zip 2025-01-15-120000/
   ```

5. **رفع الحزمة:**
   - اذهب إلى `/admin/system-updates`
   - اضغط "اختر ملف ZIP"
   - اختر الملف المضغوط

## مثال كامل

```
updates/
└── 2025-01-15-120000/
    ├── manifest.json
    ├── migrations/
    │   └── 2025_01_15_120000_add_notifications_table.php
    ├── files/
    │   └── app/
    │       └── Http/
    │           └── Controllers/
    │               └── NotificationController.php
    └── scripts/
        ├── pre-install.php
        └── post-install.php
```

## التحقق من الحزمة

قبل الرفع، تأكد من:
- ✅ وجود `manifest.json`
- ✅ صحة JSON في `manifest.json`
- ✅ وجود جميع الملفات المذكورة في `files`
- ✅ صحة migrations (إن وجدت)
- ✅ عدم وجود أخطاء في scripts

## ملاحظات مهمة

1. **النسخ الاحتياطي:** النظام ينشئ نسخة احتياطية تلقائياً قبل التثبيت
2. **التراجع:** يمكن التراجع عن التحديث من خلال النسخة الاحتياطية
3. **الاعتمادية:** تأكد من `requires_version` إذا كان التحديث يعتمد على إصدار سابق
4. **الاختبار:** اختبر الحزمة في بيئة التطوير قبل الرفع للإنتاج

