# دليل البدء السريع - نظام التحديثات

## إنشاء حزمة تحديث بسيطة

### الخطوة 1: إنشاء المجلد
```bash
mkdir -p updates/2025-01-15-120000
cd updates/2025-01-15-120000
```

### الخطوة 2: إنشاء manifest.json
```json
{
  "version": "1.2.0",
  "version_type": "minor",
  "title": "تحديث الميزات الجديدة",
  "description": "إضافة ميزات جديدة وتحسينات",
  "release_notes": "تم إضافة:\n- ميزة X\n- ميزة Y",
  "changelog": "- إضافة ميزة X\n- إصلاح مشكلة Y",
  "requires_version": "1.0.0",
  "affected_modules": ["notifications"],
  "requires_manual_update": false,
  "files": {}
}
```

### الخطوة 3: إضافة الملفات (اختياري)

#### إضافة Migration:
```bash
mkdir migrations
cat > migrations/2025_01_15_120000_add_feature.php << 'EOF'
<?php

class AddFeatureTable
{
    public function up()
    {
        Schema::create('new_feature', function ($table) {
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
EOF
```

#### إضافة ملفات:
```bash
mkdir -p files/app/Http/Controllers
# نسخ الملفات المطلوبة هنا
```

### الخطوة 4: ضغط الحزمة
```bash
cd ..
zip -r 2025-01-15-120000.zip 2025-01-15-120000/
```

### الخطوة 5: رفع التحديث
1. اذهب إلى `/admin/system-updates`
2. اضغط "اختر ملف ZIP"
3. اختر `2025-01-15-120000.zip`
4. انتظر اكتمال الرفع

### الخطوة 6: تثبيت التحديث
1. في صفحة System Updates
2. اضغط "تثبيت" على التحديث
3. تأكيد التثبيت
4. انتظر اكتمال التثبيت

## مثال سريع بدون ملفات

```bash
# إنشاء مجلد
mkdir -p updates/2025-01-15-120000

# إنشاء manifest.json
cat > updates/2025-01-15-120000/manifest.json << 'EOF'
{
  "version": "1.2.0",
  "version_type": "patch",
  "title": "إصلاحات وإ improvements",
  "description": "إصلاحات للأخطاء وتحسينات على الأداء",
  "requires_version": "1.0.0",
  "files": {}
}
EOF

# ضغط
cd updates
zip -r 2025-01-15-120000.zip 2025-01-15-120000/
```

## ملاحظات

- ✅ يمكن إنشاء حزمة بدون ملفات (فقط manifest.json)
- ✅ يمكن إضافة migrations فقط
- ✅ يمكن إضافة ملفات فقط
- ✅ يمكن إضافة scripts فقط
- ✅ يمكن الجمع بين أي منهم

## بعد التثبيت

- ✅ يتم تحديث الإصدار تلقائياً
- ✅ يتم إنشاء نسخة احتياطية تلقائياً
- ✅ يمكن التراجع عن التحديث من خلال النسخة الاحتياطية

