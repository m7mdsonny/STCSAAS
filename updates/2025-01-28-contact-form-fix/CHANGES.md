# سجل التغييرات - تحديث نموذج التواصل v1.0.0

## التغييرات الرئيسية

### ✅ إصلاحات
- **إصلاح نموذج التواصل**: تم إصلاح مشكلة عدم حفظ رسائل التواصل من صفحة Landing Page
- الآن يتم حفظ جميع الرسائل في قاعدة البيانات بشكل صحيح

### ➕ إضافات جديدة
1. **جدول contact_inquiries**
   - حفظ رسائل التواصل من صفحة Landing
   - تتبع حالة الرسائل (new, read, replied, archived)
   - إمكانية إضافة ملاحظات إدارية

2. **API Endpoint جديد**
   - `POST /api/v1/public/contact` - حفظ رسائل التواصل
   - لا يحتاج authentication (public endpoint)

3. **تحسينات Frontend**
   - إضافة رسائل نجاح/خطأ واضحة
   - تحسين تجربة المستخدم

## الملفات المعدلة

### Backend
- `app/Http/Controllers/PublicContentController.php` - إضافة method `submitContact()`
- `routes/api.php` - إضافة route جديد

### Frontend
- `web-portal/src/lib/api/settings.ts` - إضافة `submitContactForm()`
- `web-portal/src/pages/Landing.tsx` - تحديث `handleContactSubmit()`

## الملفات المضافة

### Backend
- `app/Models/ContactInquiry.php` - Model جديد
- `database/migrations/2025_01_28_000000_create_contact_inquiries_table.php` - Migration جديد

## Breaking Changes
لا توجد تغييرات كاسرة - هذا تحديث إصلاحي فقط.

## ملاحظات
- جميع الرسائل تُحفظ بحالة `new` افتراضياً
- يمكن إضافة إشعارات بريد إلكتروني لاحقاً
- لا يحتاج إلى إعادة تشغيل السيرفر

