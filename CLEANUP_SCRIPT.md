# سكربت تنظيف المشروع

## الملفات التي سيتم حذفها

### 1. ملفات Documentation القديمة في Root
```bash
# Windows PowerShell
Remove-Item AAPANEL_FILES.md
Remove-Item CHANGES_LOG.md
Remove-Item DEPLOYMENT_COMPLETE.md
Remove-Item FINAL_SYSTEM_STATE.md
Remove-Item QUICK_START.md
Remove-Item DOWNLOAD.md
Remove-Item COMPLETE_PROJECT_REVIEW_PLAN.md
Remove-Item COMPLETE_PROJECT_STATUS.md
Remove-Item PROJECT_COMPLETE_REVIEW.md
```

### 2. مجلدات updates القديمة
```bash
Remove-Item -Recurse -Force updates/
Remove-Item -Recurse -Force update/
Remove-Item -Recurse -Force update-phase-05-feature-completion/
Remove-Item -Recurse -Force update-phase-06-final/
```

### 3. Edge Server Old Docs
```bash
cd apps/edge-server
Remove-Item EDGE_SERVER_COMPLETE_GUIDE.md
Remove-Item EDGE_SERVER_IMPLEMENTATION.md
Remove-Item FINAL_STATUS.md
Remove-Item IMPLEMENTATION_COMPLETE.md
Remove-Item IMPLEMENTATION_STATUS.md
Remove-Item BUILD_COMPLETE.md
Remove-Item AI_MODELS_INTEGRATION.md
```

### 4. Mobile App Old Docs
```bash
cd apps/mobile-app
Remove-Item FEATURES.md
Remove-Item SETUP_GUIDE.md
Remove-Item START_HERE.md
```

### 5. استبدال README.md
```bash
# نسخ README_NEW.md إلى README.md
Copy-Item README_NEW.md README.md -Force
```

---

## ⚠️ تحذير

قبل الحذف:
1. تأكد من أن جميع المعلومات موجودة في الدوكومنتات الجديدة
2. قم بعمل backup
3. راجع `FILES_TO_DELETE.md` للتأكد

---

## ✅ بعد التنظيف

المجلدات المتبقية:
- `apps/` - جميع التطبيقات
- `docs/` - (يمكن تنظيفه لاحقاً)
- `scripts/` - سكربتات البناء
- ملفات Documentation الجديدة في Root



