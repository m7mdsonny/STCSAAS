# تغييرات Routes - API

## 📋 Routes الجديدة المضافة

يجب إضافة هذه Routes إلى `apps/cloud-laravel/routes/api.php` داخل `Route::middleware(['auth:sanctum'])->group(function () {`

### AI Modules Routes
```php
// AI Modules (Super Admin can manage, Organization users can view configs)
Route::get('/ai-modules', [AiModuleController::class, 'index']);
Route::get('/ai-modules/{aiModule}', [AiModuleController::class, 'show']);
Route::put('/ai-modules/{aiModule}', [AiModuleController::class, 'update']);

// Organization AI Module Configurations
Route::get('/ai-modules/configs', [AiModuleController::class, 'getConfigs']);
Route::get('/ai-modules/configs/{moduleId}', [AiModuleController::class, 'getConfig']);
Route::put('/ai-modules/configs/{moduleId}', [AiModuleController::class, 'updateConfig']);
Route::post('/ai-modules/configs/{moduleId}/enable', [AiModuleController::class, 'enableModule']);
Route::post('/ai-modules/configs/{moduleId}/disable', [AiModuleController::class, 'disableModule']);
```

### Platform Wordings Routes
```php
// Platform Wordings (Super Admin manages, Organizations can customize)
Route::get('/wordings', [PlatformWordingController::class, 'index']);
Route::get('/wordings/{wording}', [PlatformWordingController::class, 'show']);
Route::post('/wordings', [PlatformWordingController::class, 'store']);
Route::put('/wordings/{wording}', [PlatformWordingController::class, 'update']);
Route::delete('/wordings/{wording}', [PlatformWordingController::class, 'destroy']);

// Organization-specific wordings
Route::get('/wordings/organization', [PlatformWordingController::class, 'getForOrganization']);
Route::post('/wordings/{wording}/customize', [PlatformWordingController::class, 'customizeForOrganization']);
Route::delete('/wordings/{wording}/customize', [PlatformWordingController::class, 'removeCustomization']);
```

### Integration Test Route (معدل)
```php
// في IntegrationController - موجود بالفعل
Route::post('/integrations/{integration}/test', [IntegrationController::class, 'testConnection']);
```

---

## 📝 Imports المطلوبة

أضف هذه الـ imports في أعلى ملف `api.php`:

```php
use App\Http\Controllers\AiModuleController;
use App\Http\Controllers\PlatformWordingController;
```

---

## ✅ التحقق

بعد إضافة الـ routes، تحقق من:

```bash
php artisan route:list | grep -E "ai-modules|wordings"
```

يجب أن ترى جميع الـ routes الجديدة.

