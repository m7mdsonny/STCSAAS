# دليل إعداد CyberPanel - STC AI-VAP Platform

## 📋 السيناريوهات المتاحة

### السيناريو 1: API و Frontend على دومينات منفصلة (مُوصى به)
- **API:** `api.stcsolutions.online` → Laravel Backend
- **Frontend:** `stcsolutions.online` → React Frontend

### السيناريو 2: كل شيء على نفس الدومين
- **Domain:** `stcsolutions.online` → Laravel Backend (API + Frontend)

---

## 🚀 السيناريو 1: دومينات منفصلة (مُوصى به)

### الخطوة 1: إنشاء موقع API

1. افتح CyberPanel
2. اذهب إلى **Websites > Create Website**
3. أدخل:
   - **Domain:** `api.stcsolutions.online`
   - **Email:** `m7mdsonny@gmail.com`
   - **PHP Version:** PHP 8.2
   - **Document Root:** `/home/stcsolutions.online/public_html/backend/public`

4. بعد الإنشاء، اذهب إلى **Websites > api.stcsolutions.online > Manage > OpenLiteSpeed Config**
5. استبدل المحتوى بمحتوى ملف: **`CYBERPANEL_API_VHOST.txt`**
6. احفظ وأعد تحميل OpenLiteSpeed

### الخطوة 2: إنشاء موقع Frontend

1. افتح CyberPanel
2. اذهب إلى **Websites > Create Website**
3. أدخل:
   - **Domain:** `stcsolutions.online`
   - **Email:** `m7mdsonny@gmail.com`
   - **PHP Version:** PHP 8.2 (اختياري للـ Frontend)
   - **Document Root:** `/home/stcsolutions.online/public_html/frontend/dist`

4. بعد الإنشاء، اذهب إلى **Websites > stcsolutions.online > Manage > OpenLiteSpeed Config**
5. استبدل المحتوى بمحتوى ملف: **`CYBERPANEL_FRONTEND_VHOST.txt`**
6. احفظ وأعد تحميل OpenLiteSpeed

### الخطوة 3: إعداد SSL

```bash
# عبر CyberPanel:
# Websites > api.stcsolutions.online > SSL > Issue SSL
# Websites > stcsolutions.online > SSL > Issue SSL
```

---

## 🔧 السيناريو 2: نفس الدومين

1. افتح CyberPanel
2. اذهب إلى **Websites > stcsolutions.online > Manage > OpenLiteSpeed Config**
3. استبدل المحتوى بمحتوى ملف: **`CYBERPANEL_VHOST_CONFIG.txt`**
4. تأكد من أن **Document Root** هو: `/home/stcsolutions.online/public_html/backend/public`
5. احفظ وأعد تحميل OpenLiteSpeed

---

## ⚙️ الإعدادات المهمة في الملفات

### للملفات الثلاثة:

1. **docRoot:** المسار الصحيح للملفات
   - API: `/home/stcsolutions.online/public_html/backend/public`
   - Frontend: `/home/stcsolutions.online/public_html/frontend/dist`

2. **extprocessor:** إعدادات PHP
   - تأكد من أن `stcso3998` يطابق اسم المستخدم في CyberPanel
   - تأكد من أن `lsphp82` يطابق إصدار PHP

3. **phpIniOverride:** إعدادات PHP
   - `open_basedir`: المسار المسموح
   - `memory_limit`: 512M
   - `max_execution_time`: 300

4. **rewrite:** قواعد إعادة الكتابة
   - API: جميع الطلبات → `index.php`
   - Frontend: SPA Routing → `index.html`

---

## 🔍 التحقق من الإعدادات

### بعد تطبيق الإعدادات:

```bash
# 1. التحقق من Document Root
ls -la /home/stcsolutions.online/public_html/backend/public/index.php
ls -la /home/stcsolutions.online/public_html/frontend/dist/index.html

# 2. اختبار API
curl http://api.stcsolutions.online/api/v1/public/landing

# 3. اختبار Frontend
curl http://stcsolutions.online

# 4. التحقق من Logs
tail -f /home/stcsolutions.online/logs/api.stcsolutions.online.error_log
tail -f /home/stcsolutions.online/logs/stcsolutions.online.error_log
```

---

## 🐛 حل المشاكل

### مشكلة: 404 Not Found

```bash
# تحقق من Document Root
# يجب أن يكون:
# API: /home/stcsolutions.online/public_html/backend/public
# Frontend: /home/stcsolutions.online/public_html/frontend/dist
```

### مشكلة: 500 Internal Server Error

```bash
# تحقق من الصلاحيات
chmod -R 755 /home/stcsolutions.online/public_html/backend/storage
chmod -R 755 /home/stcsolutions.online/public_html/backend/bootstrap/cache

# تحقق من Logs
tail -50 /home/stcsolutions.online/logs/api.stcsolutions.online.error_log
```

### مشكلة: PHP Errors

```bash
# تحقق من إصدار PHP
/usr/local/lsws/lsphp82/bin/lsphp -v

# تحقق من open_basedir في الملف
# يجب أن يكون: /home/stcsolutions.online/public_html/backend:/tmp
```

---

## 📝 ملاحظات مهمة

1. **اسم المستخدم:** تأكد من أن `stcso3998` يطابق اسم المستخدم الفعلي في CyberPanel
2. **إصدار PHP:** تأكد من أن `lsphp82` يطابق إصدار PHP المثبت
3. **SSL:** بعد تطبيق الإعدادات، قم بإصدار شهادات SSL
4. **الصلاحيات:** تأكد من تعيين الصلاحيات الصحيحة لمجلدات `storage` و `bootstrap/cache`

---

**آخر تحديث:** 2 يناير 2025



