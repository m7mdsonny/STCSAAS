# ⚡️ التنصيب السريع بنمط SaaS (Laravel + Edge)

إعداد يشبه حزم CodeCanyon: باك اند وواجهة Laravel جاهزان مع بيانات تجريبية، خادم Edge محلي، وتطبيق Flutter.

## المتطلبات السريعة
- VPS Ubuntu 22.04 مع صلاحيات sudo.
- PostgreSQL 14+.
- PHP 8.2 + Composer + Node.js 18.
- Python 3.11 (لـ Edge) + ffmpeg/libgl1.

## خطوات السحابة (Laravel)
1. **تجهيز قاعدة البيانات**
   ```bash
   sudo apt install postgresql -y
   sudo -u postgres psql -c "CREATE DATABASE stc_cloud;"
   sudo -u postgres psql -c "CREATE USER stc_user WITH ENCRYPTED PASSWORD 'stc_pass';"
   sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE stc_cloud TO stc_user;"
   ```
2. **إعداد المشروع**
   ```bash
   cd apps/cloud-laravel
   cp .env.example .env
   # عيّن DB_DATABASE=stc_cloud و DB_USERNAME=stc_user و DB_PASSWORD=stc_pass
   composer install --no-dev --optimize-autoloader
   npm install && npm run build
   php artisan key:generate
   psql -U stc_user -d stc_cloud -f database/schema.sql
   php artisan serve --host 0.0.0.0 --port 8000
   ```
3. **بيانات الدخول التجريبية**
   - البريد: `admin@example.com`
   - كلمة المرور: `admin`
   - الترخيص: `DEMO-LICENSE-KEY`
   - Edge Hardware ID للتجارب: `EDGE-DEMO-HW`

## خطوات Edge السريع
```bash
cd apps/edge-server
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # حدّد CLOUD_API_URL و LICENSE_KEY
uvicorn main:app --host 0.0.0.0 --port 8080
```
افتح `http://localhost:8080/setup` وأدخل رابط Laravel والترخيص.

## نقاط تماس
- **API الأساس:** `https://your-domain.com/api`
- **واجهة Laravel:** `https://your-domain.com/`
- **الأحداث من Edge:** `POST /api/edges/events`
- **الترخيص:** `POST /api/license/validate`

## تنظيف سريع
```bash
rm -f apps/cloud-laravel/storage/*.sqlite
php artisan migrate:fresh --seed
```

> الإعداد السابق يوفر تجربة SaaS جاهزة للعرض مع بيانات كاملة، ويب + API في حزمة Laravel واحدة، وخادم Edge متكامل.
