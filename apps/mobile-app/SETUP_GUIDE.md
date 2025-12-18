# دليل الإعداد والتشغيل - تطبيق STC AI-VAP

## ما تم إنجازه ✅

### 1. الهيكل الأساسي
- ✅ تحديث `pubspec.yaml` بجميع المكتبات المطلوبة
- ✅ إنشاء هيكل المشروع الكامل (core, data, features, shared, routes)
- ✅ إعداد الثيم الفاتح والداكن مع خط Alexandria
- ✅ دعم RTL كامل للغة العربية

### 2. Models و Services
- ✅ UserModel - نموذج المستخدم
- ✅ CameraModel - نموذج الكاميرا
- ✅ AlertModel - نموذج التنبيهات (مع AlertLevel و AlertStatus)
- ✅ ServerModel - نموذج السيرفرات
- ✅ ApiService - خدمة الاتصال بـ API
- ✅ StorageService - خدمة التخزين المحلي (Hive + SharedPreferences)
- ✅ AuthService - خدمة المصادقة
- ✅ NotificationService - خدمة الإشعارات (Firebase + Local Notifications)

### 3. Repositories و Providers
- ✅ CameraRepository
- ✅ AlertRepository
- ✅ ServerRepository
- ✅ Riverpod Providers (API, Auth, Storage, Notifications)
- ✅ ThemeModeProvider - للتبديل بين الوضع الفاتح والداكن

### 4. Shared Widgets
- ✅ AppLoading - مؤشر التحميل
- ✅ ShimmerLoading - تأثير Shimmer
- ✅ AppEmptyState - حالة فارغة
- ✅ AppError - معالجة الأخطاء
- ✅ AppErrorSnackBar و AppSuccessSnackBar

### 5. الشاشات
- ✅ SplashScreen - شاشة البداية مع فحص Token
- ✅ LoginScreen - شاشة تسجيل الدخول مع Validation
- ✅ HomeScreen - الشاشة الرئيسية مع إحصائيات وقوائم
- ✅ Routes - نظام التوجيه مع go_router
- ✅ main.dart - الملف الرئيسي مع التكوينات

### 6. Assets والتوثيق
- ✅ مجلدات Assets (sounds, images, lottie, logo, icons)
- ✅ ملفات README لكل مجلد توضح ما يجب إضافته
- ✅ .gitignore
- ✅ README.md شامل

## ما يجب القيام به 📝

### 1. إضافة الملفات الفعلية
#### أصوات الإشعارات (في `assets/sounds/`)
- `alert_critical.mp3` - صوت للتنبيهات الحرجة
- `alert_high.mp3` - صوت للتنبيهات العالية
- `alert_medium.mp3` - صوت للتنبيهات المتوسطة
- `alert_low.mp3` - صوت للتنبيهات المنخفضة

#### الشعارات (في `assets/logo/`)
- `app_icon.png` (1024x1024)
- `app_icon_foreground.png` (1024x1024)
- `splash_logo.png` (512x512)

#### أنيميشن Lottie (في `assets/lottie/`)
- `splash_animation.json`
- `loading.json`
- `empty_state.json`
- `error.json`
- `success.json`

### 2. إعداد Firebase
1. إنشاء مشروع Firebase
2. تحميل `google-services.json` ووضعه في `android/app/`
3. تحميل `GoogleService-Info.plist` ووضعه في `ios/Runner/`
4. تفعيل Firebase Cloud Messaging
5. إضافة SHA-1 fingerprint لـ Android

### 3. تكوين API URL
أنشئ ملف `.env` في المجلد الرئيسي:
```env
API_URL=http://your-api-url.com
```

أو عدل في `lib/data/providers/app_providers.dart`:
```dart
const baseUrl = String.fromEnvironment('API_URL', defaultValue: 'YOUR_API_URL');
```

### 4. تثبيت المكتبات
```bash
cd flutter_app
flutter pub get
```

### 5. تشغيل التطبيق
```bash
flutter run
```

### 6. الشاشات المتبقية (اختياري - للتطوير الكامل)

#### شاشات الكاميرات
- `CamerasListScreen` - قائمة الكاميرات مع حالة الاتصال
- `CameraDetailScreen` - تفاصيل الكاميرا
- `LiveViewScreen` - البث المباشر مع HLS (باستخدام better_player)

#### شاشات التنبيهات
- `AlertsListScreen` - قائمة التنبيهات مع Filters
- `AlertDetailScreen` - تفاصيل التنبيه مع الصورة والفيديو

#### شاشات أخرى
- `AnalyticsScreen` - الإحصائيات والرسوم البيانية (fl_chart)
- `ServersScreen` - حالة السيرفرات المحلية
- `SettingsScreen` - الإعدادات والملف الشخصي

## الألوان والثيمات

### الوضع الفاتح (Default)
```dart
Primary: #2563EB (Blue)
Background: #F8FAFC (Light Gray)
Card: #FFFFFF (White)
```

### الوضع الداكن
```dart
Primary: #141450 (Navy)
Secondary: #DCA000 (Gold)
Background: #0A0A2E (Dark Navy)
Card: #1E1E6E (Dark Purple)
```

## الميزات الإضافية

### مستويات الإشعارات
- **Critical**: صوت قوي + اهتزاز قوي
- **High**: صوت عادي
- **Medium**: صوت خفيف
- **Low**: صامت

### التخزين المحلي
- Token المصادقة
- بيانات المستخدم
- إعدادات الثيم
- إعدادات الإشعارات

### الأمان
- تخزين آمن للـ Token
- فحص الجلسة عند بدء التطبيق
- معالجة انتهاء الجلسة

## APIs المتوقعة

```
POST /api/auth/login → {token, user}
GET  /api/auth/me → user
GET  /api/cameras → cameras[]
GET  /api/cameras/:id/stream → {hlsUrl, qualities}
GET  /api/alerts → alerts[]
GET  /api/alerts/:id → alert
POST /api/alerts/:id/ack → acknowledge
GET  /api/analytics → stats
GET  /api/servers → servers[]
```

## نصائح مهمة

1. **تشغيل على جهاز حقيقي**: للتأكد من عمل الإشعارات والكاميرا
2. **Firebase**: تأكد من إعداد Firebase بشكل صحيح
3. **Permissions**: أضف permissions للكاميرا والإشعارات في AndroidManifest.xml و Info.plist
4. **API**: تأكد من تشغيل API قبل تشغيل التطبيق

## المشاكل الشائعة وحلولها

### المشكلة: Firebase لا يعمل
**الحل**: تأكد من:
- إضافة ملفات التكوين الصحيحة
- تفعيل FCM في Firebase Console
- إضافة SHA-1 fingerprint

### المشكلة: الخطوط لا تظهر
**الحل**:
- تأكد من اتصال الإنترنت (Alexandria من Google Fonts)
- أو حمّل الخط محلياً في assets/fonts/

### المشكلة: الإشعارات لا تعمل
**الحل**:
- تأكد من Firebase setup
- أضف permissions في AndroidManifest.xml
- اختبر على جهاز حقيقي

## الدعم والتواصل

- الموقع: www.stcsolutions.net
- الهاتف: 01016154999

---
© 2024 STC Solutions. جميع الحقوق محفوظة.
