# دليل التنصيب السريع - CyberPanel

## 🚀 التنصيب السريع (3 خطوات)

### الخطوة 1: رفع الملفات

```bash
# على السيرفر، قم بتنفيذ:
cd /home/stcsolutions.online/public_html/

# استنساخ المشروع
git clone https://github.com/m7mdsonny/STCSAAS.git temp_repo
cd temp_repo

# نسخ Backend
cp -r apps/cloud-laravel/* ../backend/

# نسخ Frontend  
cp -r apps/web-portal/* ../frontend/

# تنظيف
cd ..
rm -rf temp_repo
```

### الخطوة 2: إعداد Backend

```bash
cd /home/stcsolutions.online/public_html/backend/

# تثبيت Dependencies
composer install --no-dev --optimize-autoloader

# تنظيف الكاش
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Migrations
php artisan migrate --force

# تحسين الأداء
php artisan config:cache
php artisan route:cache

# الصلاحيات
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

### الخطوة 3: إعداد Frontend

```bash
cd /home/stcsolutions.online/public_html/frontend/

# تثبيت Dependencies
npm install

# بناء المشروع
npm run build
```

---

## 📁 هيكل المجلدات النهائي

```
/home/stcsolutions.online/public_html/
├── backend/              ← من cloud-laravel/
│   ├── public/          ← Document Root لـ api.stcsolutions.online
│   ├── .env             ← ⚠️ احتفظ بالملف الموجود
│   └── ...
│
└── frontend/            ← من web-portal/
    ├── dist/            ← Document Root لـ stcsolutions.online
    └── ...
```

---

## ⚙️ إعدادات Nginx

### Backend API (api.stcsolutions.online)
```
Root: /home/stcsolutions.online/public_html/backend/public
Index: index.php
```

### Frontend Portal (stcsolutions.online)
```
Root: /home/stcsolutions.online/public_html/frontend/dist
Index: index.html
```

---

## ✅ التحقق من التنصيب

```bash
# اختبار Laravel
cd /home/stcsolutions.online/public_html/backend/
php artisan route:list

# اختبار API
curl http://api.stcsolutions.online/api/v1/public/landing

# اختبار Frontend
curl http://stcsolutions.online
```

---

## 🔄 التحديث المستقبلي

```bash
# استخدم السكريبت التلقائي
cd /home/stcsolutions.online/
bash DEPLOYMENT_SCRIPT.sh
```

---

**ملاحظة:** راجع `DEPLOYMENT_CYBERPANEL.md` للتفاصيل الكاملة.



