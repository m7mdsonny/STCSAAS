# دليل التنصيب الصحيح - CyberPanel
## خطوات النسخ الصحيحة لجميع الملفات

---

## ⚠️ المشكلة الحالية
بعض الملفات (مثل `bootstrap/`) لم يتم نسخها، مما يسبب أخطاء في Composer.

---

## ✅ الحل الصحيح

### الخطوة 1: حذف المجلد القديم (احتفظ بـ .env فقط)

```bash
cd /home/stcsolutions.online/public_html/

# عمل نسخة احتياطية من .env
if [ -f backend/.env ]; then
    cp backend/.env backend/.env.backup
    echo "✅ تم عمل نسخة احتياطية من .env"
fi

# حذف المجلد القديم (سيتم إعادة إنشائه)
rm -rf backend
mkdir -p backend
```

### الخطوة 2: استنساخ المشروع

```bash
cd /home/stcsolutions.online/
git clone https://github.com/m7mdsonny/STCSAAS.git temp_repo
```

### الخطوة 3: نسخ جميع ملفات Laravel

```bash
cd temp_repo/apps/cloud-laravel

# نسخ جميع الملفات والمجلدات باستثناء vendor و node_modules
rsync -av \
  --exclude='vendor' \
  --exclude='node_modules' \
  --exclude='.env' \
  --exclude='storage/logs/*' \
  --exclude='bootstrap/cache/*' \
  . /home/stcsolutions.online/public_html/backend/

# أو استخدام cp (إذا لم يكن rsync متاحاً)
cp -r app bootstrap config database routes storage tests public artisan composer.json composer.lock phpunit.xml .env.example /home/stcsolutions.online/public_html/backend/ 2>/dev/null || true
```

### الخطوة 4: استعادة ملف .env

```bash
cd /home/stcsolutions.online/public_html/backend/

# استعادة .env من النسخة الاحتياطية
if [ -f ../backend/.env.backup ]; then
    cp ../backend/.env.backup .env
    echo "✅ تم استعادة .env"
elif [ -f .env.example ]; then
    cp .env.example .env
    echo "⚠️ تم نسخ .env.example - يرجى تعديل الإعدادات"
fi
```

### الخطوة 5: التحقق من الملفات

```bash
cd /home/stcsolutions.online/public_html/backend/

echo "=== التحقق من الملفات الأساسية ==="
[ -f artisan ] && echo "✅ artisan موجود" || echo "❌ artisan ناقص"
[ -f composer.json ] && echo "✅ composer.json موجود" || echo "❌ composer.json ناقص"
[ -f bootstrap/app.php ] && echo "✅ bootstrap/app.php موجود" || echo "❌ bootstrap/app.php ناقص"
[ -d app ] && echo "✅ app/ موجود" || echo "❌ app/ ناقص"
[ -d bootstrap ] && echo "✅ bootstrap/ موجود" || echo "❌ bootstrap/ ناقص"
[ -d config ] && echo "✅ config/ موجود" || echo "❌ config/ ناقص"
[ -d routes ] && echo "✅ routes/ موجود" || echo "❌ routes/ ناقص"
[ -d database ] && echo "✅ database/ موجود" || echo "❌ database/ ناقص"
```

### الخطوة 6: تثبيت Dependencies

```bash
cd /home/stcsolutions.online/public_html/backend/

# تثبيت Composer
composer install --no-dev --optimize-autoloader

# يجب أن يعمل الآن بدون أخطاء
```

### الخطوة 7: تنظيف

```bash
cd /home/stcsolutions.online/
rm -rf temp_repo
```

---

## 📋 قائمة الملفات التي يجب نسخها

```bash
# الملفات الأساسية
artisan
composer.json
composer.lock
phpunit.xml
.env.example

# المجلدات الأساسية
app/
bootstrap/          ← مهم جداً!
config/
database/
routes/
storage/
tests/
public/
```

---

## 🔍 التحقق النهائي

```bash
cd /home/stcsolutions.online/public_html/backend/

# 1. التحقق من bootstrap
ls -la bootstrap/
# يجب أن ترى: app.php, providers.php, cache/

# 2. اختبار Composer
composer install --no-dev --optimize-autoloader
# يجب أن يعمل بدون أخطاء

# 3. اختبار Artisan
php artisan --version
php artisan route:list | head -10
```

---

## 🚀 سكريبت تلقائي كامل

```bash
#!/bin/bash
# complete_deployment.sh

set -e

PROJECT_ROOT="/home/stcsolutions.online/public_html"
BACKEND_DIR="$PROJECT_ROOT/backend"
TEMP_DIR="/tmp/stc_deploy_$(date +%s)"

echo "🚀 بدء التنصيب الكامل..."

# 1. نسخة احتياطية من .env
if [ -f "$BACKEND_DIR/.env" ]; then
    cp "$BACKEND_DIR/.env" "$BACKEND_DIR/.env.backup"
    echo "✅ نسخة احتياطية من .env"
fi

# 2. استنساخ المشروع
mkdir -p "$TEMP_DIR"
cd "$TEMP_DIR"
git clone https://github.com/m7mdsonny/STCSAAS.git repo
cd repo/apps/cloud-laravel

# 3. نسخ جميع الملفات
echo "📁 نسخ الملفات..."
rsync -av \
  --exclude='vendor' \
  --exclude='node_modules' \
  --exclude='.env' \
  --exclude='storage/logs/*' \
  --exclude='bootstrap/cache/*' \
  . "$BACKEND_DIR/" || {
    # Fallback to cp if rsync fails
    cp -r app bootstrap config database routes storage tests public artisan composer.json composer.lock phpunit.xml .env.example "$BACKEND_DIR/" 2>/dev/null || true
}

# 4. استعادة .env
cd "$BACKEND_DIR"
if [ -f .env.backup ]; then
    cp .env.backup .env
    echo "✅ تم استعادة .env"
elif [ -f .env.example ]; then
    cp .env.example .env
    echo "⚠️ تم نسخ .env.example"
fi

# 5. التحقق
echo "🔍 التحقق من الملفات..."
[ -f bootstrap/app.php ] && echo "✅ bootstrap/app.php موجود" || { echo "❌ bootstrap/app.php ناقص!"; exit 1; }
[ -f artisan ] && echo "✅ artisan موجود" || { echo "❌ artisan ناقص!"; exit 1; }

# 6. تثبيت Dependencies
echo "📦 تثبيت Dependencies..."
composer install --no-dev --optimize-autoloader

# 7. تنظيف
rm -rf "$TEMP_DIR"

echo "✅ اكتمل التنصيب بنجاح!"
```

**استخدام:**
```bash
chmod +x complete_deployment.sh
./complete_deployment.sh
```

---

**آخر تحديث:** 2 يناير 2025


