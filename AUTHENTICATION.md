# دليل Authentication - STC AI-VAP

## نظرة عامة

جميع التطبيقات تستخدم نفس Cloud API للـ authentication باستخدام Laravel Sanctum.

---

## Cloud API Authentication

### Endpoint
```
POST /api/v1/auth/login
```

### Request
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Response
```json
{
  "token": "1|xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "user": {
    "id": 1,
    "name": "User Name",
    "email": "user@example.com",
    "role": "owner",
    "organization_id": 1
  }
}
```

### استخدام Token
```
Authorization: Bearer {token}
```

---

## الصلاحيات (Roles)

### super_admin
- الوصول الكامل
- إدارة جميع المؤسسات
- إعدادات النظام

### owner
- إدارة المؤسسة
- إدارة المستخدمين
- إدارة الكاميرات
- إدارة السيرفرات

### admin
- إدارة المؤسسة (محدود)
- إدارة المستخدمين
- إدارة الكاميرات

### editor
- تعديل البيانات
- عرض التقارير

### viewer
- عرض فقط
- لا يمكن التعديل

---

## Web Portal

### تسجيل الدخول
```typescript
const { signIn } = useAuth();
await signIn(email, password);
```

### Token Storage
- يتم حفظ Token في localStorage
- يتم إرسال Token تلقائياً في جميع الطلبات

---

## Mobile App

### تسجيل الدخول
```dart
final authService = ref.read(authServiceProvider);
await authService.login(
  email: email,
  password: password,
);
```

### Token Storage
- يتم حفظ Token في Hive/SharedPreferences
- يتم إرسال Token تلقائياً في جميع الطلبات

---

## Edge Server

### Authentication
- يستخدم API Key (ليس user authentication)
- API Key يتم إنشاؤه عند Pairing

### Pairing
```
POST /api/v1/pairing/generate-token
```

---

## Security

### Best Practices
1. ✅ استخدام HTTPS دائماً
2. ✅ Token expiration
3. ✅ Rate limiting
4. ✅ Password hashing (bcrypt)
5. ✅ CORS configuration

---

**آخر تحديث**: 2024-12-20



