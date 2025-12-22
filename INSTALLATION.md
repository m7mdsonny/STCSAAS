# دليل التنصيب الكامل - STC AI-VAP

## 📋 المحتويات

1. [المتطلبات](#المتطلبات)
2. [تنصيب Cloud API](#تنصيب-cloud-api)
3. [تنصيب Web Portal](#تنصيب-web-portal)
4. [تنصيب Mobile App](#تنصيب-mobile-app)
5. [تنصيب Edge Server](#تنصيب-edge-server)
6. [إعداد قاعدة البيانات](#إعداد-قاعدة-البيانات)
7. [إعداد Firebase](#إعداد-firebase)
8. [التحقق من التنصيب](#التحقق-من-التنصيب)

---

## المتطلبات

### Cloud API (Laravel)
- PHP 8.3+
- Composer 2.0+
- PostgreSQL 14+
- Node.js 18+
- NPM 9+

### Web Portal (React)
- Node.js 18+
- NPM 9+

### Mobile App (Flutter)
- Flutter 3.0+
- Android Studio / Xcode
- Dart 3.0+

### Edge Server (Python)
- Python 3.10+
- pip 23+
- FFmpeg
- OpenCV dependencies

---

## تنصيب Cloud API

### 1. استنساخ المشروع
```bash
cd apps/cloud-laravel
```

### 2. تثبيت المتطلبات
```bash
composer install
npm install
```

### 3. إعداد البيئة
```bash
cp .env.example .env
php artisan key:generate
```

### 4. إعداد قاعدة البيانات
```bash
# في .env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=stcai
DB_USERNAME=stcai
DB_PASSWORD=your_password
```

### 5. تشغيل Migrations
```bash
php artisan migrate
```

### 6. تشغيل الخادم
```bash
php artisan serve
```

الخادم سيعمل على: `http://localhost:8000`

---

## تنصيب Web Portal

### 1. الانتقال للمجلد
```bash
cd apps/web-portal
```

### 2. تثبيت المتطلبات
```bash
npm install
```

### 3. إعداد البيئة
قم بتحديث `vite.config.ts`:
```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    },
  },
}
```

### 4. تشغيل الخادم
```bash
npm run dev
```

الخادم سيعمل على: `http://localhost:5173`

---

## تنصيب Mobile App

### 1. الانتقال للمجلد
```bash
cd apps/mobile-app
```

### 2. تثبيت المتطلبات
```bash
flutter pub get
```

### 3. إعداد البيئة
قم بتحديث `lib/config/env.dart`:
```dart
static const String apiUrl = 'https://api.stcsolutions.online/api/v1';
```

### 4. تشغيل التطبيق
```bash
flutter run
```

---

## تنصيب Edge Server

### 1. الانتقال للمجلد
```bash
cd apps/edge-server
```

### 2. إنشاء Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# أو
venv\Scripts\activate  # Windows
```

### 3. تثبيت المتطلبات
```bash
pip install -r requirements.txt
```

### 4. إعداد البيئة
```bash
cp .env.example .env
```

قم بتحديث `.env`:
```
CLOUD_API_URL=https://api.stcsolutions.online/api/v1
LICENSE_KEY=your_license_key
SERVER_HOST=0.0.0.0
SERVER_PORT=8080
```

### 5. تشغيل الخادم
```bash
python main.py
```

الخادم سيعمل على: `http://localhost:8080`

---

## إعداد قاعدة البيانات

### PostgreSQL
```bash
# إنشاء قاعدة البيانات
createdb stcai

# استيراد Schema
psql -U stcai -d stcai -f database/schema.sql
```

### أو استخدام Laravel Migrations
```bash
php artisan migrate
php artisan db:seed
```

---

## إعداد Firebase

### Web Portal
1. إنشاء مشروع Firebase
2. إضافة Web App
3. نسخ Firebase config
4. إضافة Service Worker

### Mobile App
1. إضافة `google-services.json` (Android)
2. إضافة `GoogleService-Info.plist` (iOS)
3. تحديث `pubspec.yaml`

### Cloud API
1. الحصول على FCM Server Key
2. إضافة في SystemSettings:
```php
'fcm_settings' => [
    'server_key' => 'your_server_key',
    'project_id' => 'your_project_id',
]
```

---

## التحقق من التنصيب

### Cloud API
```bash
curl http://localhost:8000/api/v1/public/landing
```

### Web Portal
افتح المتصفح: `http://localhost:5173`

### Mobile App
شغل التطبيق على الجهاز/المحاكي

### Edge Server
```bash
curl http://localhost:8080/health
```

---

## استكشاف الأخطاء

### Cloud API لا يعمل؟
- تحقق من `.env`
- تحقق من قاعدة البيانات
- راجع `storage/logs/laravel.log`

### Web Portal لا يعمل؟
- تحقق من `npm install`
- تحقق من proxy settings
- راجع console في المتصفح

### Mobile App لا يعمل؟
- تحقق من `flutter doctor`
- تحقق من API URL
- راجع logs

### Edge Server لا يعمل؟
- تحقق من `.env`
- تحقق من Python version
- راجع logs في `logs/edge_server.log`

---

## الخطوات التالية

بعد التنصيب:
1. [إعداد Authentication](AUTHENTICATION.md)
2. [إعداد Firebase](FIREBASE_SETUP.md)
3. [إعداد Integration](INTEGRATION.md)
4. [مراجعة المميزات](FEATURES.md)

---

**آخر تحديث**: 2024-12-20

