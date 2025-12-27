# قاعدة البيانات الكاملة - Complete Database

**التاريخ**: 2025-01-27  
**الملف**: `apps/cloud-laravel/database/stc_cloud_mysql_complete.sql`  
**الإصدار**: 3.0.0

---

## 📋 نظرة عامة

قاعدة بيانات MySQL كاملة ومحدثة تحتوي على:
- ✅ جميع الـ Tables المطلوبة (24 table)
- ✅ بيانات تجريبية حقيقية لكل شيء
- ✅ متوافقة مع آخر التحديثات
- ✅ تشمل Registered Faces & Vehicles
- ✅ تشمل Vehicle Access Logs
- ✅ ربط كامل مع Events

---

## 🗄️ Tables Included (24 Tables)

1. ✅ `distributors` - الموزعون
2. ✅ `resellers` - التجار
3. ✅ `organizations` - المؤسسات
4. ✅ `users` - المستخدمون
5. ✅ `subscription_plans` - خطط الاشتراك
6. ✅ `licenses` - التراخيص
7. ✅ `edge_servers` - السيرفرات المحلية
8. ✅ `cameras` - الكاميرات
9. ✅ `registered_faces` - الوجوه المسجلة ⭐ جديد
10. ✅ `registered_vehicles` - المركبات المسجلة ⭐ جديد
11. ✅ `vehicle_access_logs` - سجلات الوصول للمركبات ⭐ جديد
12. ✅ `events` - الأحداث (محدث مع foreign keys) ⭐ محدث
13. ✅ `notifications` - الإشعارات
14. ✅ `ai_modules` - وحدات الذكاء الاصطناعي
15. ✅ `ai_module_configs` - إعدادات وحدات الذكاء الاصطناعي
16. ✅ `ai_commands` - أوامر الذكاء الاصطناعي
17. ✅ `integrations` - التكاملات
18. ✅ `automation_rules` - قواعد الأتمتة
19. ✅ `automation_logs` - سجلات الأتمتة
20. ✅ `system_updates` - تحديثات النظام
21. ✅ `system_settings` - إعدادات النظام
22. ✅ `platform_wordings` - نصوص المنصة
23. ✅ `organization_wordings` - نصوص المؤسسات
24. ✅ `personal_access_tokens` - رموز الوصول (Laravel Sanctum)

---

## 📊 Demo Data Included

### Organizations (3)
- مؤسسة تجريبية (Demo Organization)
- شركة التكنولوجيا المتقدمة (Advanced Tech Company)
- مؤسسة الشرق (East Organization)

### Users (6)
- 1 Super Admin
- 5 Organization Users (owners, admins, editors)

### Edge Servers (4)
- 2 Online servers for Organization 1
- 1 Online server for Organization 2
- 1 Offline server for Organization 3

### Cameras (6)
- 4 cameras for Organization 1
- 1 camera for Organization 2
- 1 camera for Organization 3

### Registered Faces (8)
- 5 employees
- 2 VIPs
- 1 visitor
- 1 blacklist

### Registered Vehicles (7)
- 3 employee vehicles
- 2 VIP vehicles
- 1 delivery vehicle
- 1 blacklist vehicle

### Vehicle Access Logs (7)
- Real access logs with timestamps
- Different directions (in/out)
- Confidence scores
- Access reasons

### Events (12)
- Face recognition events (linked to registered faces)
- Vehicle recognition events (linked to registered vehicles)
- Fire detection events
- Unknown face events

### Notifications (4)
- Push notifications
- Different priorities
- Read/unread status

### AI Modules (10)
- Face Detection
- Face Recognition
- Object Detection
- Vehicle Detection
- License Plate Recognition
- Crowd Counting
- Intrusion Detection
- Loitering Detection
- Abandoned Object
- Fire Detection

### AI Module Configs (5)
- Configurations for different organizations

### AI Commands (3)
- Different command types and statuses

### Integrations (3)
- SMS Gateway
- Email Service
- Custom Webhook

### Automation Rules (3)
- VIP Recognition Rule
- Blacklist Vehicle Blocking
- Fire Alert Rule

---

## 🔑 Default Credentials

### Super Admin
- **Email**: `superadmin@stc-solutions.com`
- **Password**: `password`

### Organization Owner (Demo Org)
- **Email**: `owner@demo-org.com`
- **Password**: `password`

### Organization Admin (Demo Org)
- **Email**: `admin@demo-org.com`
- **Password**: `password`

### Organization Editor (Demo Org)
- **Email**: `editor@demo-org.com`
- **Password**: `password`

---

## 🚀 Installation

### Method 1: Using phpMyAdmin
1. افتح phpMyAdmin
2. أنشئ قاعدة بيانات جديدة باسم `stcai`
3. اختر قاعدة البيانات
4. اذهب إلى تبويب "Import"
5. اختر الملف `stc_cloud_mysql_complete.sql`
6. اضغط "Go"

### Method 2: Using MySQL Command Line
```bash
mysql -u stcai -p stcai < apps/cloud-laravel/database/stc_cloud_mysql_complete.sql
```

### Method 3: Using Laravel Migrations
```bash
php artisan migrate:fresh --seed
```
(Note: This requires seeders to be created)

---

## ✅ Features

### 1. Complete Integration
- ✅ All tables linked with proper foreign keys
- ✅ Registered faces linked to events
- ✅ Registered vehicles linked to events
- ✅ Vehicle access logs linked to vehicles and cameras

### 2. Real Demo Data
- ✅ Realistic Arabic names
- ✅ Realistic vehicle plate numbers (English & Arabic)
- ✅ Realistic timestamps
- ✅ Realistic recognition counts
- ✅ Realistic confidence scores

### 3. Organization Isolation
- ✅ Each organization has its own data
- ✅ Proper organization_id foreign keys
- ✅ Super admin can see all data

### 4. Audit Trail
- ✅ created_by and updated_by tracking
- ✅ Timestamps for all records
- ✅ Soft deletes where applicable

---

## 📝 Notes

1. **Passwords**: جميع كلمات المرور هي `password` (مشفرة بـ bcrypt)
2. **Timestamps**: جميع التواريخ في UTC
3. **Soft Deletes**: بعض الـ tables تستخدم soft deletes
4. **JSON Fields**: بعض الحقول تستخدم JSON format
5. **Foreign Keys**: جميع الـ foreign keys محددة بشكل صحيح

---

## 🔄 Updates from Previous Version

### New Tables Added
- `registered_faces` - للوجوه المسجلة
- `registered_vehicles` - للمركبات المسجلة
- `vehicle_access_logs` - لسجلات الوصول
- `automation_rules` - لقواعد الأتمتة
- `automation_logs` - لسجلات الأتمتة
- `resellers` - للتجار

### Updated Tables
- `events` - إضافة `registered_face_id` و `registered_vehicle_id`
- `organizations` - إضافة `reseller_id`
- `system_settings` - تحديث البنية

### New Demo Data
- 8 Registered Faces
- 7 Registered Vehicles
- 7 Vehicle Access Logs
- 12 Events (linked to faces/vehicles)
- 3 Automation Rules

---

## 🎯 Testing

بعد رفع قاعدة البيانات، يمكنك:
1. تسجيل الدخول كـ Super Admin
2. تسجيل الدخول كـ Organization Owner
3. عرض الأشخاص المسجلين
4. عرض المركبات المسجلة
5. عرض سجلات الوصول
6. عرض الأحداث المرتبطة بالأشخاص والمركبات
7. اختبار جميع الوظائف

---

## 📁 File Location

```
apps/cloud-laravel/database/stc_cloud_mysql_complete.sql
```

---

**قاعدة البيانات جاهزة للاستخدام! ✅**

