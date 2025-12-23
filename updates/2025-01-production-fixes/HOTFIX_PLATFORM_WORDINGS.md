# Hotfix: PlatformWordings Import Error

## 🐛 المشكلة
بعد التحديث الأخير، كان الموقع يعرض صفحة فارغة مع الخطأ التالي:
```
ReferenceError: PlatformWordings is not defined
```

## 🔍 السبب
في ملف `apps/web-portal/src/App.tsx`، تم استخدام `<PlatformWordings />` في السطر 159 لكن لم يتم استيراد المكون من ملفه.

## ✅ الحل
تم إضافة import statement في أعلى ملف `App.tsx`:

```typescript
import { PlatformWordings } from './pages/admin/PlatformWordings';
```

## 📝 الملف المعدل
- `apps/web-portal/src/App.tsx` - أضيف import لـ PlatformWordings

## 🚀 خطوات التطبيق على السيرفر

### Frontend:
1. رفع الملف المعدل:
   ```bash
   # رفع apps/web-portal/src/App.tsx
   ```

2. إعادة بناء المشروع:
   ```bash
   cd apps/web-portal
   npm install
   npm run build
   ```

3. رفع الملفات المبنية:
   ```bash
   cp -r dist/* /www/wwwroot/stcsolutions.online/
   ```

## ✅ التحقق
بعد التحديث، يجب أن:
- الموقع يعمل بشكل طبيعي
- صفحة "نصوص المنصة" تفتح بدون أخطاء
- لا توجد أخطاء في console المتصفح

---

**التاريخ:** 2 يناير 2025  
**الإصدار:** 2.3.1 (Hotfix)

