# حل مشكلة الملفات الناقصة

## المشكلة
```
PHP Fatal error: Failed opening required '/home/stcsolutions.online/public_html/backend/bootstrap/app.php'
```

## السبب
لم يتم نسخ جميع ملفات Laravel بشكل صحيح. مجلد `bootstrap` وملفات أخرى ناقصة.

---

## الحل السريع

### الطريقة 1: نسخ كامل من GitHub (مُوصى بها)

```bash
# 1. الانتقال إلى المجلد الرئيسي
cd /home/stcsolutions.online/

# 2. استنساخ المشروع في مجلد مؤقت
git clone https://github.com/m7mdsonny/STCSAAS.git temp_stc

# 3. نسخ جميع ملفات Laravel (بما في ذلك bootstrap)
cd temp_stc/apps/cloud-laravel/

# نسخ كل شيء باستثناء vendor و node_modules
rsync -av --exclude='vendor' --exclude='node_modules' --exclude='.env' \
  . /home/stcsolutions.online/public_html/backend/

# أو استخدام cp مع استثناءات
cp -r app bootstrap config database routes storage tests artisan composer.json composer.lock phpunit.xml .env.example /home/stcsolutions.online/public_html/backend/ 2>/dev/null || true

# 4. التأكد من نسخ bootstrap
ls -la /home/stcsolutions.online/public_html/backend/bootstrap/

# 5. تنظيف
cd /home/stcsolutions.online/
rm -rf temp_stc
```

### الطريقة 2: نسخ يدوي للملفات الناقصة

```bash
cd /home/stcsolutions.online/public_html/backend/

# إنشاء مجلد bootstrap إذا لم يكن موجوداً
mkdir -p bootstrap/cache

# نسخ الملفات الناقصة من GitHub مباشرة
cd /tmp
git clone https://github.com/m7mdsonny/STCSAAS.git temp_fix
cd temp_fix/apps/cloud-laravel

# نسخ bootstrap
cp -r bootstrap /home/stcsolutions.online/public_html/backend/

# نسخ ملفات أخرى قد تكون ناقصة
cp artisan composer.json composer.lock phpunit.xml /home/stcsolutions.online/public_html/backend/ 2>/dev/null || true
cp -r config /home/stcsolutions.online/public_html/backend/ 2>/dev/null || true
cp -r routes /home/stcsolutions.online/public_html/backend/ 2>/dev/null || true

# تنظيف
rm -rf /tmp/temp_fix
```

---

## التحقق من الملفات المطلوبة

```bash
cd /home/stcsolutions.online/public_html/backend/

# التحقق من وجود الملفات الأساسية
echo "=== ملفات Laravel الأساسية ==="
ls -la artisan composer.json bootstrap/app.php

echo ""
echo "=== مجلدات Laravel الأساسية ==="
ls -d app bootstrap config database routes storage

echo ""
echo "=== محتوى bootstrap ==="
ls -la bootstrap/
```

**يجب أن ترى:**
- `artisan` ✓
- `composer.json` ✓
- `bootstrap/app.php` ✓
- `bootstrap/providers.php` ✓
- `bootstrap/cache/` ✓

---

## بعد نسخ الملفات الناقصة

```bash
cd /home/stcsolutions.online/public_html/backend/

# 1. التأكد من وجود .env
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "⚠️ تم نسخ .env.example - يرجى تعديل الإعدادات"
    fi
fi

# 2. تثبيت Composer Dependencies
composer install --no-dev --optimize-autoloader

# 3. تنظيف الكاش
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# 4. تحسين الأداء
php artisan config:cache
php artisan route:cache
```

---

## قائمة الملفات والمجلدات المطلوبة في Laravel

```
backend/
├── app/                    ✓ مطلوب
├── bootstrap/              ✓ مطلوب (كان ناقص)
│   ├── app.php            ✓ مطلوب
│   ├── providers.php     ✓ مطلوب
│   └── cache/             ✓ مطلوب
├── config/                 ✓ مطلوب
├── database/               ✓ مطلوب
│   └── migrations/        ✓ مطلوب
├── routes/                 ✓ مطلوب
│   ├── api.php           ✓ مطلوب
│   ├── web.php           ✓ مطلوب
│   └── console.php       ✓ مطلوب
├── storage/                ✓ مطلوب
│   ├── app/
│   ├── framework/
│   └── logs/
├── public/                 ✓ مطلوب
│   └── index.php         ✓ مطلوب
├── artisan                 ✓ مطلوب
├── composer.json           ✓ مطلوب
├── composer.lock           ✓ مطلوب
├── phpunit.xml             ✓ مطلوب
└── .env                    ⚠️ احتفظ بالملف الموجود
```

---

## سكريبت تلقائي لإصلاح المشكلة

```bash
#!/bin/bash
# fix_missing_files.sh

BACKEND_DIR="/home/stcsolutions.online/public_html/backend"
TEMP_DIR="/tmp/stc_fix_$(date +%s)"

echo "🔧 إصلاح الملفات الناقصة..."

# استنساخ المشروع
mkdir -p "$TEMP_DIR"
cd "$TEMP_DIR"
git clone https://github.com/m7mdsonny/STCSAAS.git repo
cd repo/apps/cloud-laravel

# نسخ الملفات الناقصة
echo "📁 نسخ bootstrap..."
cp -r bootstrap "$BACKEND_DIR/"

echo "📁 نسخ ملفات أخرى..."
cp artisan composer.json composer.lock phpunit.xml "$BACKEND_DIR/" 2>/dev/null || true
cp -r config "$BACKEND_DIR/" 2>/dev/null || true
cp -r routes "$BACKEND_DIR/" 2>/dev/null || true

# التحقق
if [ -f "$BACKEND_DIR/bootstrap/app.php" ]; then
    echo "✅ تم إصلاح المشكلة!"
    echo "الآن قم بتشغيل: composer install"
else
    echo "❌ فشل الإصلاح"
fi

# تنظيف
rm -rf "$TEMP_DIR"
```

**استخدام السكريبت:**
```bash
# حفظ السكريبت
nano fix_missing_files.sh
# الصق المحتوى أعلاه
chmod +x fix_missing_files.sh
./fix_missing_files.sh
```

---

## بعد الإصلاح

```bash
cd /home/stcsolutions.online/public_html/backend/

# يجب أن يعمل الآن
composer install --no-dev --optimize-autoloader

# التحقق
php artisan --version
php artisan route:list
```

---

**ملاحظة:** تأكد من نسخ جميع الملفات والمجلدات المذكورة أعلاه.


