# Database Deployment Guide - STC AI-VAP

## 📋 Overview

This guide provides step-by-step instructions for deploying a clean, production-ready PostgreSQL database for the STC AI-VAP platform.

---

## 🎯 Prerequisites

- PostgreSQL 12+ installed and running
- Database user with CREATE DATABASE privileges
- Access to the server via SSH or direct database access
- Laravel application configured with database credentials

---

## 🚀 Method 1: Direct SQL Import (Recommended for Fresh Install)

### Step 1: Create Database

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database
CREATE DATABASE stc_cloud_production;

# Create user (if needed)
CREATE USER stc_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE stc_cloud_production TO stc_user;

# Exit psql
\q
```

### Step 2: Import SQL File

```bash
# Navigate to Laravel project
cd /www/wwwroot/api.stcsolutions.online

# Import SQL file
psql -U stc_user -d stc_cloud_production < database/stc_cloud_production_clean.sql

# Or if using postgres user
sudo -u postgres psql -d stc_cloud_production < database/stc_cloud_production_clean.sql
```

### Step 3: Verify Import

```bash
psql -U stc_user -d stc_cloud_production -c "SELECT COUNT(*) FROM users;"
# Should return: 4

psql -U stc_user -d stc_cloud_production -c "SELECT COUNT(*) FROM organizations;"
# Should return: 1
```

---

## 🔄 Method 2: Laravel Migrations (Recommended for Development)

### Step 1: Configure .env

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=stc_cloud_production
DB_USERNAME=stc_user
DB_PASSWORD=your_secure_password
```

### Step 2: Run Migrations

```bash
cd /www/wwwroot/api.stcsolutions.online

# Fresh migration (WARNING: Drops all tables)
php artisan migrate:fresh

# Run seeders
php artisan db:seed --class=LandingContentSeeder
php artisan db:seed --class=DatabaseSeeder
```

### Step 3: Verify

```bash
php artisan tinker
```

```php
// Check users
\App\Models\User::count(); // Should return 4

// Check organizations
\App\Models\Organization::count(); // Should return 1

// Test login
$user = \App\Models\User::where('email', 'superadmin@stc-solutions.com')->first();
$user->isSuperAdmin(); // Should return true
```

---

## ✅ Post-Deployment Verification

### 1. Test Database Connection

```bash
php artisan tinker
```

```php
DB::connection()->getPdo();
// Should return PDO object without errors
```

### 2. Test API Endpoints

```bash
# Public landing page
curl https://api.stcsolutions.online/api/v1/public/landing

# Should return JSON with landing content
```

### 3. Test Authentication

```bash
# Login
curl -X POST https://api.stcsolutions.online/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@stc-solutions.com","password":"Super@12345"}'

# Should return access_token
```

### 4. Verify Tables

```bash
psql -U stc_user -d stc_cloud_production -c "\dt"
# Should list all 30 tables
```

---

## 🔧 Troubleshooting

### Issue: Foreign Key Constraint Errors

**Solution:** Ensure tables are created in the correct order. The SQL file handles this automatically.

### Issue: Sequence Errors

**Solution:** Reset sequences:
```sql
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('organizations_id_seq', (SELECT MAX(id) FROM organizations));
```

### Issue: Permission Denied

**Solution:** Grant proper permissions:
```sql
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO stc_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO stc_user;
```

### Issue: Connection Refused

**Solution:** Check PostgreSQL is running:
```bash
sudo systemctl status postgresql
sudo systemctl start postgresql
```

### Issue: Encoding Errors

**Solution:** Ensure database uses UTF-8:
```sql
CREATE DATABASE stc_cloud_production WITH ENCODING 'UTF8';
```

---

## 📊 Database Schema Summary

### Core Tables (30 total)
- **distributors** - Master distributors
- **resellers** - Reseller partners
- **subscription_plans** - Available plans
- **organizations** - Tenant organizations
- **users** - System users
- **licenses** - Organization licenses
- **edge_servers** - Edge server instances
- **cameras** - Camera configurations
- **events** - AI detection events
- **notifications** - User notifications
- **platform_contents** - Landing page content
- **system_settings** - Platform settings
- **integrations** - External integrations
- **updates** - System announcements
- **device_tokens** - FCM tokens
- **ai_commands** - AI command queue
- And 15 more...

### Relationships
- Organizations → Users (1:N)
- Organizations → Edge Servers (1:N)
- Edge Servers → Cameras (1:N)
- Organizations → Licenses (1:N)
- Users → Notifications (1:N)
- Edge Servers → Events (1:N)

---

## 🔐 Security Notes

1. **Change Default Passwords** - Update all demo passwords in production
2. **Restrict Database Access** - Use firewall rules to limit PostgreSQL access
3. **Use SSL Connections** - Enable SSL for database connections in production
4. **Regular Backups** - Set up automated database backups
5. **Monitor Logs** - Check PostgreSQL logs for errors

---

## 📝 Next Steps

1. ✅ Database imported successfully
2. ✅ Verify all tables exist
3. ✅ Test API endpoints
4. ✅ Update `.env` with production credentials
5. ✅ Configure Laravel cache and sessions
6. ✅ Set up automated backups
7. ✅ Review and update demo credentials

---

## 📚 Related Files

- `stc_cloud_production_clean.sql` - Complete database schema + seed data
- `DEMO_CREDENTIALS.md` - Login credentials and API tokens
- `LARAVEL_API_FIX.md` - API troubleshooting guide

---

**Last Updated:** January 2, 2025  
**Version:** 2.0.0

