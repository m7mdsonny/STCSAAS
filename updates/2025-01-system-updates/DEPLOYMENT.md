# دليل نشر نظام التحديثات

## الخطوات على السيرفر

### 1. رفع الملفات
```bash
cd /path/to/project
git pull origin main
```

### 2. تشغيل Migrations
```bash
php artisan migrate
```

### 3. إنشاء المجلدات المطلوبة
```bash
# مجلد التحديثات
mkdir -p updates
chmod 755 updates

# مجلد النسخ الاحتياطية
mkdir -p storage/app/updates/backups
chmod 755 storage/app/updates/backups

# مجلد الملفات المؤقتة
mkdir -p storage/app/temp
chmod 755 storage/app/temp
```

### 4. تعيين الصلاحيات
```bash
# للمستخدم www-data (أو المستخدم الذي يشغل PHP)
chown -R www-data:www-data updates storage/app/updates storage/app/temp

# أو إذا كنت تستخدم مستخدم آخر
chown -R your-user:your-group updates storage/app/updates storage/app/temp
```

### 5. مسح Cache
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

### 6. إعادة بناء Frontend
```bash
cd apps/web-portal
npm install
npm run build
```

### 7. التحقق من الإعدادات
- تأكد من أن `updates/` موجود وله صلاحيات الكتابة
- تأكد من أن `storage/app/updates/` موجود وله صلاحيات الكتابة
- تأكد من أن PHP يمكنه فتح ملفات ZIP (extension: zip)

### 8. اختبار النظام
1. اذهب إلى `/admin/system-updates`
2. جرب رفع حزمة تحديث تجريبية
3. تحقق من ظهورها في القائمة
4. جرب تثبيتها

## هيكل المجلدات بعد النشر

```
project/
├── updates/                          # مجلد التحديثات
│   ├── 2025-01-15-120000/          # حزمة تحديث
│   │   ├── manifest.json
│   │   ├── migrations/
│   │   ├── files/
│   │   └── scripts/
│   └── ...
├── storage/
│   └── app/
│       ├── updates/
│       │   └── backups/            # النسخ الاحتياطية
│       └── temp/                    # ملفات مؤقتة
└── ...
```

## متطلبات النظام

- PHP >= 8.1
- PHP Extension: `zip` (لتفكيك ملفات ZIP)
- PHP Extension: `pdo` (لـ database)
- صلاحيات الكتابة على:
  - `updates/`
  - `storage/app/updates/`
  - `storage/app/temp/`

## استكشاف الأخطاء

### خطأ: "Update package not found"
- تأكد من وجود المجلد `updates/`
- تأكد من الصلاحيات (755 أو 775)

### خطأ: "Failed to open ZIP file"
- تأكد من تثبيت PHP extension `zip`
- تحقق من صحة ملف ZIP

### خطأ: "Permission denied"
- تحقق من صلاحيات المجلدات
- تأكد من أن PHP يمكنه الكتابة في المجلدات

### خطأ: "Migration failed"
- تحقق من صحة migrations
- تحقق من logs في `storage/logs/laravel.log`

## ملاحظات الأمان

1. **الصلاحيات:** تأكد من أن `updates/` لا يمكن الوصول إليه من الويب مباشرة
2. **التحقق:** النظام يتحقق من صلاحيات Super Admin قبل أي عملية
3. **النسخ الاحتياطي:** يتم إنشاء نسخة احتياطية تلقائياً قبل كل تحديث
4. **السجلات:** جميع العمليات تُسجل في Laravel logs

## الدعم

في حالة وجود مشاكل:
1. تحقق من `storage/logs/laravel.log`
2. تحقق من صلاحيات المجلدات
3. تحقق من إعدادات PHP
4. راجع `updates/UPDATE_PACKAGE_STRUCTURE.md` للتفاصيل

