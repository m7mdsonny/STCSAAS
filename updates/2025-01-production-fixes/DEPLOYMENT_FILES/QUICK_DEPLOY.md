# دليل الرفع السريع - Quick Deployment Guide

## 🚀 خطوات سريعة للرفع على السيرفر

### 1️⃣ Backend (Laravel)

```bash
# 1. الدخول إلى مجلد Laravel
cd /www/wwwroot/api.stcsolutions.online

# 2. رفع الملفات (إذا كنت تستخدم Git)
git pull origin main

# 3. تثبيت Dependencies
composer install --no-dev --optimize-autoloader

# 4. تشغيل Migrations
php artisan migrate

# 5. تشغيل Seeder
php artisan db:seed --class=AiModuleSeeder

# 6. تحديث Cache
php artisan route:cache
php artisan config:cache
php artisan cache:clear

# 7. إصلاح الصلاحيات
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache
```

### 2️⃣ Frontend (React)

```bash
# 1. الدخول إلى مجلد React
cd /path/to/web-portal/apps/web-portal

# 2. رفع الملفات (إذا كنت تستخدم Git)
git pull origin main

# 3. تثبيت Dependencies
npm install

# 4. بناء المشروع
npm run build

# 5. نسخ الملفات المبنية
cp -r dist/* /www/wwwroot/stcsolutions.online/
```

---

## ✅ التحقق السريع

```bash
# اختبار API
curl https://api.stcsolutions.online/api/v1/ai-modules
curl https://api.stcsolutions.online/api/v1/wordings

# التحقق من Frontend
# افتح https://stcsolutions.online وتحقق من:
# - صفحة "دليل المالك" في القائمة
# - صفحة "نصوص المنصة" في Super Admin
```

---

## 📝 ملاحظات

- **النسخ الاحتياطي:** دائماً قم بعمل backup قبل التحديث
- **الترتيب:** Backend أولاً، ثم Frontend
- **Cache:** امسح cache بعد كل تحديث
- **الصلاحيات:** تأكد من الصلاحيات الصحيحة

---

**وقت التقدير:** 10-15 دقيقة

