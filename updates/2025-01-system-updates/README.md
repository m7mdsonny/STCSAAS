# نظام التحديثات الشامل - يناير 2025

## نظرة عامة
تم إنشاء نظام تحديثات شامل وحقيقي يتيح:
- رفع حزم التحديثات (ZIP)
- تثبيت التحديثات تلقائياً
- إدارة الإصدارات
- النسخ الاحتياطي التلقائي
- آلية التراجع (Rollback)
- تنفيذ Migrations
- نسخ الملفات
- تنفيذ Scripts

## المكونات الجديدة

### 1. UpdateService
**الملف**: `apps/cloud-laravel/app/Services/UpdateService.php`

**الميزات:**
- `getAvailableUpdates()` - الحصول على جميع التحديثات المتاحة
- `uploadUpdatePackage()` - رفع واستخراج حزمة التحديث
- `installUpdate()` - تثبيت التحديث
- `rollback()` - التراجع عن التحديث
- `createBackup()` - إنشاء نسخة احتياطية
- `runMigrations()` - تنفيذ migrations
- `copyFiles()` - نسخ الملفات
- `runScripts()` - تنفيذ scripts

### 2. SystemUpdate Model
**الملف**: `apps/cloud-laravel/app/Models/SystemUpdate.php`

**الحقول:**
- `version` - رقم الإصدار
- `update_id` - معرف التحديث (اسم المجلد)
- `manifest` - محتوى manifest.json
- `status` - الحالة (pending, installing, installed, failed, rollback)
- `backup_id` - معرف النسخة الاحتياطية
- `installed_at` - تاريخ التثبيت

### 3. SystemUpdateController
**الملف**: `apps/cloud-laravel/app/Http/Controllers/SystemUpdateController.php`

**Endpoints:**
- `GET /api/v1/system-updates` - الحصول على التحديثات المتاحة
- `POST /api/v1/system-updates/upload` - رفع حزمة تحديث
- `POST /api/v1/system-updates/{updateId}/install` - تثبيت تحديث
- `POST /api/v1/system-updates/rollback/{backupId}` - التراجع عن تحديث
- `GET /api/v1/system-updates/current-version` - الحصول على الإصدار الحالي

### 4. SystemUpdates Page
**الملف**: `apps/web-portal/src/pages/admin/SystemUpdates.tsx`

**الميزات:**
- عرض التحديثات المتاحة
- رفع حزم التحديثات
- تثبيت التحديثات
- عرض معلومات التحديث
- عرض الإصدار الحالي

## هيكل حزمة التحديث

```
updates/
└── YYYY-MM-DD-HHMMSS/
    ├── manifest.json            # معلومات التحديث (مطلوب)
    ├── migrations/              # Database migrations (اختياري)
    ├── files/                   # ملفات التحديث (اختياري)
    └── scripts/                 # سكريبتات (اختياري)
        ├── pre-install.php
        ├── post-install.php
        └── rollback.php
```

## ملف manifest.json

```json
{
  "version": "1.2.0",
  "version_type": "minor",
  "title": "عنوان التحديث",
  "description": "وصف التحديث",
  "release_notes": "ملاحظات الإصدار",
  "changelog": "سجل التغييرات",
  "requires_version": "1.0.0",
  "affected_modules": ["module1", "module2"],
  "requires_manual_update": false,
  "files": {
    "source/path": "destination/path"
  }
}
```

## عملية التثبيت

1. **رفع الحزمة:**
   - Super Admin يرفع ملف ZIP من `/admin/system-updates`
   - النظام يستخرج الحزمة في `updates/YYYY-MM-DD-HHMMSS/`

2. **التحقق:**
   - التحقق من وجود `manifest.json`
   - التحقق من صحة البيانات
   - التحقق من الاعتمادية (`requires_version`)

3. **إنشاء النسخة الاحتياطية:**
   - نسخ قاعدة البيانات (schema)
   - نسخ الملفات الحرجة
   - حفظ معلومات النسخة الاحتياطية

4. **التثبيت:**
   - تنفيذ `pre-install.php` (إن وجد)
   - تنفيذ migrations (إن وجدت)
   - نسخ الملفات (إن وجدت)
   - تنفيذ `post-install.php` (إن وجد)
   - تحديث الإصدار في النظام

5. **التسجيل:**
   - تسجيل التحديث في `system_updates` table
   - تحديث الحالة إلى `installed`

## آلية التراجع

1. **اختيار النسخة الاحتياطية:**
   - Super Admin يختار النسخة الاحتياطية للتراجع

2. **التراجع:**
   - استعادة الملفات من النسخة الاحتياطية
   - تنفيذ `down()` في migrations
   - تنفيذ `rollback.php` (إن وجد)
   - استعادة الإصدار السابق

## كيفية الاستخدام

### 1. إنشاء حزمة تحديث

```bash
# إنشاء المجلد
mkdir -p updates/2025-01-15-120000/{migrations,files,scripts}

# إنشاء manifest.json
cat > updates/2025-01-15-120000/manifest.json << EOF
{
  "version": "1.2.0",
  "version_type": "minor",
  "title": "تحديث الميزات",
  "description": "وصف التحديث",
  "requires_version": "1.0.0",
  "files": {}
}
EOF

# إضافة الملفات
# ...

# ضغط الحزمة
cd updates
zip -r 2025-01-15-120000.zip 2025-01-15-120000/
```

### 2. رفع التحديث

1. اذهب إلى `/admin/system-updates`
2. اضغط "اختر ملف ZIP"
3. اختر ملف ZIP
4. انتظر اكتمال الرفع

### 3. تثبيت التحديث

1. في صفحة System Updates
2. اضغط "تثبيت" على التحديث المطلوب
3. تأكيد التثبيت
4. انتظر اكتمال التثبيت

## الأمان

- ✅ التحقق من صلاحيات Super Admin
- ✅ التحقق من صحة manifest.json
- ✅ التحقق من الاعتمادية
- ✅ النسخ الاحتياطي التلقائي
- ✅ Rollback mechanism
- ✅ Logging شامل

## السجلات

جميع العمليات تُسجل في:
- Laravel Logs (`storage/logs/laravel.log`)
- Database (`system_updates` table)

## الخطوات التالية على السيرفر

1. **تشغيل Migration:**
   ```bash
   php artisan migrate
   ```

2. **إنشاء مجلد updates:**
   ```bash
   mkdir -p updates
   chmod 755 updates
   ```

3. **إنشاء مجلد backups:**
   ```bash
   mkdir -p storage/app/updates/backups
   chmod 755 storage/app/updates/backups
   ```

4. **التحقق من الصلاحيات:**
   ```bash
   chown -R www-data:www-data updates storage/app/updates
   ```

## ملاحظات مهمة

1. **النسخ الاحتياطي:** يتم إنشاء نسخة احتياطية تلقائياً قبل كل تحديث
2. **التراجع:** يمكن التراجع عن أي تحديث من خلال النسخة الاحتياطية
3. **الاعتمادية:** تأكد من `requires_version` في manifest.json
4. **الاختبار:** اختبر التحديث في بيئة التطوير أولاً

## مثال حزمة تحديث

راجع `updates/EXAMPLE_UPDATE/manifest.json` و `updates/UPDATE_PACKAGE_STRUCTURE.md` للأمثلة الكاملة.

