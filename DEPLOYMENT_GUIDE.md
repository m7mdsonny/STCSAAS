# STC AI-VAP Platform - Deployment & Testing Guide

## 📋 Overview

This guide provides complete instructions for setting up, importing the seeded database, and testing the platform with real credentials.

## 🗄️ Database Setup

### Step 1: Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE stc_cloud;

# Exit psql
\q
```

### Step 2: Import Seeded Database

```bash
# Navigate to project root
cd apps/cloud-laravel

# Import the database
psql -U postgres -d stc_cloud -f database/stc_cloud_production_seeded.sql
```

**Alternative using pg_restore:**
```bash
pg_restore -U postgres -d stc_cloud database/stc_cloud_production_seeded.sql
```

### Step 3: Verify Import

```sql
-- Connect to database
psql -U postgres -d stc_cloud

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

## ⚙️ Environment Configuration

### Backend (.env)

Update `apps/cloud-laravel/.env`:

```env
APP_NAME="STC AI-VAP"
APP_ENV=local
APP_KEY=base64:YOUR_APP_KEY_HERE
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=stc_cloud
DB_USERNAME=postgres
DB_PASSWORD=your_password

SANCTUM_STATEFUL_DOMAINS=localhost:5173,localhost:3000
SESSION_DRIVER=database
SESSION_LIFETIME=120

# Mail Configuration (for testing)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="noreply@stc.local"
MAIL_FROM_NAME="${APP_NAME}"
```

**Generate APP_KEY:**
```bash
cd apps/cloud-laravel
php artisan key:generate
```

### Frontend (.env)

Update `apps/web-portal/.env`:

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_APP_NAME=STC AI-VAP
```

## 🚀 Running the Application

### Backend (Laravel)

```bash
cd apps/cloud-laravel

# Install dependencies
composer install

# Run migrations (if needed)
php artisan migrate

# Start server
php artisan serve
```

Backend will be available at: `http://localhost:8000`

### Frontend (React)

```bash
cd apps/web-portal

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

## 👤 User Credentials

### Super Admin
- **Email:** `superadmin@stc.local`
- **Password:** `SuperAdmin@123`
- **Access:** Full system administration

**Features Available:**
- All Super Admin pages
- System settings
- Platform branding
- User management
- Organization management
- License management
- Edge server monitoring
- Analytics & reports

### Organization Owner (Demo Corp)
- **Email:** `owner@democorp.local`
- **Password:** `Owner@123`
- **Organization:** Demo Corporation (Enterprise Plan)

**Features Available:**
- Full organization management
- User management within organization
- AI module configuration
- Reports & analytics
- All organization features

### Organization Admin (Demo Corp)
- **Email:** `admin@democorp.local`
- **Password:** `Admin@123`
- **Organization:** Demo Corporation

**Features Available:**
- Organization administration
- Camera management
- Alert management
- People & vehicle management
- Attendance tracking
- Automation rules

### Editor (Demo Corp)
- **Email:** `editor@democorp.local`
- **Password:** `Editor@123`
- **Organization:** Demo Corporation

**Features Available:**
- Content management
- Limited feature access
- View-only for sensitive data

### Viewer (Demo Corp)
- **Email:** `viewer@democorp.local`
- **Password:** `Viewer@123`
- **Organization:** Demo Corporation

**Features Available:**
- Read-only access
- View dashboards
- View reports
- No modification permissions

## 🧪 Testing Checklist

### Authentication & Access
- [ ] Login as Super Admin
- [ ] Login as Organization Owner
- [ ] Login as Organization Admin
- [ ] Login as Editor
- [ ] Login as Viewer
- [ ] Verify role-based redirects
- [ ] Verify unauthorized access blocked

### Super Admin Features
- [ ] View Admin Dashboard
- [ ] Manage Organizations (Create, Edit, Toggle Status)
- [ ] Manage Users (Create, Edit, Delete, Toggle Status)
- [ ] Manage Licenses (Create, Activate, Suspend)
- [ ] Manage Subscription Plans
- [ ] View Edge Servers
- [ ] Manage Resellers
- [ ] System Settings
- [ ] Platform Branding
- [ ] Landing Page Settings
- [ ] SMS Settings
- [ ] Notification Priorities
- [ ] Updates/Announcements
- [ ] Backups (Create, Download, Restore)
- [ ] Super Admin Management
- [ ] AI Command Center
- [ ] AI Modules Admin
- [ ] Model Training
- [ ] System Monitor

### Organization Admin Features
- [ ] View Organization Dashboard
- [ ] Manage Cameras (Create, Edit, Delete, Test Connection)
- [ ] View & Manage Alerts (Acknowledge, Resolve, Mark False Alarm)
- [ ] Manage People (Create, Edit, Delete, Upload Photo)
- [ ] Manage Vehicles (Create, Edit, Delete, View Access Logs)
- [ ] Attendance (View Records, Daily Report, Manual Check-in/out)
- [ ] Automation Rules (Create, Edit, Delete, Test)
- [ ] AI Modules Configuration
- [ ] Analytics & Reports
- [ ] Team Management
- [ ] Settings (Organization, Servers, Notifications, Security)
- [ ] Live View

### Data Verification
- [ ] Verify 2 organizations exist
- [ ] Verify 7 users exist with correct roles
- [ ] Verify 11 cameras exist
- [ ] Verify 3 edge servers exist
- [ ] Verify 13 events/alerts exist
- [ ] Verify 8 registered people exist
- [ ] Verify 6 registered vehicles exist
- [ ] Verify 5 attendance records exist
- [ ] Verify 3 automation rules exist

## 🔧 Troubleshooting

### Password Issues

If passwords don't work, reset them:

```bash
cd apps/cloud-laravel
php artisan tinker
```

```php
// Reset Super Admin
$user = App\Models\User::where('email', 'superadmin@stc.local')->first();
$user->password = Hash::make('SuperAdmin@123');
$user->save();

// Reset Organization Admin
$user = App\Models\User::where('email', 'admin@democorp.local')->first();
$user->password = Hash::make('Admin@123');
$user->save();
```

### Database Connection Issues

1. Verify PostgreSQL is running
2. Check `.env` database credentials
3. Test connection:
   ```bash
   php artisan db:show
   ```

### API Connection Issues

1. Verify Laravel server is running on port 8000
2. Check CORS settings in `config/cors.php`
3. Verify `VITE_API_URL` in frontend `.env`
4. Check browser console for CORS errors

### Missing Data

1. Verify database import completed successfully
2. Check PostgreSQL logs for errors
3. Re-import database if needed
4. Verify sequences are reset

## 📊 Sample Data Summary

### Organizations
- **Demo Corporation** (Enterprise)
  - 10 cameras
  - 2 edge servers
  - All 9 AI modules
  - Full configuration

- **Test Company** (Professional)
  - 1 camera
  - 1 edge server
  - 4 AI modules

### Users
- 1 Super Admin
- 1 Organization Owner
- 2 Organization Admins (1 per org)
- 1 Operator
- 1 Editor
- 1 Viewer

### Other Data
- 3 Subscription Plans
- 2 Licenses
- 13 Events/Alerts
- 8 Registered People
- 6 Registered Vehicles
- 5 Attendance Records
- 3 Automation Rules
- 4 Integrations
- Multiple Notifications

## 📝 Notes

- All passwords are hashed using bcrypt
- All timestamps are relative to import time
- Edge servers include realistic system information
- Events include realistic metadata and severity levels
- All foreign key relationships are properly maintained
- Sample data represents a production-like scenario

## ✅ Final Verification

After setup, verify:

1. ✅ Database imported successfully
2. ✅ All users can login
3. ✅ All dashboards load correctly
4. ✅ All CRUD operations work
5. ✅ No console errors
6. ✅ No 401/403 errors
7. ✅ All API endpoints respond correctly
8. ✅ Role-based access control works
9. ✅ Data displays correctly
10. ✅ All features are functional

## 🎯 Next Steps

After successful setup:

1. Test all features with different user roles
2. Verify data relationships
3. Test API endpoints directly
4. Review logs for any errors
5. Customize branding and settings
6. Add additional test data as needed

---

**For detailed database information, see:** `apps/cloud-laravel/database/SEEDED_DATABASE_README.md`

