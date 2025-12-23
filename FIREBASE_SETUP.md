# دليل إعداد Firebase - STC AI-VAP

## نظرة عامة

Firebase يستخدم للإشعارات في Mobile App. Web Portal يمكن استخدام Browser Notification API.

---

## Mobile App Setup

### 1. إنشاء مشروع Firebase
1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. أنشئ مشروع جديد
3. أضف Android App
4. أضف iOS App

### 2. Android Setup
1. انسخ `google-services.json`
2. ضعه في `android/app/`
3. أضف في `android/build.gradle`:
```gradle
dependencies {
    classpath 'com.google.gms:google-services:4.4.0'
}
```

### 3. iOS Setup
1. انسخ `GoogleService-Info.plist`
2. ضعه في `ios/Runner/`
3. أضف في `ios/Podfile`:
```ruby
pod 'Firebase/Messaging'
```

### 4. Flutter Setup
```dart
// في main.dart
await Firebase.initializeApp();
```

---

## Cloud API Setup

### 1. الحصول على FCM Server Key
1. Firebase Console → Project Settings → Cloud Messaging
2. انسخ Server Key

### 2. إضافة في SystemSettings
```php
'fcm_settings' => [
    'server_key' => 'your_server_key',
    'project_id' => 'your_project_id',
]
```

### 3. Test FCM
```
POST /api/v1/super-admin/test-fcm
{
  "test_token": "device_token"
}
```

---

## Web Portal (Browser Notifications)

### 1. Request Permission
```typescript
const permission = await Notification.requestPermission();
```

### 2. Show Notification
```typescript
new Notification('Title', {
  body: 'Message',
  icon: '/icon.png'
});
```

---

## Device Token Registration

### Mobile App
```dart
final token = await FirebaseMessaging.instance.getToken();
await notificationRegistrationService.registerDeviceToken(
  deviceToken: token,
);
```

### Cloud API
```
POST /api/v1/notifications/register-device
{
  "device_token": "token",
  "platform": "android"
}
```

---

**آخر تحديث**: 2024-12-20



