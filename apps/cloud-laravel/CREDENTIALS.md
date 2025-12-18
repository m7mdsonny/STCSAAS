# STC AI-VAP Platform - Login Credentials

## Default User Accounts

This document contains all default login credentials for the STC AI-VAP Platform demo environment.

---

## 🔐 Super Admin Account

**Full platform access with global administrative privileges**

- **Email:** `superadmin@demo.local`
- **Password:** `Super@12345`
- **Role:** Super Admin
- **Access Level:** Full system access
- **Permissions:**
  - Manage all organizations
  - Configure platform settings
  - Manage users across all tenants
  - Access all AI modules
  - View system-wide analytics
  - Configure platform branding

---

## 👤 Organization Admin Account

**Organization-level administrative access for Demo Corporation**

- **Email:** `admin@org1.local`
- **Password:** `Admin@12345`
- **Role:** Organization Admin
- **Organization:** Demo Corporation
- **Access Level:** Full organization access
- **Permissions:**
  - Manage organization users
  - Configure AI modules
  - Access all cameras
  - View organization analytics
  - Manage integrations
  - Configure alerts and notifications

---

## 🔧 Operator Account

**Day-to-day operations and monitoring**

- **Email:** `operator@org1.local`
- **Password:** `Admin@12345`
- **Role:** Operator
- **Organization:** Demo Corporation
- **Access Level:** Operational access
- **Permissions:**
  - View live camera feeds
  - Acknowledge alerts
  - View events and notifications
  - Access basic analytics

---

## 👁️ Viewer Account

**Read-only access for monitoring**

- **Email:** `viewer@org1.local`
- **Password:** `Admin@12345`
- **Role:** Viewer
- **Organization:** Demo Corporation
- **Access Level:** Read-only access
- **Permissions:**
  - View live camera feeds
  - View events (read-only)
  - View basic analytics

---

## 🔑 Other Demo Data

### Demo Organization
- **Name:** Demo Corporation
- **Slug:** demo-corp
- **License Key:** `DEMO-CORP-2024-FULL-ACCESS`
- **License Expiry:** 1 year from installation
- **Max Cameras:** 50
- **Max Edge Servers:** 5

### Edge Servers
1. **Main Building Edge Server**
   - Edge ID: `EDGE-DEMO-MAIN-001`
   - IP: `192.168.1.100`
   - Location: Building A - Server Room

2. **Gate Entrance Edge Server**
   - Edge ID: `EDGE-DEMO-GATE-002`
   - IP: `192.168.1.101`
   - Location: Main Gate

### Sample Cameras
- 10 cameras pre-configured
- Camera IDs: CAM-001 through CAM-010
- RTSP URLs: rtsp://192.168.1.201-210:554/stream

---

## 📊 Pre-loaded Test Data

The database includes:
- ✅ 9 AI Modules (all enabled for Demo Corporation)
- ✅ 100+ sample events (fire detection, intrusion, face recognition, etc.)
- ✅ 50+ notifications
- ✅ 2 Edge servers with full system info
- ✅ 10 Cameras across different locations
- ✅ 4 Integration examples (Arduino, SMS, WhatsApp, Email)
- ✅ 3 Subscription plans

---

## 🚀 First Login Steps

### 1. Access the Platform
Navigate to: `http://your-server-ip/login`

### 2. Login as Super Admin
```
Email: superadmin@demo.local
Password: Super@12345
```

### 3. Verify Data
After logging in, check:
- Dashboard shows statistics
- AI Modules are visible
- Events are displayed
- Edge servers show "online" status

### 4. Test Organization Admin
Logout and login with:
```
Email: admin@org1.local
Password: Admin@12345
```

---

## 🔒 Security Notes

### For Production Deployment:

1. **IMMEDIATELY change all default passwords**
2. **Delete or disable demo accounts** after creating your own
3. **Update the license key** with your production license
4. **Configure proper email/SMS settings** for notifications
5. **Enable 2FA** for admin accounts
6. **Review and update** all integration configurations

### Recommended Password Policy:
- Minimum 12 characters
- Include uppercase, lowercase, numbers, and symbols
- Change every 90 days
- No password reuse

---

## 📝 Database Import

### Import the clean database:

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE stc_cloud;

# Import the dump
psql -U postgres -d stc_cloud -f /path/to/stc_cloud_clean.sql

# Verify import
psql -U postgres -d stc_cloud -c "SELECT email, role FROM users;"
```

### Expected Output:
```
           email           |     role
---------------------------+--------------
 superadmin@demo.local     | super_admin
 admin@org1.local          | admin
 operator@org1.local       | operator
 viewer@org1.local         | viewer
```

---

## 🐛 Troubleshooting

### Cannot Login?

1. **Verify database connection**
   ```bash
   php artisan tinker
   >>> \App\Models\User::where('email', 'superadmin@demo.local')->first();
   ```

2. **Check if user exists**
   ```sql
   SELECT * FROM users WHERE email = 'superadmin@demo.local';
   ```

3. **Clear Laravel cache**
   ```bash
   php artisan cache:clear
   php artisan config:clear
   php artisan route:clear
   ```

4. **Regenerate password hash** (if needed)
   ```php
   php artisan tinker
   >>> $user = \App\Models\User::where('email', 'superadmin@demo.local')->first();
   >>> $user->password = bcrypt('Super@12345');
   >>> $user->save();
   ```

### Session Issues?

1. **Check session configuration** in `.env`:
   ```
   SESSION_DRIVER=database
   SESSION_LIFETIME=120
   ```

2. **Run migrations** to create sessions table:
   ```bash
   php artisan session:table
   php artisan migrate
   ```

---

## 📞 Support

For assistance with credentials or login issues:
- **Email:** support@stc-solutions.com
- **Phone:** +966 11 000 0000
- **Documentation:** See README.md and other docs in `/docs/` folder

---

## ⚠️ Important Notes

1. These credentials are for **DEMO/TESTING purposes only**
2. **NEVER use these credentials in production**
3. The database includes **realistic test data** to demonstrate all features
4. All timestamps are relative to the import time
5. Edge servers will show as "offline" until actual edge servers connect

---

**Last Updated:** 2024-12-17
**Database Version:** 1.0.0
**Compatible with:** Laravel 11.x, PHP 8.2+, PostgreSQL 14+
