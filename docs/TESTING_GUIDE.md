# دليل الاختبار الشامل - STC AI-VAP Platform

## نظرة عامة
هذا الدليل يشرح كيفية اختبار مكونات المنصة (Cloud/Edge/Web/Mobile) بعد الانتقال إلى حزمة Laravel SaaS للواجهات والـAPI واعتماد قواعد بياناتك الخاصة بدون Supabase.

---
## 1. اختبار قاعدة بيانات الكلاود (PostgreSQL/SQLite)
- تأكد من الاتصال باستخدام `CLOUD_DATABASE_URL`.
- تحقق من إنشاء الجداول الأساسية بعد تشغيل الخادم:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```
- تحقق من العلاقات الأساسية (FK):
```sql
SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table, ccu.column_name AS foreign_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

---
## 2. اختبار تطبيق الويب (Laravel)
### التشغيل المحلي
```bash
cd apps/cloud-laravel
npm install && npm run build
php artisan serve --host 0.0.0.0 --port 8000
```
### قائمة فحص الصفحات
| الصفحة | الوظيفة | حالة الاختبار |
|--------|---------|---------------|
| `/` | صفحة الهبوط | [ ] |
| `/login` | تسجيل الدخول | [ ] |
| `/dashboard` | لوحة التحكم | [ ] |
| `/cameras` | إدارة الكاميرات | [ ] |
| `/alerts` | التنبيهات | [ ] |
| `/analytics` | التحليلات | [ ] |
| `/people` | الأشخاص المسجلين | [ ] |
| `/vehicles` | المركبات المسجلة | [ ] |
| `/attendance` | الحضور والانصراف | [ ] |
| `/settings` | الإعدادات | [ ] |

### اختبار تسجيل الدخول
- بيانات صحيحة → نجاح وتوجيه للوحة التحكم.
- بيانات خاطئة → رسالة خطأ واضحة.
- حقول فارغة → رسائل تحقق مطلوبة.

### اختبار الاستجابة (Responsive)
- Desktop: 1920x1080, 1366x768
- Tablet: 768x1024, 1024x768
- Mobile: 375x667, 414x896

---
## 3. اختبار تطبيق Flutter
### إعداد البيئة
```bash
cd apps/mobile-app
flutter pub get
flutter analyze
flutter run
```
### قائمة فحص الوظائف
| الوظيفة | الوصف | حالة الاختبار |
|---------|-------|---------------|
| تسجيل الدخول | مصادقة عبر Cloud API | [ ] |
| تسجيل الخروج | مسح البيانات المحلية | [ ] |
| عرض الكاميرات | استهلاك `/api/config/cameras` | [ ] |
| عرض التنبيهات | استهلاك `/api/events/alerts` | [ ] |
| الإشعارات | Push/Local notifications | [ ] |
| تغيير الثيم | فاتح/داكن | [ ] |
| اللغة العربية | RTL support | [ ] |

---
## 4. اختبار Edge Server (Python)
### إعداد البيئة
```bash
cd apps/edge-server
python -m venv venv
source venv/bin/activate  # Linux/Mac
# أو
.\\venv\\Scripts\\activate  # Windows
pip install -r requirements.txt
cp .env.example .env
```

### تشغيل الخادم
```bash
uvicorn main:app --host 0.0.0.0 --port 8080 --reload
```

### اختبار API Endpoints
```bash
curl http://localhost:8080/health
curl http://localhost:8080/api/v1/cameras
curl http://localhost:8080/api/v1/modules
```

### اختبار المزامنة مع الكلاود
1. أدخل إعدادات `CLOUD_API_URL` و`LICENSE_KEY` وشغّل `/setup`.
2. أرسل حدث تنبيه محليًا (أو استخدم سيناريو AI حقيقي).
3. انتظر دورة المزامنة وتحقق من وصول الميتاداتا في قاعدة بيانات الكلاود.

---
## 5. اختبار الكلاود (Laravel)
### تشغيل تجريبي
```bash
cd apps/cloud-laravel
cp .env.example .env  # تأكد من DB_* و MAIL/FCM
composer install --no-dev --optimize-autoloader
npm install && npm run build
php artisan key:generate
psql -U <user> -d <db> -f database/schema.sql  # بيانات تجريبية
php artisan serve --host 0.0.0.0 --port 8000
```
### نقاط تحقق سريعة
- `/api/auth/login` يعيد توكن Sanctum.
- `/api/license/validate` يعيد حالة الترخيص وفترة السماح.
- `/api/edges/register` يسجل Edge جديد.
- `/api/edges/{hardware_id}/commands` يعيد الأوامر المعلّقة.
- `/api/edges/events` يقبل ميتاداتا التنبيهات/الحضور دون صور.

---
## 6. فحص سلامة الملفات بعد أي حذف أو إعادة هيكلة
استخدم هذه القائمة السريعة للتأكد من أن جميع المجلدات والملفات الأساسية موجودة بعد أي حذف أو دمج:

- **البيئات النموذجية**: `apps/cloud-laravel/.env.example` و`apps/edge-server/.env.example` يجب أن تكونا موجودتين ومحدّثتين.
- **نقاط الدخول**: `public/index.php` في Laravel يعمل مع PHP-FPM أو `php artisan serve`، و`apps/edge-server/main.py` يعمل مع uvicorn.
- **المخططات**: ملف `apps/cloud-laravel/database/schema.sql` يجب أن يغطي الجداول الأساسية (users، distributors، organizations، licenses، edge_servers، events، notifications).
- **الخدمات الأساسية للـEdge**: وحدات المزامنة والترخيص في `apps/edge-server/app/services/sync.py` و`apps/edge-server/app/core/license.py` يجب أن تبقى موجودة لضمان العمل أوفلاين وفترة السماح.
- **التوثيق**: أدلة `docs/CLOUD_EDGE_INSTALLATION.md`, `docs/CLOUD_INTEGRATION_GUIDE.md`, و`docs/PACKAGE_LAYOUT.md` ينبغي أن تعكس البنية الحالية تحت `apps/`.

### اختبار سريع لسلامة الاستيراد
بعد أي عملية تنظيف أو إزالة ملفات، شغّل الاختبار التالي للتأكد من أن جميع الوحدات قابلة للاستيراد:
```bash
python -m compileall apps/edge-server
```
يجب أن ينتهي الأمر بدون أخطاء. أي ملف مفقود أو import خاطئ في خدمة الـEdge سيظهر هنا فورًا.

---

## 7. اختبار التكامل الشامل
### سيناريو 1: دورة تنبيه كاملة
1. Edge يكتشف حدث (مثلاً حريق) ويخزّنه محليًا.
2. خدمة المزامنة ترسل الميتاداتا إلى `POST /api/events/alerts`.
3. Web/Mobile تعرض التنبيه من Cloud API.
4. يُرسل أمر تحكم (مثلاً فتح بوابة) من السحابة ويُنَفّذ على الـEdge.

### سيناريو 2: تحديث بروفايل وجه/مركبة
1. إنشاء بروفايل جديد عبر Cloud API (`/api/config/faces|vehicles`).
2. Edge يجلب التحديث في دورة المزامنة التالية.
3. التعرّف يتم محليًا وتُرسل الميتاداتا للسحابة.

---
## 8. اختبار الأمان
- تحقق من أن Cloud API خلف HTTPS/Nginx وأن المفاتيح محفوظة في `.env`.
- أضف/اختبر Middleware للمصادقة (مثلاً التحقق من `CLOUD_API_KEY`) عند الحاجة.
- اختبر CORS للواجهات الأمامية:
```bash
curl -I -H "Origin: http://example.com" http://localhost:8000/api/licensing/validate
```

---
## 9. اختبار الأداء
### Laravel Web/App
- استخدم `php artisan optimize` ثم `npm run build` داخل `apps/cloud-laravel`، ويمكن تشغيل Lighthouse على النطاق الإنتاجي بعد نشر Nginx/PHP-FPM.
### Edge Server
- استخدم Locust أو k6 لاستهداف `/api/v1/cameras` و `/api/v1/modules`.
- اختبر أداء معالجة الفيديو بملف قصير مع حساب FPS الفعلي.

---
## 10. قائمة الفحص النهائية
- [ ] جميع الاختبارات تمر بنجاح
- [ ] متغيرات البيئة محدّثة (Cloud/Edge/Web/Mobile)
- [ ] SSL/HTTPS مفعل للكلاود
- [ ] النسخ الاحتياطي مُعد لقاعدة بيانات الكلاود
- [ ] مراقبة/تنبيهات مُفعّلة
- [ ] التوثيق محدث

### متغيرات البيئة الأساسية
**Laravel (.env):**
```
DB_CONNECTION=pgsql
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=stc_cloud
DB_USERNAME=stc_user
DB_PASSWORD=stc_pass
FCM_SERVER_KEY=your_firebase_server_key
```
**Edge Server (.env):**
```
CLOUD_API_URL=https://cloud.example.com
CLOUD_API_KEY=
LICENSE_KEY=XXXX-XXXX-XXXX-XXXX
```
**Mobile App (lib/config.dart أو env مكافئ):**
```
const apiBaseUrl = 'https://cloud.example.com/api';
const fcmSenderId = '<firebase-sender-id>';
```
