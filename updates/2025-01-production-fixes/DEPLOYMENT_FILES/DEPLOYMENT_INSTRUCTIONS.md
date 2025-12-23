# تعليمات رفع التحديثات على السيرفر

## 📋 قبل البدء

### 1. نسخ احتياطي
```bash
# نسخ احتياطي لقاعدة البيانات
pg_dump -U postgres -d your_database > backup_$(date +%Y%m%d_%H%M%S).sql

# نسخ احتياطي للملفات
tar -czf backup_files_$(date +%Y%m%d_%H%M%S).tar.gz /www/wwwroot/api.stcsolutions.online
```

### 2. التحقق من البيئة
```bash
# التحقق من إصدار PHP
php -v  # يجب أن يكون 8.1 أو أحدث

# التحقق من Composer
composer --version

# التحقق من Node.js
node -v  # يجب أن يكون 18 أو أحدث
```

---

## 🔧 خطوات الرفع - Backend (Laravel)

### الخطوة 1: رفع الملفات

#### أ) عبر FTP/SFTP:
```
1. ارفع الملفات الجديدة إلى:
   /www/wwwroot/api.stcsolutions.online/app/Models/
   /www/wwwroot/api.stcsolutions.online/app/Http/Controllers/
   /www/wwwroot/api.stcsolutions.online/database/migrations/
   /www/wwwroot/api.stcsolutions.online/database/seeders/

2. استبدل الملفات المعدلة:
   - app/Models/UpdateAnnouncement.php
   - app/Http/Controllers/IntegrationController.php
   - app/Http/Controllers/UpdateAnnouncementController.php
   - routes/api.php
```

#### ب) عبر Git (مستحسن):
```bash
cd /www/wwwroot/api.stcsolutions.online
git pull origin main
```

### الخطوة 2: تحديث Dependencies
```bash
cd /www/wwwroot/api.stcsolutions.online
composer install --no-dev --optimize-autoloader
```

### الخطوة 3: تشغيل Migrations
```bash
# تشغيل migrations الجديدة
php artisan migrate

# تشغيل seeder للـ AI Modules
php artisan db:seed --class=AiModuleSeeder
```

### الخطوة 4: تحديث Routes و Config
```bash
php artisan route:cache
php artisan config:cache
php artisan cache:clear
```

### الخطوة 5: التحقق من الصلاحيات
```bash
# التأكد من الصلاحيات الصحيحة
chown -R www-data:www-data /www/wwwroot/api.stcsolutions.online/storage
chown -R www-data:www-data /www/wwwroot/api.stcsolutions.online/bootstrap/cache
chmod -R 775 /www/wwwroot/api.stcsolutions.online/storage
chmod -R 775 /www/wwwroot/api.stcsolutions.online/bootstrap/cache
```

---

## 🎨 خطوات الرفع - Frontend (React)

### الخطوة 1: رفع الملفات

#### أ) عبر FTP/SFTP:
```
1. ارفع الملفات الجديدة إلى:
   apps/web-portal/src/pages/OwnerGuide.tsx
   apps/web-portal/src/pages/admin/PlatformWordings.tsx
   apps/web-portal/src/lib/translations.ts

2. استبدل الملفات المعدلة:
   - apps/web-portal/src/pages/admin/AdminUpdates.tsx
   - apps/web-portal/src/pages/admin/AdminIntegrations.tsx
   - apps/web-portal/src/pages/admin/SuperAdminSettings.tsx
   - apps/web-portal/src/components/layout/Sidebar.tsx
   - apps/web-portal/src/types/database.ts
   - apps/web-portal/src/App.tsx
```

#### ب) عبر Git (مستحسن):
```bash
cd /path/to/web-portal
git pull origin main
```

### الخطوة 2: تثبيت Dependencies
```bash
cd apps/web-portal
npm install
```

### الخطوة 3: بناء المشروع
```bash
npm run build
```

### الخطوة 4: رفع الملفات المبنية
```bash
# نسخ الملفات المبنية إلى مجلد الويب
cp -r dist/* /www/wwwroot/stcsolutions.online/
```

---

## 🗄️ تحديث قاعدة البيانات

### الطريقة 1: استخدام Migrations (مستحسن)
```bash
cd /www/wwwroot/api.stcsolutions.online
php artisan migrate
```

### الطريقة 2: استخدام SQL مباشرة
```bash
# راجع ملف DATABASE_CHANGES.md للـ SQL scripts
psql -U postgres -d your_database < migrations.sql
```

---

## ✅ التحقق من التحديثات

### 1. التحقق من Backend
```bash
# اختبار API endpoints
curl https://api.stcsolutions.online/api/v1/ai-modules
curl https://api.stcsolutions.online/api/v1/wordings
curl https://api.stcsolutions.online/api/v1/updates
```

### 2. التحقق من Frontend
- افتح https://stcsolutions.online
- تحقق من:
  - صفحة "دليل المالك" تظهر في القائمة
  - صفحة "نصوص المنصة" في Super Admin
  - صفحة "التحديثات" تعرض نظام versioning
  - صفحة "التكاملات" بها زر اختبار الاتصال

### 3. التحقق من قاعدة البيانات
```sql
-- التحقق من الجداول الجديدة
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('ai_modules', 'ai_module_configs', 'platform_wordings', 'organization_wordings');

-- التحقق من التعديلات على جدول updates
\d updates
```

---

## 🔄 Rollback (التراجع)

في حالة حدوث مشاكل:

### 1. استعادة قاعدة البيانات
```bash
psql -U postgres -d your_database < backup_file.sql
```

### 2. استعادة الملفات
```bash
tar -xzf backup_files.tar.gz -C /
```

### 3. Rollback Migrations
```bash
php artisan migrate:rollback --step=3
```

---

## 📝 ملاحظات مهمة

1. **الترتيب مهم:** يجب تشغيل migrations بالترتيب الصحيح
2. **النسخ الاحتياطي:** دائماً قم بعمل backup قبل التحديث
3. **الاختبار:** اختبر على بيئة staging أولاً إن أمكن
4. **الصلاحيات:** تأكد من الصلاحيات الصحيحة للملفات
5. **Cache:** امسح cache بعد كل تحديث

---

## 🆘 حل المشاكل الشائعة

### مشكلة: Migration فشل
```bash
# تحقق من الأخطاء
php artisan migrate:status

# إعادة المحاولة
php artisan migrate --force
```

### مشكلة: Composer errors
```bash
# تحديث composer
composer self-update
composer clear-cache
composer install --no-dev --optimize-autoloader
```

### مشكلة: Frontend build failed
```bash
# تنظيف وبناء من جديد
rm -rf node_modules dist
npm install
npm run build
```

### مشكلة: Routes لا تعمل
```bash
# مسح route cache
php artisan route:clear
php artisan route:cache
```

---

## 📞 الدعم

في حالة وجود مشاكل، راجع:
- `DATABASE_CHANGES.md` - تغييرات قاعدة البيانات
- `COMPLETE_SUMMARY.md` - ملخص التحديثات
- `PROGRESS.md` - تفاصيل المهام

---

**آخر تحديث:** 2 يناير 2025

