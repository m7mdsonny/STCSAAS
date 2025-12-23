# دليل التنصيب الكامل على السيرفر المحلي

## 📋 المحتويات

1. [المتطلبات الأساسية](#المتطلبات-الأساسية)
2. [تنصيب Backend (Laravel)](#تنصيب-backend-laravel)
3. [تنصيب Frontend (React)](#تنصيب-frontend-react)
4. [إعداد قاعدة البيانات](#إعداد-قاعدة-البيانات)
5. [بناء المشروع (Build)](#بناء-المشروع-build)
6. [تشغيل المشروع](#تشغيل-المشروع)
7. [بناء Edge Server كـ EXE](#بناء-edge-server-كـ-exe)
8. [استكشاف الأخطاء](#استكشاف-الأخطاء)

---

## المتطلبات الأساسية

### 1. Windows Server / Windows 10/11

### 2. البرامج المطلوبة

#### أ) PHP 8.2 أو أحدث
```powershell
# تحميل من: https://windows.php.net/download/
# أو استخدام Chocolatey:
choco install php --version=8.2.0
```

#### ب) Composer
```powershell
# تحميل من: https://getcomposer.org/download/
# أو استخدام Chocolatey:
choco install composer
```

#### ج) Node.js 18+ و NPM
```powershell
# تحميل من: https://nodejs.org/
# أو استخدام Chocolatey:
choco install nodejs-lts
```

#### د) PostgreSQL 14+
```powershell
# تحميل من: https://www.postgresql.org/download/windows/
# أو استخدام Chocolatey:
choco install postgresql
```

#### هـ) Git
```powershell
# تحميل من: https://git-scm.com/download/win
# أو استخدام Chocolatey:
choco install git
```

---

## تنصيب Backend (Laravel)

### الخطوة 1: استنساخ المشروع

```powershell
# فتح PowerShell كـ Administrator
cd C:\
git clone https://github.com/m7mdsonny/STCSAAS.git
cd STCSAAS
```

### الخطوة 2: الانتقال لمجلد Laravel

```powershell
cd apps\cloud-laravel
```

### الخطوة 3: تثبيت Dependencies

```powershell
# تثبيت PHP packages
composer install

# إذا واجهت مشاكل مع memory limit:
php -d memory_limit=512M composer install
```

### الخطوة 4: إعداد ملف البيئة (.env)

```powershell
# نسخ ملف المثال
copy .env.example .env

# فتح الملف للتعديل
notepad .env
```

#### تعديل إعدادات قاعدة البيانات في `.env`:

```env
APP_NAME="STC AI-VAP"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=stcai
DB_USERNAME=postgres
DB_PASSWORD=your_password_here

# إعدادات أخرى مهمة
BROADCAST_DRIVER=log
CACHE_DRIVER=file
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

# Mail Settings (اختياري)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your_email@gmail.com
MAIL_FROM_NAME="${APP_NAME}"

# Sanctum (للـ API Authentication)
SANCTUM_STATEFUL_DOMAINS=localhost,127.0.0.1
```

### الخطوة 5: توليد Application Key

```powershell
php artisan key:generate
```

### الخطوة 6: إنشاء قاعدة البيانات

```powershell
# فتح PostgreSQL Command Line
psql -U postgres

# في psql:
CREATE DATABASE stcai;
CREATE USER stcai_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE stcai TO stcai_user;
\q
```

### الخطوة 7: استيراد قاعدة البيانات

#### الطريقة 1: استخدام SQL Dump (مستحسن)

```powershell
# استيراد قاعدة البيانات من ملف SQL
psql -U postgres -d stcai -f database\stc_cloud_production_clean.sql
```

#### الطريقة 2: استخدام Migrations

```powershell
# تشغيل migrations
php artisan migrate

# تشغيل seeders
php artisan db:seed --class=AiModuleSeeder
```

### الخطوة 8: إعداد الصلاحيات

```powershell
# إنشاء مجلدات storage و cache
php artisan storage:link

# إصلاح الصلاحيات (على Windows عادة لا حاجة)
# لكن تأكد من أن المجلدات قابلة للكتابة
```

### الخطوة 9: تحديث Cache

```powershell
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### الخطوة 10: تشغيل Laravel Server

```powershell
# تشغيل الخادم على localhost:8000
php artisan serve

# أو على منفذ محدد:
php artisan serve --port=8000 --host=0.0.0.0
```

**التحقق:** افتح المتصفح على `http://localhost:8000/api/health` (إذا كان endpoint موجود)

---

## تنصيب Frontend (React)

### الخطوة 1: الانتقال لمجلد React

```powershell
# من المجلد الرئيسي
cd ..\web-portal
```

### الخطوة 2: تثبيت Dependencies

```powershell
npm install

# إذا واجهت مشاكل:
npm install --legacy-peer-deps
```

### الخطوة 3: إعداد ملف البيئة

```powershell
# إنشاء ملف .env.local
notepad .env.local
```

#### إضافة الإعدادات التالية:

```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=STC AI-VAP
```

### الخطوة 4: التحقق من إعدادات Vite

افتح `vite.config.ts` وتأكد من:

```typescript
export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  // ... باقي الإعدادات
})
```

### الخطوة 5: تشغيل Development Server

```powershell
npm run dev
```

**التحقق:** افتح المتصفح على `http://localhost:5173`

---

## إعداد قاعدة البيانات

### 1. استيراد قاعدة البيانات الكاملة

```powershell
# من مجلد Laravel
cd apps\cloud-laravel

# استيراد SQL dump
psql -U postgres -d stcai -f database\stc_cloud_production_clean.sql
```

### 2. التحقق من البيانات

```powershell
# فتح psql
psql -U postgres -d stcai

# التحقق من الجداول
\dt

# التحقق من المستخدمين
SELECT id, email, role FROM users LIMIT 5;

# التحقق من المؤسسات
SELECT id, name FROM organizations LIMIT 5;

# الخروج
\q
```

### 3. بيانات الدخول الافتراضية

راجع ملف `LOGIN_CREDENTIALS_AR.md` أو `DEMO_CREDENTIALS.md` للحصول على بيانات الدخول.

---

## بناء المشروع (Build)

### بناء Frontend للإنتاج

### الخطوة 1: بناء React App

```powershell
cd apps\web-portal

# بناء المشروع
npm run build
```

### الخطوة 2: الملفات المبنية

بعد البناء، ستجد الملفات في:
```
apps\web-portal\dist\
```

### الخطوة 3: إعداد Web Server (Nginx أو Apache)

#### أ) استخدام Nginx (مستحسن)

```powershell
# تثبيت Nginx
choco install nginx

# أو تحميل من: https://nginx.org/en/download.html
```

#### إعداد Nginx (`C:\nginx\conf\nginx.conf`):

```nginx
server {
    listen 80;
    server_name localhost;
    root C:/STCSAAS/apps/web-portal/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### ب) استخدام Apache

```powershell
# تثبيت Apache
choco install apache-httpd
```

#### إعداد Apache (`C:\Apache24\conf\httpd.conf`):

```apache
<VirtualHost *:80>
    ServerName localhost
    DocumentRoot "C:/STCSAAS/apps/web-portal/dist"
    
    <Directory "C:/STCSAAS/apps/web-portal/dist">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ProxyPass /api http://localhost:8000/api
    ProxyPassReverse /api http://localhost:8000/api
</VirtualHost>
```

### الخطوة 4: تشغيل Web Server

```powershell
# Nginx
cd C:\nginx
.\nginx.exe

# Apache
cd C:\Apache24\bin
.\httpd.exe
```

---

## تشغيل المشروع

### الطريقة 1: Development Mode

#### Terminal 1 - Laravel:
```powershell
cd apps\cloud-laravel
php artisan serve
```

#### Terminal 2 - React:
```powershell
cd apps\web-portal
npm run dev
```

**الوصول:**
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`

### الطريقة 2: Production Mode

#### Terminal 1 - Laravel:
```powershell
cd apps\cloud-laravel
php artisan serve --host=0.0.0.0 --port=8000
```

#### Terminal 2 - Nginx/Apache:
```powershell
# تشغيل Web Server
```

**الوصول:**
- Frontend: `http://localhost`
- Backend API: `http://localhost:8000` أو `http://localhost/api`

---

## بناء Edge Server كـ EXE

### المتطلبات

```powershell
# تثبيت Python 3.10+
choco install python

# تثبيت PyInstaller
pip install pyinstaller
```

### الخطوة 1: الانتقال لمجلد Edge Server

```powershell
cd apps\edge-server
```

### الخطوة 2: تثبيت Dependencies

```powershell
# إنشاء virtual environment
python -m venv venv

# تفعيل virtual environment
.\venv\Scripts\activate

# تثبيت المتطلبات
pip install -r requirements.txt
```

### الخطوة 3: إعداد ملف البيئة

```powershell
copy .env.example .env
notepad .env
```

#### تعديل `.env`:

```env
CLOUD_API_URL=http://localhost:8000
LICENSE_KEY=your_license_key
CAMERA_SOURCE=0
# ... باقي الإعدادات
```

### الخطوة 4: بناء EXE

```powershell
# بناء EXE باستخدام PyInstaller
pyinstaller --name="STC-Edge-Server" --onefile --windowed --icon=icon.ico main.py

# أو مع خيارات متقدمة:
pyinstaller --name="STC-Edge-Server" ^
    --onefile ^
    --windowed ^
    --hidden-import=uvicorn ^
    --hidden-import=fastapi ^
    --hidden-import=opencv-python ^
    --add-data "models;models" ^
    --icon=icon.ico ^
    main.py
```

### الخطوة 5: الملف الناتج

ستجد EXE في:
```
apps\edge-server\dist\STC-Edge-Server.exe
```

### الخطوة 6: تشغيل EXE

```powershell
# تشغيل مباشر
.\dist\STC-Edge-Server.exe

# أو كـ Windows Service (يتطلب إعداد إضافي)
```

---

## استكشاف الأخطاء

### مشكلة: Composer install فشل

```powershell
# زيادة memory limit
php -d memory_limit=512M composer install

# أو تحديث Composer
composer self-update
```

### مشكلة: npm install فشل

```powershell
# مسح cache
npm cache clean --force

# حذف node_modules وإعادة التثبيت
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### مشكلة: Laravel لا يعمل

```powershell
# التحقق من PHP version
php -v

# التحقق من Composer
composer --version

# مسح cache
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

### مشكلة: قاعدة البيانات لا تتصل

```powershell
# التحقق من PostgreSQL
psql -U postgres -c "SELECT version();"

# التحقق من الاتصال
php artisan tinker
# ثم في tinker:
DB::connection()->getPdo();
```

### مشكلة: React لا يعمل

```powershell
# التحقق من Node.js
node -v
npm -v

# إعادة بناء
npm run build

# التحقق من الأخطاء
npm run typecheck
```

### مشكلة: CORS Errors

في `apps/cloud-laravel/config/cors.php`:

```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => ['http://localhost:5173', 'http://localhost'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
```

### مشكلة: 403 Permission Error

```powershell
# التحقق من الصلاحيات (على Linux/Mac)
chmod -R 775 storage bootstrap/cache

# على Windows، تأكد من أن المجلدات قابلة للكتابة
```

---

## Checklist التنصيب

- [ ] تثبيت PHP 8.2+
- [ ] تثبيت Composer
- [ ] تثبيت Node.js 18+
- [ ] تثبيت PostgreSQL 14+
- [ ] استنساخ المشروع
- [ ] تثبيت Laravel dependencies
- [ ] إعداد ملف .env
- [ ] توليد APP_KEY
- [ ] إنشاء قاعدة البيانات
- [ ] استيراد قاعدة البيانات
- [ ] تشغيل migrations
- [ ] تثبيت React dependencies
- [ ] بناء Frontend
- [ ] تشغيل Laravel server
- [ ] تشغيل React dev server
- [ ] التحقق من الوصول للموقع

---

## نصائح إضافية

### 1. استخدام Windows Services

لجعل Laravel يعمل كـ Windows Service:

```powershell
# تثبيت NSSM (Non-Sucking Service Manager)
choco install nssm

# إنشاء service
nssm install LaravelAPI "C:\php\php.exe" "C:\STCSAAS\apps\cloud-laravel\artisan serve --host=0.0.0.0 --port=8000"
```

### 2. استخدام Task Scheduler

لجعل Laravel Task Scheduler يعمل:

```powershell
# إنشاء scheduled task
schtasks /create /tn "Laravel Scheduler" /tr "php C:\STCSAAS\apps\cloud-laravel\artisan schedule:run" /sc minute /mo 1
```

### 3. إعداد Firewall

```powershell
# فتح منافذ
netsh advfirewall firewall add rule name="Laravel API" dir=in action=allow protocol=TCP localport=8000
netsh advfirewall firewall add rule name="React Dev" dir=in action=allow protocol=TCP localport=5173
```

---

## الدعم والمساعدة

في حالة وجود مشاكل:

1. راجع ملفات التوثيق في `updates/2025-01-production-fixes/`
2. راجع `DEPLOYMENT_INSTRUCTIONS.md`
3. راجع `DATABASE_CHANGES.md` لتغييرات قاعدة البيانات

---

**آخر تحديث:** 2 يناير 2025  
**الإصدار:** 2.3.1

