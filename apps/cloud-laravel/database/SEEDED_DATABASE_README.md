# Seeded Database - Production Ready

## Overview
This database dump (`stc_cloud_production_seeded.sql`) contains a complete, production-like dataset with all tables, relationships, and comprehensive test data.

## Quick Start

### 1. Import the Database

```bash
# Using psql
psql -U your_username -d your_database_name -f database/stc_cloud_production_seeded.sql

# Or using pg_restore if you have a custom format dump
pg_restore -U your_username -d your_database_name database/stc_cloud_production_seeded.sql
```

### 2. Update .env File

Ensure your `.env` file has the correct database credentials:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=your_database_name
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### 3. Verify Import

```sql
-- Check users
SELECT id, name, email, role, is_super_admin FROM users ORDER BY id;

-- Check organizations
SELECT id, name, subscription_plan, is_active FROM organizations;

-- Check data counts
SELECT 
    (SELECT COUNT(*) FROM users) as users,
    (SELECT COUNT(*) FROM organizations) as organizations,
    (SELECT COUNT(*) FROM cameras) as cameras,
    (SELECT COUNT(*) FROM events) as events,
    (SELECT COUNT(*) FROM registered_faces) as people,
    (SELECT COUNT(*) FROM registered_vehicles) as vehicles;
```

## User Credentials

### Super Admin
- **Email:** `superadmin@stc.local`
- **Password:** `SuperAdmin@123`
- **Access:** Full system access, all features

### Organization Owner (Demo Corp)
- **Email:** `owner@democorp.local`
- **Password:** `Owner@123`
- **Access:** Full organization management

### Organization Admin (Demo Corp)
- **Email:** `admin@democorp.local`
- **Password:** `Admin@123`
- **Access:** Organization administration

### Editor (Demo Corp)
- **Email:** `editor@democorp.local`
- **Password:** `Editor@123`
- **Access:** Content management, limited features

### Viewer (Demo Corp)
- **Email:** `viewer@democorp.local`
- **Password:** `Viewer@123`
- **Access:** Read-only access

### Test Company Admin
- **Email:** `admin@testcompany.local`
- **Password:** `Admin@123`
- **Access:** Organization administration for Test Company

## Sample Data Included

### Organizations
- **Demo Corporation** (Enterprise Plan)
  - 10 cameras
  - 2 edge servers (online)
  - All 9 AI modules enabled
  - Full configuration

- **Test Company** (Professional Plan)
  - 1 camera
  - 1 edge server (offline)
  - 4 AI modules enabled

### Cameras
- 10 cameras for Demo Corp
- 1 camera for Test Company
- Mix of online/offline status
- Various locations and configurations

### Edge Servers
- 2 online servers for Demo Corp
- 1 offline server for Test Company
- System info included

### People (Registered Faces)
- 8 registered people
- Mix of employees, visitors, blacklist, VIP
- Various departments

### Vehicles
- 6 registered vehicles
- Mix of authorized, visitor, blacklist, VIP
- Various types and colors

### Events (Alerts)
- 13 sample events
- Various modules (fire, face, intrusion, vehicle, PPE, weapon, counter)
- Different severities and statuses

### Attendance Records
- 5 attendance records
- Mix of check-in/check-out times
- Late arrivals and early departures

### Automation Rules
- 3 automation rules
- Various triggers and actions

### Other Data
- Subscription plans (Basic, Professional, Enterprise)
- Licenses for both organizations
- Integrations (Arduino, SMS, WhatsApp, Email)
- Notifications
- Vehicle access logs

## Password Reset

If passwords don't work, reset them using Laravel Tinker:

```bash
php artisan tinker
```

```php
// Reset Super Admin password
$user = App\Models\User::where('email', 'superadmin@stc.local')->first();
$user->password = Hash::make('SuperAdmin@123');
$user->save();

// Reset other passwords similarly
$user = App\Models\User::where('email', 'admin@democorp.local')->first();
$user->password = Hash::make('Admin@123');
$user->save();
```

## Testing Checklist

After importing, test these features:

- [ ] Login as Super Admin
- [ ] Login as Organization Owner
- [ ] Login as Organization Admin
- [ ] Login as Editor
- [ ] Login as Viewer
- [ ] View Super Admin Dashboard
- [ ] View Organization Dashboard
- [ ] Manage Organizations
- [ ] Manage Users
- [ ] View Cameras
- [ ] View Alerts/Events
- [ ] View People
- [ ] View Vehicles
- [ ] View Attendance
- [ ] Manage Automation Rules
- [ ] View Analytics
- [ ] Manage AI Modules

## Notes

- All passwords use bcrypt hashing
- All timestamps are relative to import time
- Edge servers show realistic system info
- Events include realistic metadata
- All foreign key relationships are properly maintained

## Troubleshooting

### Passwords Don't Work
1. Check if Laravel is using the correct hashing algorithm
2. Reset passwords using Tinker (see above)
3. Ensure `APP_KEY` is set in `.env`

### Foreign Key Errors
- Ensure all tables are created before inserting data
- Check that sequences are reset after import

### Missing Data
- Verify all INSERT statements executed successfully
- Check for constraint violations in PostgreSQL logs

