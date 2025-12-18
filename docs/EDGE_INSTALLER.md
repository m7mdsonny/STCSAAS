# إعداد حزمة تثبيت السيرفر المحلي (Edge)

هذا الدليل يوضح كيف تصنع ملف تنفيذي سهل التثبيت يشبه البرامج التجارية (Milestone/HikCentral) مع تحضير الإعدادات الافتراضية وترابط الـAPI مع السحابة.

## المتطلبات
- Python 3.10+ مع `pyinstaller` مثبتة (`pip install pyinstaller`).
- نظام Windows أو Linux لبناء التنفيذية.
- تعديل ملف البيئة `.env` قبل البناء لضبط عنوان الـCloud API والترخيص الافتراضي.

## خطوات البناء (Windows أو Linux)
1. انتقل لمجلد السيرفر المحلي:
   ```bash
   cd apps/edge-server
   pip install -r requirements.txt
   ./scripts/build_installer.sh
   ```
2. ستحصل على:
   - Windows: الملف التنفيذي `dist/edge_server/edge_server.exe`.
   - Linux: حزمة تشغيل داخل `dist/edge_server/` مع سكربت التشغيل.

## التثبيت السريع على جهاز الموقع
1. انسخ مجلد `dist/edge_server` إلى الجهاز المستهدف.
2. أنشئ ملف `.env` بجوار التنفيذية يحتوي على:
   ```env
   CLOUD_API_URL=https://your-cloud.com/api
   LICENSE_KEY=DEMO-LICENSE-KEY
   EDGE_HARDWARE_ID=EDGE-DEMO-HW
   ```
3. شغّل التنفيذية أو سكربت `start.sh` داخل المجلد.
4. افتح المتصفح على `http://localhost:8080/setup` لإدخال الترخيص وتأكيد الاتصال بالسحابة.

## دمج مع السحابة
- يستخدم الـEdge نفس الترخيص والـHardware ID الموجودين في بيانات العرض (`seed_data`).
- يمكن تشغيل المزامنة تلقائيًا بمجرد توفر الإنترنت، ولا يتم إرسال وسائط خام إلى السحابة.

## نصائح جودة وتشغيل
- فعّل خدمة Systemd أو Scheduled Task لتشغيل التنفيذية عند الإقلاع.
- فعّل تسجيل الدخول في `log/` لمراقبة الأخطاء.
- احتفظ بصف المزامنة المحلي لتجربة العمل دون إنترنت لمدة 14 يومًا بعد انتهاء الترخيص.
