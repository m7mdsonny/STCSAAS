# بيانات تسجيل الدخول - STC AI-VAP

## 🔐 بيانات السوبر أدمن (Super Admin)

### من ملف قاعدة البيانات (`stc_cloud_mysql.sql`):

**البريد الإلكتروني:**
```
superadmin@stc-solutions.com
```

**كلمة المرور:**
```
password
```

**ملاحظة:** كلمة المرور المشفرة في قاعدة البيانات هي: `$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi`

---

## 👤 بيانات صاحب المؤسسة (Organization Owner)

**البريد الإلكتروني:**
```
owner@demo-org.com
```

**كلمة المرور:**
```
password
```

---

## 📝 بيانات أخرى (من DatabaseSeeder - للتطوير فقط)

### Super Admin (Demo):
- **Email:** `superadmin@demo.local`
- **Password:** `Super@12345`

### Organization Admin (Demo):
- **Email:** `admin@org1.local`
- **Password:** `Admin@12345`

---

## ⚠️ تحذير أمني

**يجب تغيير كلمات المرور الافتراضية فوراً بعد التثبيت على السيرفر الإنتاجي!**

### تغيير كلمة المرور عبر SQL:

```sql
-- تغيير كلمة مرور السوبر أدمن
UPDATE `users` 
SET `password` = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' 
WHERE `email` = 'superadmin@stc-solutions.com';
```

**ملاحظة:** استبدل `$2y$10$...` بكلمة المرور المشفرة الجديدة. يمكنك استخدام Laravel لتوليد كلمة مرور مشفرة:

```bash
php artisan tinker
Hash::make('your-new-password')
```

---

## 🔧 إنشاء كلمة مرور مشفرة جديدة

### عبر Laravel Tinker:

```bash
cd /www/wwwroot/api.stcsolutions.online
php artisan tinker
```

ثم في Tinker:
```php
use Illuminate\Support\Facades\Hash;
Hash::make('YourNewPassword123!');
```

### عبر SQL مباشرة (MySQL):

```sql
-- MySQL لا يدعم Hash::make مباشرة، استخدم Laravel Tinker أو Artisan command
```

### عبر Artisan Command:

```bash
php artisan user:change-password superadmin@stc-solutions.com
```

---

## 📌 ملاحظات

1. **كلمة المرور الافتراضية** `password` هي للاستخدام في بيئة التطوير فقط
2. **يجب تغييرها فوراً** عند النشر على السيرفر الإنتاجي
3. استخدم كلمات مرور قوية تحتوي على:
   - أحرف كبيرة وصغيرة
   - أرقام
   - رموز خاصة
   - طول 12+ حرف على الأقل

---

**آخر تحديث:** 2025-01-15

