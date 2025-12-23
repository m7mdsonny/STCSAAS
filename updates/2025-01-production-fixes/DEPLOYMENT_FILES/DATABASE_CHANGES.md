# تغييرات قاعدة البيانات - Production Fixes

## 📋 نظرة عامة

هذا الملف يوثق جميع التغييرات في قاعدة البيانات المطلوبة للتحديثات الجديدة.

---

## 🆕 جداول جديدة

### 1. جدول `ai_modules`
```sql
CREATE TABLE ai_modules (
    id BIGSERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    description TEXT,
    description_ar TEXT,
    icon VARCHAR(100),
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    requires_plan_level INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_ai_modules_category ON ai_modules(category);
CREATE INDEX idx_ai_modules_active ON ai_modules(is_active);
```

### 2. جدول `ai_module_configs`
```sql
CREATE TABLE ai_module_configs (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
    module_id BIGINT REFERENCES ai_modules(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT false,
    config JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, module_id)
);

CREATE INDEX idx_ai_module_configs_org ON ai_module_configs(organization_id);
CREATE INDEX idx_ai_module_configs_module ON ai_module_configs(module_id);
```

### 3. جدول `platform_wordings`
```sql
CREATE TABLE platform_wordings (
    id BIGSERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    label VARCHAR(255),
    value_ar TEXT,
    value_en TEXT,
    category VARCHAR(100) DEFAULT 'general',
    context VARCHAR(255),
    description TEXT,
    is_customizable BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_platform_wordings_category ON platform_wordings(category);
CREATE INDEX idx_platform_wordings_key ON platform_wordings(key);
```

### 4. جدول `organization_wordings`
```sql
CREATE TABLE organization_wordings (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
    wording_id BIGINT REFERENCES platform_wordings(id) ON DELETE CASCADE,
    custom_value_ar TEXT,
    custom_value_en TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, wording_id)
);

CREATE INDEX idx_organization_wordings_org ON organization_wordings(organization_id);
CREATE INDEX idx_organization_wordings_wording ON organization_wordings(wording_id);
```

---

## 🔄 تعديلات على الجداول الموجودة

### 1. جدول `updates` - إضافة حقول Versioning

```sql
-- إضافة الحقول الجديدة
ALTER TABLE updates 
ADD COLUMN IF NOT EXISTS version VARCHAR(50),
ADD COLUMN IF NOT EXISTS version_type VARCHAR(20) CHECK (version_type IN ('major', 'minor', 'patch', 'hotfix')),
ADD COLUMN IF NOT EXISTS release_notes TEXT,
ADD COLUMN IF NOT EXISTS changelog TEXT,
ADD COLUMN IF NOT EXISTS affected_modules JSONB,
ADD COLUMN IF NOT EXISTS requires_manual_update BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS download_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS checksum VARCHAR(128),
ADD COLUMN IF NOT EXISTS file_size_mb INTEGER,
ADD COLUMN IF NOT EXISTS release_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS end_of_support_date TIMESTAMP;

-- إضافة فهارس
CREATE INDEX IF NOT EXISTS idx_updates_version ON updates(version);
CREATE INDEX IF NOT EXISTS idx_updates_version_type ON updates(version_type);
CREATE INDEX IF NOT EXISTS idx_updates_release_date ON updates(release_date);
```

---

## 📊 Seed Data

### 1. AI Modules Seeder

```sql
-- إدراج AI Modules الافتراضية
INSERT INTO ai_modules (key, name, name_ar, description, description_ar, icon, category, requires_plan_level) VALUES
('fire_detection', 'Fire Detection', 'كشف الحرائق', 'Detects fire and smoke in video streams', 'يكشف الحرائق والدخان في تدفقات الفيديو', 'flame', 'safety', 1),
('face_recognition', 'Face Recognition', 'التعرف على الوجوه', 'Recognizes and identifies faces', 'يتعرف على الوجوه ويحددها', 'user', 'security', 2),
('vehicle_detection', 'Vehicle Detection', 'كشف المركبات', 'Detects and classifies vehicles', 'يكشف المركبات ويصنفها', 'car', 'traffic', 1),
('crowd_analysis', 'Crowd Analysis', 'تحليل الحشود', 'Analyzes crowd density and flow', 'يحلل كثافة الحشود وتدفقها', 'users', 'analytics', 2),
('intrusion_detection', 'Intrusion Detection', 'كشف التسلل', 'Detects unauthorized access', 'يكشف الوصول غير المصرح به', 'shield', 'security', 2),
('loitering_detection', 'Loitering Detection', 'كشف التكاسل', 'Detects loitering behavior', 'يكشف سلوك التكاسل', 'clock', 'security', 1),
('abandoned_object', 'Abandoned Object', 'الأشياء المتروكة', 'Detects abandoned objects', 'يكشف الأشياء المتروكة', 'package', 'safety', 1),
('people_counting', 'People Counting', 'عد الأشخاص', 'Counts people in areas', 'يعد الأشخاص في المناطق', 'users', 'analytics', 1),
('license_plate', 'License Plate Recognition', 'قراءة لوحات السيارات', 'Reads vehicle license plates', 'يقرأ لوحات أرقام السيارات', 'car', 'traffic', 3);

-- تحديث timestamps
UPDATE ai_modules SET created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP;
```

---

## 🔍 Queries للتحقق

### التحقق من الجداول الجديدة
```sql
-- التحقق من وجود الجداول
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'ai_modules', 
    'ai_module_configs', 
    'platform_wordings', 
    'organization_wordings'
);
```

### التحقق من تعديلات جدول updates
```sql
-- التحقق من الحقول الجديدة
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'updates'
AND column_name IN (
    'version', 
    'version_type', 
    'release_notes', 
    'changelog',
    'affected_modules',
    'requires_manual_update',
    'download_url',
    'checksum',
    'file_size_mb',
    'release_date',
    'end_of_support_date'
);
```

### التحقق من البيانات
```sql
-- عدد AI Modules
SELECT COUNT(*) FROM ai_modules;

-- عدد Platform Wordings
SELECT COUNT(*) FROM platform_wordings;

-- التحقق من updates مع versioning
SELECT id, title, version, version_type, release_date 
FROM updates 
WHERE version IS NOT NULL;
```

---

## 📝 ملاحظات مهمة

### 1. الترتيب
- يجب تشغيل migrations بالترتيب:
  1. `2025_01_02_120000_create_ai_modules_table.php`
  2. `2025_01_02_130000_add_versioning_to_updates_table.php`
  3. `2025_01_02_140000_create_platform_wordings_table.php`

### 2. Foreign Keys
- جميع الجداول الجديدة تستخدم Foreign Keys
- تأكد من وجود الجداول المرجعية (organizations, ai_modules, platform_wordings)

### 3. Indexes
- تم إضافة indexes لتحسين الأداء
- يمكن إضافة indexes إضافية حسب الحاجة

### 4. Constraints
- `version_type` في `updates` له CHECK constraint
- `UNIQUE` constraints على مفاتيح مركبة

### 5. Soft Deletes
- `ai_modules` و `platform_wordings` يدعمان Soft Deletes
- `ai_module_configs` و `organization_wordings` لا يدعمان Soft Deletes

---

## 🔄 Rollback Scripts

### إزالة الجداول الجديدة
```sql
-- حذف الجداول (بالترتيب العكسي)
DROP TABLE IF EXISTS organization_wordings CASCADE;
DROP TABLE IF EXISTS platform_wordings CASCADE;
DROP TABLE IF EXISTS ai_module_configs CASCADE;
DROP TABLE IF EXISTS ai_modules CASCADE;
```

### إزالة تعديلات updates
```sql
-- إزالة الحقول الجديدة من updates
ALTER TABLE updates 
DROP COLUMN IF EXISTS end_of_support_date,
DROP COLUMN IF EXISTS release_date,
DROP COLUMN IF EXISTS file_size_mb,
DROP COLUMN IF EXISTS checksum,
DROP COLUMN IF EXISTS download_url,
DROP COLUMN IF EXISTS requires_manual_update,
DROP COLUMN IF EXISTS affected_modules,
DROP COLUMN IF EXISTS changelog,
DROP COLUMN IF EXISTS release_notes,
DROP COLUMN IF EXISTS version_type,
DROP COLUMN IF EXISTS version;
```

---

## ✅ Checklist قبل التطبيق

- [ ] نسخ احتياطي كامل لقاعدة البيانات
- [ ] التحقق من إصدار PostgreSQL (10+)
- [ ] التحقق من وجود مساحة كافية
- [ ] التحقق من الصلاحيات (CREATE, ALTER, INDEX)
- [ ] اختبار على بيئة staging أولاً
- [ ] التحقق من عدم وجود تعارضات في الأسماء
- [ ] التحقق من Foreign Keys references

---

**آخر تحديث:** 2 يناير 2025  
**الإصدار:** 2.3.0

