# 🚀 STC AI-VAP - Quick Start Guide

## Installation in 3 Steps

### Step 1: Import Database
```bash
createdb -U postgres stc_cloud
psql -U postgres -d stc_cloud -f apps/cloud-laravel/database/stc_cloud_clean.sql
```

### Step 2: Configure Laravel
```bash
cd apps/cloud-laravel
cp .env.example .env
# Edit .env:
# DB_DATABASE=stc_cloud
# DB_USERNAME=postgres
# DB_PASSWORD=your_password

php artisan key:generate
```

### Step 3: Start Server
```bash
php artisan serve
```

Visit: `http://localhost:8000/login`

---

## 🔐 Login Credentials

### Super Admin
- **Email:** superadmin@demo.local
- **Password:** Super@12345

### Organization Admin
- **Email:** admin@org1.local
- **Password:** Admin@12345

---

## ✅ What's Included

- ✅ 4 Users (Super Admin, Org Admin, Operator, Viewer)
- ✅ 9 AI Modules (Fire, Face Recognition, ANPR, PPE, Weapons, etc.)
- ✅ 10 Cameras
- ✅ 2 Edge Servers
- ✅ 100+ Sample Events
- ✅ 50+ Notifications
- ✅ 4 Integrations (Arduino, SMS, WhatsApp, Email)
- ✅ 1 Full License (expires in 1 year)

---

## 📚 Documentation

- **Full Credentials:** See `apps/cloud-laravel/CREDENTIALS.md`
- **Changes Log:** See `CHANGES_LOG.md`
- **Project README:** See `README.md`

---

## 🐛 Troubleshooting

**Can't login?**
```bash
php artisan cache:clear
php artisan config:clear
```

**Database connection error?**
Check `.env` file has correct database credentials.

**Session error?**
Make sure `sessions` table exists in database.

---

## ⚠️ Important

- These are DEMO credentials
- Change passwords before production
- Database includes realistic test data
- No Supabase - pure Laravel/PostgreSQL

---

**Support:** support@stc-solutions.com
