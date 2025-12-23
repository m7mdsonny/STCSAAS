# ملفات التحديثات - Production Fixes

## 📁 هيكل الملفات

هذا المجلد يحتوي على جميع الملفات الجديدة والمعدلة مرتبة في فولدراتها الأصلية لتسهيل عملية التحديث على السيرفر.

---

## 📂 Backend (Laravel)

### Migrations (قاعدة البيانات)
```
apps/cloud-laravel/database/migrations/
├── 2025_01_02_120000_create_ai_modules_table.php
├── 2025_01_02_130000_add_versioning_to_updates_table.php
└── 2025_01_02_140000_create_platform_wordings_table.php
```

### Models
```
apps/cloud-laravel/app/Models/
├── AiModule.php (جديد)
├── AiModuleConfig.php (جديد)
├── PlatformWording.php (جديد)
├── OrganizationWording.php (جديد)
└── UpdateAnnouncement.php (معدل)
```

### Controllers
```
apps/cloud-laravel/app/Http/Controllers/
├── AiModuleController.php (جديد)
├── PlatformWordingController.php (جديد)
├── IntegrationController.php (معدل)
└── UpdateAnnouncementController.php (معدل)
```

### Seeders
```
apps/cloud-laravel/database/seeders/
└── AiModuleSeeder.php (جديد)
```

### Routes
```
apps/cloud-laravel/routes/
└── api.php (معدل - أضف routes جديدة)
```

---

## 📂 Frontend (React)

### Pages
```
apps/web-portal/src/pages/
├── OwnerGuide.tsx (جديد)
└── admin/
    ├── AdminUpdates.tsx (معدل)
    ├── AdminIntegrations.tsx (معدل)
    ├── PlatformWordings.tsx (جديد)
    └── SuperAdminSettings.tsx (معدل)
```

### Components
```
apps/web-portal/src/components/layout/
└── Sidebar.tsx (معدل)
```

### Utils
```
apps/web-portal/src/lib/
└── translations.ts (جديد)
```

### Types
```
apps/web-portal/src/types/
└── database.ts (معدل)
```

### Routes
```
apps/web-portal/src/
└── App.tsx (معدل)
```

---

## 📋 ملاحظات مهمة

1. **Migrations:** يجب تشغيلها بالترتيب (الأقدم أولاً)
2. **Seeders:** تشغيل `AiModuleSeeder` بعد migrations
3. **Routes:** التحقق من عدم وجود تعارضات في `api.php`
4. **Frontend:** بناء المشروع بعد التحديثات

---

## 🚀 خطوات الرفع

راجع ملف `DEPLOYMENT_INSTRUCTIONS.md` للتعليمات التفصيلية.

