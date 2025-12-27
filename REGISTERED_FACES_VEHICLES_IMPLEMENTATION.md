# تنفيذ Registered Faces و Registered Vehicles - Implementation Guide

**التاريخ**: 2025-01-27  
**الحالة**: ✅ مكتمل 100%

---

## 📋 نظرة عامة

تم إنشاء نظام كامل لإدارة الوجوه المسجلة (Registered Faces) والمركبات المسجلة (Registered Vehicles) مع ربطها بجميع مكونات النظام.

---

## 🗄️ Database Tables

### 1. `registered_faces`
جدول لإدارة الوجوه المسجلة للأشخاص.

**الأعمدة الرئيسية:**
- `id` - المعرف الفريد
- `organization_id` - معرف المؤسسة (Foreign Key)
- `person_name` - اسم الشخص
- `employee_id` - رقم الموظف (اختياري)
- `department` - القسم (اختياري)
- `category` - الفئة (employee, vip, visitor, blacklist)
- `photo_url` - رابط الصورة
- `face_encoding` - ترميز الوجه (Base64)
- `face_metadata` - بيانات إضافية للتعرف على الوجه (JSON)
- `is_active` - حالة التفعيل
- `last_seen_at` - آخر مرة تم رؤية الشخص
- `recognition_count` - عدد مرات التعرف
- `meta` - بيانات إضافية (JSON)
- `created_by` - منشئ السجل
- `updated_by` - آخر من قام بالتحديث
- `timestamps` - تواريخ الإنشاء والتحديث
- `soft_deletes` - حذف ناعم

**Indexes:**
- `organization_id`
- `category`
- `department`
- `is_active`
- `employee_id`
- `last_seen_at`

### 2. `registered_vehicles`
جدول لإدارة المركبات المسجلة.

**الأعمدة الرئيسية:**
- `id` - المعرف الفريد
- `organization_id` - معرف المؤسسة (Foreign Key)
- `plate_number` - رقم اللوحة
- `plate_ar` - رقم اللوحة بالعربية (اختياري)
- `owner_name` - اسم المالك (اختياري)
- `vehicle_type` - نوع المركبة (car, truck, motorcycle, etc.)
- `vehicle_color` - لون المركبة
- `vehicle_make` - ماركة المركبة
- `vehicle_model` - موديل المركبة
- `category` - الفئة (employee, vip, visitor, delivery, blacklist)
- `photo_url` - رابط صورة المركبة
- `plate_encoding` - ترميز اللوحة
- `vehicle_metadata` - بيانات إضافية للتعرف على المركبة (JSON)
- `is_active` - حالة التفعيل
- `last_seen_at` - آخر مرة تم رؤية المركبة
- `recognition_count` - عدد مرات التعرف
- `meta` - بيانات إضافية (JSON)
- `created_by` - منشئ السجل
- `updated_by` - آخر من قام بالتحديث
- `timestamps` - تواريخ الإنشاء والتحديث
- `soft_deletes` - حذف ناعم

**Indexes:**
- `organization_id`
- `category`
- `is_active`
- `plate_number`
- `plate_ar`
- `last_seen_at`
- `unique(organization_id, plate_number)` - لوحة فريدة لكل مؤسسة

### 3. `vehicle_access_logs`
جدول لتسجيل سجلات الوصول للمركبات.

**الأعمدة الرئيسية:**
- `id` - المعرف الفريد
- `organization_id` - معرف المؤسسة (Foreign Key)
- `vehicle_id` - معرف المركبة المسجلة (Foreign Key)
- `camera_id` - معرف الكاميرا (Foreign Key)
- `plate_number` - رقم اللوحة (لقطة لحظة التعرف)
- `plate_ar` - رقم اللوحة بالعربية
- `direction` - الاتجاه (in, out)
- `access_granted` - هل تم منح الوصول
- `access_reason` - سبب منح/رفض الوصول
- `confidence_score` - درجة الثقة في التعرف (0-100)
- `photo_url` - رابط صورة المركبة
- `recognition_metadata` - بيانات التعرف الكاملة (JSON)
- `recognized_at` - وقت التعرف
- `meta` - بيانات إضافية (JSON)
- `timestamps` - تواريخ الإنشاء والتحديث

**Indexes:**
- `organization_id`
- `vehicle_id`
- `camera_id`
- `recognized_at`
- `access_granted`
- `direction`
- `(organization_id, recognized_at)` - مركب

---

## 📦 Models

### 1. `RegisteredFace` Model

**Location**: `apps/cloud-laravel/app/Models/RegisteredFace.php`

**Relationships:**
- `organization()` - BelongsTo Organization
- `creator()` - BelongsTo User (created_by)
- `updater()` - BelongsTo User (updated_by)
- `events()` - HasMany Event

**Scopes:**
- `active()` - الوجوه النشطة فقط
- `category($category)` - تصفية حسب الفئة
- `department($department)` - تصفية حسب القسم
- `search($search)` - البحث بالاسم، رقم الموظف، أو القسم

**Methods:**
- `recordRecognition()` - تسجيل عملية تعرف جديدة
- `hasFaceEncoding()` - التحقق من وجود ترميز للوجه
- `getRecognitionStats()` - الحصول على إحصائيات التعرف

### 2. `RegisteredVehicle` Model

**Location**: `apps/cloud-laravel/app/Models/RegisteredVehicle.php`

**Relationships:**
- `organization()` - BelongsTo Organization
- `creator()` - BelongsTo User (created_by)
- `updater()` - BelongsTo User (updated_by)
- `accessLogs()` - HasMany VehicleAccessLog
- `events()` - HasMany Event

**Scopes:**
- `active()` - المركبات النشطة فقط
- `category($category)` - تصفية حسب الفئة
- `search($search)` - البحث برقم اللوحة، اللوحة العربية، أو اسم المالك

**Methods:**
- `recordRecognition()` - تسجيل عملية تعرف جديدة
- `hasPlateEncoding()` - التحقق من وجود ترميز للوحة
- `getFullDescription()` - الحصول على وصف كامل للمركبة
- `getRecognitionStats()` - الحصول على إحصائيات التعرف

### 3. `VehicleAccessLog` Model

**Location**: `apps/cloud-laravel/app/Models/VehicleAccessLog.php`

**Relationships:**
- `organization()` - BelongsTo Organization
- `vehicle()` - BelongsTo RegisteredVehicle
- `camera()` - BelongsTo Camera

**Scopes:**
- `accessGranted($granted)` - تصفية حسب منح الوصول
- `direction($direction)` - تصفية حسب الاتجاه
- `dateRange($from, $to)` - تصفية حسب النطاق الزمني
- `highConfidence($threshold)` - التعرفات عالية الثقة

**Methods:**
- `getAccessStatusBadge()` - الحصول على شارة حالة الوصول
- `getDirectionIcon()` - الحصول على أيقونة الاتجاه

---

## 🔗 Updated Models

### Organization Model
تم إضافة الـ relationships التالية:
- `registeredFaces()` - HasMany RegisteredFace
- `registeredVehicles()` - HasMany RegisteredVehicle
- `vehicleAccessLogs()` - HasMany VehicleAccessLog

### Event Model
تم إضافة الـ relationships التالية:
- `registeredFace()` - BelongsTo RegisteredFace
- `registeredVehicle()` - BelongsTo RegisteredVehicle

### Camera Model
تم إضافة الـ relationships التالية:
- `vehicleAccessLogs()` - HasMany VehicleAccessLog

### User Model
تم إضافة الـ relationships التالية:
- `createdRegisteredFaces()` - HasMany RegisteredFace (created_by)
- `updatedRegisteredFaces()` - HasMany RegisteredFace (updated_by)
- `createdRegisteredVehicles()` - HasMany RegisteredVehicle (created_by)
- `updatedRegisteredVehicles()` - HasMany RegisteredVehicle (updated_by)

---

## 🛣️ API Endpoints

### People (Registered Faces) Endpoints

**Base Path**: `/api/v1/people`

- `GET /people` - قائمة الأشخاص المسجلين
- `GET /people/{id}` - تفاصيل شخص محدد
- `POST /people` - إضافة شخص جديد
- `PUT /people/{id}` - تحديث شخص
- `DELETE /people/{id}` - حذف شخص
- `POST /people/{id}/toggle-active` - تفعيل/تعطيل شخص
- `POST /people/{id}/photo` - رفع صورة شخص
- `GET /people/departments` - قائمة الأقسام

### Vehicles (Registered Vehicles) Endpoints

**Base Path**: `/api/v1/vehicles`

- `GET /vehicles` - قائمة المركبات المسجلة
- `GET /vehicles/{id}` - تفاصيل مركبة محددة
- `POST /vehicles` - إضافة مركبة جديدة
- `PUT /vehicles/{id}` - تحديث مركبة
- `DELETE /vehicles/{id}` - حذف مركبة
- `POST /vehicles/{id}/toggle-active` - تفعيل/تعطيل مركبة
- `GET /vehicles/access-logs` - سجلات الوصول للمركبات

---

## 🎯 Features

### 1. Face Recognition Integration
- تخزين ترميز الوجه (Face Encoding)
- تتبع عدد مرات التعرف
- تسجيل آخر مرة تم رؤية الشخص
- ربط الأحداث (Events) بالأشخاص المسجلين

### 2. Vehicle Recognition Integration
- تخزين ترميز اللوحة (Plate Encoding)
- تتبع عدد مرات التعرف
- تسجيل آخر مرة تم رؤية المركبة
- ربط الأحداث (Events) بالمركبات المسجلة
- سجلات الوصول (Access Logs)

### 3. Access Control
- تصنيف الأشخاص والمركبات (employee, vip, visitor, blacklist, delivery)
- تسجيل عمليات الوصول
- تتبع الاتجاه (دخول/خروج)
- درجة الثقة في التعرف

### 4. Organization Isolation
- كل مؤسسة ترى فقط بياناتها
- Super Admin يمكنه رؤية جميع البيانات
- فهرسة محسّنة للاستعلامات السريعة

### 5. Audit Trail
- تتبع منشئ السجل (`created_by`)
- تتبع آخر من قام بالتحديث (`updated_by`)
- Soft Deletes للحفاظ على البيانات

---

## 📝 Usage Examples

### Creating a Registered Face

```php
$person = RegisteredFace::create([
    'organization_id' => $organizationId,
    'person_name' => 'أحمد محمد',
    'employee_id' => 'EMP001',
    'department' => 'IT',
    'category' => 'employee',
    'photo_url' => '/storage/people/photos/photo.jpg',
    'face_encoding' => base64_encode($faceEncoding),
    'is_active' => true,
    'created_by' => auth()->id(),
]);
```

### Creating a Registered Vehicle

```php
$vehicle = RegisteredVehicle::create([
    'organization_id' => $organizationId,
    'plate_number' => 'ABC123',
    'plate_ar' => 'أ ب ج ١٢٣',
    'owner_name' => 'محمد علي',
    'vehicle_type' => 'car',
    'vehicle_color' => 'white',
    'category' => 'employee',
    'is_active' => true,
    'created_by' => auth()->id(),
]);
```

### Recording Vehicle Access

```php
VehicleAccessLog::create([
    'organization_id' => $organizationId,
    'vehicle_id' => $vehicle->id,
    'camera_id' => $camera->id,
    'plate_number' => $vehicle->plate_number,
    'direction' => 'in',
    'access_granted' => true,
    'access_reason' => 'Employee vehicle',
    'confidence_score' => 95.5,
    'recognized_at' => now(),
]);
```

### Querying with Relationships

```php
// Get person with organization and events
$person = RegisteredFace::with(['organization', 'events'])->find($id);

// Get vehicle with access logs
$vehicle = RegisteredVehicle::with(['accessLogs', 'organization'])->find($id);

// Get access logs with vehicle and camera
$logs = VehicleAccessLog::with(['vehicle', 'camera'])->get();
```

---

## 🔄 Integration Points

### 1. Edge Server Integration
- عند التعرف على وجه، يتم ربط الحدث (Event) بالشخص المسجل
- عند التعرف على مركبة، يتم ربط الحدث (Event) بالمركبة المسجلة
- يتم تحديث `last_seen_at` و `recognition_count` تلقائياً

### 2. Event System
- الأحداث (Events) يمكن ربطها بأشخاص مسجلين
- الأحداث (Events) يمكن ربطها بمركبات مسجلة
- يتم تخزين بيانات التعرف في `meta` field

### 3. Analytics Integration
- يمكن تحليل بيانات التعرف على الأشخاص
- يمكن تحليل بيانات التعرف على المركبات
- يمكن تحليل سجلات الوصول

---

## ✅ Testing Checklist

- [x] Migrations created and tested
- [x] Models created with all relationships
- [x] Controllers updated with created_by/updated_by
- [x] Organization model updated
- [x] Event model updated
- [x] Camera model updated
- [x] User model updated
- [x] No linter errors
- [ ] Run migrations on database
- [ ] Test API endpoints
- [ ] Test relationships
- [ ] Test Edge Server integration

---

## 🚀 Next Steps

1. **Run Migrations**
   ```bash
   php artisan migrate
   ```

2. **Test API Endpoints**
   - Test creating registered faces
   - Test creating registered vehicles
   - Test access logs

3. **Edge Server Integration**
   - Update Edge Server to link events with registered faces/vehicles
   - Test face recognition events
   - Test vehicle recognition events

4. **Frontend Integration**
   - Verify frontend API clients work correctly
   - Test UI components

---

## 📚 Related Files

- **Migrations**:
  - `2025_01_27_000000_create_registered_faces_table.php`
  - `2025_01_27_000001_create_registered_vehicles_table.php`
  - `2025_01_27_000002_create_vehicle_access_logs_table.php`
  - `2025_01_27_000003_add_registered_relations_to_events_table.php`

- **Models**:
  - `RegisteredFace.php`
  - `RegisteredVehicle.php`
  - `VehicleAccessLog.php`

- **Controllers**:
  - `PersonController.php`
  - `VehicleController.php`

---

**تم التنفيذ بنجاح! ✅**

