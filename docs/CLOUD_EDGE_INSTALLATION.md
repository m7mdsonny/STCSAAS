# 🛠️ دليل التنصيب الاحترافي لخادم السحابة (Laravel) والخادم المحلي (Edge)

هذا الدليل يختصر خطوات تجهيز خادم الـVPS (Laravel: باك اند + واجهة ويب) مع الخادم المحلي (Edge) الذي يشغّل الـAI ويزامن الميتاداتا فقط. جميع التعليمات تعتمد على الملفات الحالية في المستودع بعد إزالة أي مكونات غير مستخدمة.

## 🔎 نظرة سريعة
- **Cloud Laravel (VPS):** لوحة التحكم وواجهة الـAPI لإدارة التراخيص والمستخدمين والمنظمات والموزعين والأحداث والأوامر. قاعدة بيانات PostgreSQL مع مخطط وبيانات تجريبية جاهزة (`apps/cloud-laravel/database/schema.sql`).
- **Edge Server (محلي):** FastAPI لتشغيل نماذج الـAI والتكاملات وتخزين الوسائط محليًا. يبقى يعمل أوفلاين مع فترة سماح ترخيص 14 يومًا ويزامن الميتاداتا عند توفر الإنترنت.

> للحصول على نسخة نظيفة يمكن تشغيل سكربت التغليف `scripts/package.sh` ثم أخذ الأرشيف من `dist/latest.zip`.

---

## ☁️ نشر Laravel على الـVPS
1) **المتطلبات**
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx php8.2 php8.2-fpm php8.2-pgsql php8.2-xml php8.2-zip php8.2-mbstring composer nodejs npm postgresql git
```

2) **إعداد قاعدة البيانات**
```bash
sudo -u postgres createuser stc_cloud -P  # اختر كلمة مرور
sudo -u postgres createdb stc_cloud_db -O stc_cloud
```

3) **جلب الكود وبناء الواجهة**
```bash
cd /opt
sudo git clone https://github.com/your-org/STC-Solutions.git
sudo chown -R $USER:$USER STC-Solutions
cd STC-Solutions/apps/cloud-laravel
cp .env.example .env
# عدّل DB_HOST/DB_PORT/DB_DATABASE/DB_USERNAME/DB_PASSWORD و MAIL_/FCM المعتمدة
composer install --no-dev --optimize-autoloader
npm install && npm run build
php artisan key:generate
# استيراد البيانات الجاهزة
psql -U stc_cloud -d stc_cloud_db -f database/schema.sql
php artisan migrate --seed   # اختياري إذا لم تستورد المخطط
```

4) **تشغيل الخدمة (Production)**
- ملف خدمة systemd `/etc/systemd/system/stc-cloud.service`:
```ini
[Unit]
Description=STC Cloud Laravel
After=network.target

[Service]
User=www-data
WorkingDirectory=/opt/STC-Solutions/apps/cloud-laravel
EnvironmentFile=/opt/STC-Solutions/apps/cloud-laravel/.env
ExecStart=/usr/bin/php /opt/STC-Solutions/apps/cloud-laravel/artisan serve --host=127.0.0.1 --port=8000
Restart=always

[Install]
WantedBy=multi-user.target
```
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now stc-cloud
```

- إعداد Nginx عكسي (مثال `/etc/nginx/sites-available/stc-cloud`):
```nginx
server {
    listen 80;
    server_name your.domain.com;

    root /opt/STC-Solutions/apps/cloud-laravel/public;
    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.2-fpm.sock;
    }
}
```
```bash
sudo ln -s /etc/nginx/sites-available/stc-cloud /etc/nginx/sites-enabled/stc-cloud
sudo nginx -t && sudo systemctl reload nginx
```

---

## 🖥️ نشر Edge (محلي)
1) **المتطلبات**
```bash
sudo apt install -y python3.11 python3.11-venv ffmpeg libgl1
```
2) **إعداد المشروع**
```bash
cd /opt/STC-Solutions/apps/edge-server
python3.11 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cp .env.example .env  # عيّن CLOUD_API_URL و LICENSE_KEY وبقية الإعدادات
```
3) **تشغيل تجريبي**
```bash
uvicorn main:app --host 0.0.0.0 --port 8080
```
4) **بناء EXE (على بيئة ويندوز أو cross-build)**
```bash
./scripts/build_installer.sh
# سيُنشئ الملف التنفيذي تحت dist/
```

---

## 🔗 نقاط الربط الأساسية
- Edge يتحقق من الترخيص عبر Laravel: `POST /api/license/validate` (يطبق فترة السماح 14 يومًا ويحفظها محليًا).
- نبضات الصحة: `POST /api/edges/heartbeat` مع `hardware_id` و`version` لتحديث الحالة في السحابة.
- رفع الميتاداتا فقط (دون صور/فيديو): `POST /api/edges/events`.
- الأوامر من السحابة: `GET /api/edges/{hardware_id}/commands` ثم `POST /api/edges/commands/{id}/ack` بعد التنفيذ.

## ✅ قائمة تحقق سريعة
- استوردت قاعدة البيانات الجاهزة (أو شغلت `migrate --seed`).
- ملف `.env` في Laravel يحتوي مفاتيح البريد/الإشعارات (FCM) وبيانات DB.
- ملف `.env` في Edge يحتوي `CLOUD_API_URL` و`LICENSE_KEY` ومسارات الكاميرات/التكاملات.
- اختبار دخول الويب عبر المتصفح، واختبار API الترخيص من Edge بنجاح.
- مزامنة الأحداث تظهر في جداول Laravel بدون أعطال.
