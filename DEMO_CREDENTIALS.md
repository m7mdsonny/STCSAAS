# Demo Credentials - STC AI-VAP Platform

## 🔐 Login Credentials

### Super Admin
- **Email:** `superadmin@stc-solutions.com`
- **Password:** `Super@12345`
- **Role:** Super Administrator
- **Access:** Full system access, can manage all organizations, users, plans, and system settings

### Organization Admin
- **Email:** `admin@demo.local`
- **Password:** `Admin@12345`
- **Role:** Organization Administrator
- **Organization:** Demo Corporation (ID: 1)
- **Access:** Full access to organization resources, can manage users, cameras, edge servers

### Security Operator
- **Email:** `operator@demo.local`
- **Password:** `Admin@12345`
- **Role:** Operator
- **Organization:** Demo Corporation (ID: 1)
- **Access:** Can view and manage events, cameras, but limited settings access

### Viewer User
- **Email:** `viewer@demo.local`
- **Password:** `Admin@12345`
- **Role:** Viewer
- **Organization:** Demo Corporation (ID: 1)
- **Access:** Read-only access to dashboards and reports

---

## 🔑 API Authentication (Sanctum)

### Generate API Token

**Via Tinker:**
```bash
php artisan tinker
```

```php
$user = \App\Models\User::where('email', 'superadmin@stc-solutions.com')->first();
$token = $user->createToken('api-token', ['*'])->plainTextToken;
echo $token;
```

**Via API Endpoint:**
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "superadmin@stc-solutions.com",
  "password": "Super@12345"
}
```

Response includes `access_token`:
```json
{
  "access_token": "1|xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "token_type": "Bearer",
  "user": { ... }
}
```

### Using API Token

```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -H "Accept: application/json" \
     https://api.stcsolutions.online/api/v1/organizations
```

---

## 📊 Demo Data Summary

### Organizations
- **Demo Corporation** (ID: 1)
  - Plan: Professional
  - Max Cameras: 16
  - Max Edge Servers: 2

### Edge Servers
- **EDGE-DEMO-MAIN-001** - Main Building Edge Server
- **EDGE-DEMO-GATE-002** - Gate Entrance Edge Server

### Cameras
- **CAM-001** - كاميرا المدخل الرئيسي (Main Entrance)
- **CAM-002** - كاميرا موقف السيارات 1 (Parking Area A)
- **CAM-003** - كاميرا الممر (Corridor - First Floor)
- **CAM-004** - كاميرا البوابة (Main Gate)

### Subscription Plans
1. **Basic** (اساسي) - 4 cameras, 1 edge server, 100 SMS/month
2. **Professional** (احترافي) - 16 cameras, 2 edge servers, 500 SMS/month
3. **Enterprise** (مؤسسي) - 64 cameras, 5 edge servers, 2000 SMS/month

---

## 🗄️ Database Connection

### PostgreSQL Connection String
```
Host: localhost (or your server IP)
Port: 5432
Database: your_database_name
Username: your_db_user
Password: your_db_password
```

### Test Connection
```bash
psql -U your_db_user -d your_database_name -c "SELECT COUNT(*) FROM users;"
```

---

## 🔄 Reset Passwords

If you need to reset passwords, use Laravel Tinker:

```bash
php artisan tinker
```

```php
use Illuminate\Support\Facades\Hash;

// Reset Super Admin password
$user = \App\Models\User::where('email', 'superadmin@stc-solutions.com')->first();
$user->password = Hash::make('NewPassword123!');
$user->save();

// Reset Organization Admin password
$user = \App\Models\User::where('email', 'admin@demo.local')->first();
$user->password = Hash::make('NewPassword123!');
$user->save();
```

---

## 📝 Notes

- All passwords use bcrypt hashing
- Default password for demo users: `Admin@12345` (except Super Admin: `Super@12345`)
- API tokens expire based on Sanctum configuration
- Soft deletes are enabled - deleted records are marked, not removed
- All timestamps are in UTC by default

---

## 🚀 Quick Start

1. **Import Database:**
   ```bash
   psql -U postgres -d your_database < stc_cloud_production_clean.sql
   ```

2. **Or Use Migrations:**
   ```bash
   php artisan migrate:fresh --seed
   ```

3. **Login to Web Portal:**
   - Frontend: https://stcsolutions.online
   - Use Super Admin credentials

4. **Test API:**
   ```bash
   curl https://api.stcsolutions.online/api/v1/public/landing
   ```

---

**Last Updated:** January 2, 2025  
**Version:** 2.0.0

